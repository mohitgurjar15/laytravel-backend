import { Injectable, NotFoundException } from "@nestjs/common";
import { UserRepository } from "src/auth/user.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { MailerService } from "@nestjs-modules/mailer";
import { Role } from "src/enum/role.enum";
import { Activity } from "src/utility/activity.utility";
import * as config from "config";
const mailConfig = config.get("email");
import { ConvertCustomerMail } from "src/config/email_template/convert-user-mail.html";
import { FlightService } from "src/flight/flight.service";
import { AdvancedConsoleLogger, getConnection, getManager } from "typeorm";
import { Booking } from "src/entity/booking.entity";
import { BookingRepository } from "src/booking/booking.repository";
import { BookingInstalments } from "src/entity/booking-instalments.entity";
import { BookingType } from "src/enum/booking-type.enum";
import { PaymentStatus } from "src/enum/payment-status.enum";
import { PaymentService } from "src/payment/payment.service";
import { FailedPaymentAttempt } from "src/entity/failed-payment-attempt.entity";
import { missedPaymentInstallmentMail } from "src/config/email_template/missed-payment-installment-mail.html";
import { PaymentInstallmentMail } from "src/config/email_template/payment-installment-mail.html";
import { BookingStatus } from "src/enum/booking-status.enum";
import * as moment from "moment";
import { ignoreElements } from "rxjs/operators";
import { OtherPayments } from "src/entity/other-payment.entity";
import { BookFlightDto } from "src/flight/dto/book-flight.dto";
import { LayCreditEarn } from "src/entity/lay-credit-earn.entity";
import { BookingFailerMail } from "src/config/email_template/booking-failure-mail.html";


@Injectable()
export class CronJobsService {
	constructor(
		@InjectRepository(UserRepository)
		private userRepository: UserRepository,

		@InjectRepository(BookingRepository)
		private bookingRepository: BookingRepository,

		private flightService: FlightService,

		private paymentService: PaymentService,
		private readonly mailerService: MailerService

	) { }

	async convertCustomer() {
		try {
			var toDate = new Date();

			var todayDate = toDate.toISOString();
			todayDate = todayDate
				.replace(/T/, " ") // replace T with a space
				.replace(/\..+/, "");

			const result = await this.userRepository.query(
				`SELECT "User"."user_id","User"."next_subscription_date","User"."email","User"."first_name","User"."last_name"  FROM "user" "User" WHERE "User"."role_id" = ${Role.PAID_USER} AND DATE("User"."next_subscription_date") < '${todayDate}'`
			);
			console.log(result);
			const updateQuery = await this.userRepository.query(
				`UPDATE "user" 
                SET "role_id"=6 , updated_date='${todayDate}',updated_by = '1c17cd17-9432-40c8-a256-10db77b95bca'  WHERE "role_id" = ${Role.PAID_USER} AND DATE("next_subscription_date") < '${todayDate}'`
			);
			for (let index = 0; index < result.length; index++) {
				const data = result[index];

				this.mailerService
					.sendMail({
						to: data.email,
						from: mailConfig.from,
						cc: mailConfig.BCC,
						subject: `Subscription Expired`,
						html: ConvertCustomerMail({
							username: data.first_name + " " + data.last_name,
							date: data.next_subscription_date,
						}),
					})
					.then((res) => {
						console.log("res", res);
					})
					.catch((err) => {
						console.log("err", err);
					});
				Activity.logActivity(
					"1c17cd17-9432-40c8-a256-10db77b95bca",
					"cron",
					`${data.email} is Convert customer to free user because subscription plan is not done by customer`
				);
			}

			console.log(updateQuery);
		} catch (error) {
			console.log(error);
		}
	}



	async checkPandingFlights() {
		let query = getManager()
			.createQueryBuilder(Booking, "booking")
			.select([
				"booking.supplierBookingId",
				"booking.id"
			])
			.where(
				`"booking"."is_ticketd"= false and "booking"."fare_type" = 'GDS' and "booking"."is_predictive" = false`
			)

		const result = await query.getMany();

		var total = 0;

		for (let index = 0; index < result.length; index++) {
			const element = result[index];

			// console.log(element.supplierBookingId);

			var responce: any = await this.flightService.ticketFlight(element.supplierBookingId);

			// var booking =  await this.bookingRepository.findOne({id:element.id});
			if (responce.status == true) {
				var queryData = await getConnection()
					.createQueryBuilder()
					.update(Booking)
					.set({ isTicketd: true })
					.where("id = :id", { id: element.id })
					.execute();

				// queryData.affected ? console.log(`${element.id} is updated`) : 
				// booking.isTicketd = true;
				// await booking.save()

				total = total + queryData.affected;
			}
		}

		return { message: `${total} bookings are updated` }
	}


	async partialPayment() {
		const date = new Date();
		let paidInstallment = [];
		var currentDate = date.toISOString();
		currentDate = currentDate
			.replace(/T/, " ") // replace T with a space
			.replace(/\..+/, "");
		let query = getManager()
			.createQueryBuilder(BookingInstalments, "BookingInstalments")
			.leftJoinAndSelect("BookingInstalments.booking", "booking")
			.leftJoinAndSelect("BookingInstalments.currency", "currency")
			.leftJoinAndSelect("BookingInstalments.user", "User")

			.select([
				"BookingInstalments.id",
				"BookingInstalments.bookingId",
				"BookingInstalments.userId",
				"BookingInstalments.instalmentType",
				"BookingInstalments.instalmentDate",
				"BookingInstalments.currencyId",
				"BookingInstalments.amount",
				"BookingInstalments.instalmentStatus",
				"booking.bookingType",
				"booking.bookingStatus",
				"booking.cardToken",
				"booking.currency",
				"booking.netRate",
				"booking.usdFactor",
				"booking.isTicketd",
				"currency.id",
				"currency.code",
				"currency.liveRate",
				"User.userId",
				"User.email",
				"User.phoneNo",
			])

			.where(`(DATE("BookingInstalments".instalment_date) = DATE('${currentDate}') ) AND ("BookingInstalments"."payment_status" = ${PaymentStatus.PENDING}) AND ("booking"."booking_type" = ${BookingType.INSTALMENT})`)

		const data = await query.getMany();
		//console.log(data)
		// const count = await query.getCount();
		if (!data.length) {
			throw new NotFoundException(
				`Partial Payment not available`
			);
		}


		for await (const instalment of data) {
			console.log(instalment);
			let amount = instalment.amount
			let currencyCode = instalment.currency.code
			let cardToken = instalment.booking.cardToken

			console.log('amount', amount)
			console.log('currencyCode', currencyCode)
			console.log('cardToken', cardToken)

			let transaction = await this.paymentService.getPayment(cardToken, amount, currencyCode)

			instalment.paymentStatus = transaction.status == true ? PaymentStatus.CONFIRM : PaymentStatus.FAILED
			instalment.paymentInfo = transaction.meta_data;
			instalment.transactionToken = transaction.token;
			instalment.comment = `Get Payment by cron on ${currentDate}`


			if (transaction.status == false) {
				let faildTransaction = new FailedPaymentAttempt()
				faildTransaction.instalmentId = instalment.id
				faildTransaction.paymentInfo = transaction.meta_data
				faildTransaction.date = new Date();

				await faildTransaction.save()
				let param = {
					message: transaction.meta_data.transaction.response.message,
					cardHolderName: transaction.meta_data.transaction.payment_method.full_name,
					cardNo: transaction.meta_data.transaction.payment_method.number,
					orderId: instalment.bookingId,
					amount: amount,
				}
				this.mailerService
					.sendMail({
						to: instalment.user.email,
						from: mailConfig.from,
						cc: mailConfig.BCC,
						subject: `Payment Failed Notification`,
						html: missedPaymentInstallmentMail(param),
					})
					.then((res) => {
						console.log("res", res);
					})
					.catch((err) => {
						console.log("err", err);
					});
				Activity.logActivity(
					"1c17cd17-9432-40c8-a256-10db77b95bca",
					"cron",
					`${instalment.id} Payment Failed by Cron`
				);
			}
			await instalment.save()

			let transactionData = {
				userId: instalment.userId,
				bookingId: instalment.bookingId,
				installmentId: instalment.id,
				PaymentStatus: transaction.status,
				paymentToken: transaction.token,
				amount: amount,
				currency_code: currencyCode,
				card_token: cardToken
			}

			let param = {
				date: instalment.instalmentDate,
				userName: instalment.user.firstName + ' ' + instalment.user.lastName,
				cardHolderName: transaction.meta_data.transaction.payment_method.full_name,
				cardNo: transaction.meta_data.transaction.payment_method.number,
				orderId: instalment.bookingId,
				amount: amount,
			}

			this.mailerService
				.sendMail({
					to: instalment.user.email,
					from: mailConfig.from,
					cc: mailConfig.BCC,
					subject: `Installment Payment Successed`,
					html: PaymentInstallmentMail(param),
				})
				.then((res) => {
					console.log("res", res);
				})
				.catch((err) => {
					console.log("err", err);
				});
			Activity.logActivity(
				"1c17cd17-9432-40c8-a256-10db77b95bca",
				"cron",
				`${instalment.id} Payment successed by Cron`
			);

			paidInstallment.push(transactionData)
		}
		return { data: paidInstallment };
	}

	async PendingPartialBooking(Headers) {
		let query = getManager()
			.createQueryBuilder(Booking, "booking")
			.leftJoinAndSelect("booking.currency2", "currency")
			.leftJoinAndSelect("booking.user", "User")
			.leftJoinAndSelect("booking.travelers", "traveler")
			// .select([
			// 	"booking.supplierBookingId",
			// 	"booking.id"
			// ])
			.where(
				`"booking"."booking_type"= ${BookingType.INSTALMENT} AND "booking"."booking_status"= ${BookingStatus.PENDING}`
			)

		const result = await query.getMany();

		var total = 0;
		//console.log(bookingData);
		for (let index = 0; index < result.length; index++) {
			var bookingData = result[index];
			let flights: any = null;
			
			var bookingType = bookingData.locationInfo['journey_type']

			let travelers = [];
			
			for await (const traveler of bookingData.travelers) {
				travelers.push({
					traveler_id : traveler.userId
				})
			}

			if (bookingType == 'oneway') {
				Headers['currency'] = bookingData.currency2.code
				Headers['language'] = 'en'

				let dto = {
					"source_location": bookingData.moduleInfo[0].departure_code,
					"destination_location": bookingData.moduleInfo[0].arrival_code,
					"departure_date":  await this.getDataTimefromString(bookingData.moduleInfo[0].departure_date),
					"flight_class": bookingData.moduleInfo[0].routes[0].stops[0].cabin_class,
					"adult_count": bookingData.moduleInfo[0].adult_count ? bookingData.moduleInfo[0].adult_count : 0,
					"child_count": bookingData.moduleInfo[0].child_count ? bookingData.moduleInfo[0].child_count : 0,
					"infant_count": bookingData.moduleInfo[0].infant_count ? bookingData.moduleInfo[0].infant_count : 0
				}

				flights = await this.flightService.searchOneWayFlight(dto, Headers, bookingData.user);

			}
			else {
				Headers['currency'] = bookingData.currency2.code
				Headers['language'] = 'en'

				let dto = {
					"source_location": bookingData.moduleInfo[0].departure_code,
					"destination_location": bookingData.moduleInfo[0].arrival_code,
					"departure_date": await this.getDataTimefromString(bookingData.moduleInfo[0].departure_date),
					"flight_class": bookingData.moduleInfo[0].routes[0].stops[0].cabin_class,
					"adult_count": bookingData.moduleInfo[0].adult_count ? bookingData.moduleInfo[0].adult_count : 0,
					"child_count": bookingData.moduleInfo[0].child_count ? bookingData.moduleInfo[0].child_count : 0,
					"infant_count": bookingData.moduleInfo[0].infant_count ? bookingData.moduleInfo[0].infant_count : 0,
					"arrival_date": await this.getDataTimefromString(bookingData.moduleInfo[0].arrival_code)
				}

				flights = await this.flightService.searchOneWayFlight(dto, Headers, bookingData.user);
			}
			for await (const flight of flights.items) {
				if (flight.unique_code == bookingData.moduleInfo[0].unique_code) {
					const markups = await this.flightService.applyPreductionMarkup(bookingData.totalAmount)

					const savedDate = new Date(bookingData.predectedBookingDate);
					var predictedDate = savedDate.toISOString();
					predictedDate = predictedDate
						.replace(/T/, " ") // replace T with a space
						.replace(/\..+/, "");
					const date = new Date();
					var todayDate = date.toISOString();
					todayDate = todayDate
						.replace(/T/, " ") // replace T with a space
						.replace(/\..+/, "");
					const bookingDto = new BookFlightDto
					bookingDto.travelers = travelers
					bookingDto.payment_type = `${bookingData.bookingType}`;
					bookingDto.instalment_type = `${bookingData.bookingType}`
					bookingDto.route_code = flight.route_code;
					bookingDto.additional_amount = 0
					bookingDto.laycredit_points = 0 

					const user = bookingData.user

					const bookingId = bookingData.laytripBookingId;
					if (flight.routes[0].stops[0].below_minimum_seat == true) {
						console.log(`rule 1 :- flight below minimum`)
						const query = await this.flightService.partiallyBookFlight(bookingDto,Headers,user,bookingId)
						Activity.logActivity(
							"1c17cd17-9432-40c8-a256-10db77b95bca",
							"cron",
							`${bookingData.laytripBookingId} is Book by cron with (rule 1 :- flight below minimum)`
						);
						this.sendFlightConfirmationMail(bookingData.laytripBookingId,user.email)
					}
					else if (bookingData.netRate > flight.net_rate) {
						console.log(`rule 2 :- flight net rate less than the user book net rate`)
						const query = await this.flightService.partiallyBookFlight(bookingDto,Headers,user,bookingId)
						Activity.logActivity(
							"1c17cd17-9432-40c8-a256-10db77b95bca",
							"cron",
							`${bookingData.laytripBookingId} is Book by cron with (rule 2 :- flight net rate less than the user book net rate)`
						);
						this.sendFlightConfirmationMail(bookingData.laytripBookingId,user.email)
					}
					else if (flight.selling_price > markups.maxPrice || predictedDate == todayDate) {
						console.log(`rule 3 :- flight net rate less than the preduction markup max amount`)
						const query = await this.flightService.partiallyBookFlight(bookingDto,Headers,user,bookingId)
						Activity.logActivity(
							"1c17cd17-9432-40c8-a256-10db77b95bca",
							"cron",
							`${bookingData.laytripBookingId} is Book by cron with (rule 3 :- flight net rate less than the preduction markup max amount)`
						);
						this.sendFlightConfirmationMail(bookingData.laytripBookingId,user.email)
					}
					
				}
			}

		}
		return result[0]
		//return { message: `${total} bookings are updated` }
	}

	async updateFlightBookingInProcess() {
		let query = getManager()
			.createQueryBuilder(Booking, "booking")
			.leftJoinAndSelect("booking.user", "User")
			.select([
				"booking.supplierBookingId",
				"booking.id",
				"User.email",
				"booking.laytripBookingId"
			])
			.where(
				`"booking"."supplier_status" = 0 and "booking"."supplier_booking_id" !=''`
			)

		const result = await query.getMany();

		for (let booking of result) {

			let tripDetails: any = await this.flightService.tripDetails(booking.supplierBookingId);
			if (tripDetails.booking_status == 'Not Booked') {

				const voidCard = await this.paymentService.voidCard(booking.cardToken)

				if (voidCard.status == true) {
					// const transaction = new OtherPayments;

					// transaction.bookingId = booking.id;
					// transaction.userId = booking.userId;
					// transaction.currencyId = booking.currency;
					// transaction.amount = booking.totalAmount;
					// transaction.paidFor = `Void card`
					// transaction.comment = `transaction failed at update booking by cron`
					// transaction.transactionId = voidCard.token
					// transaction.paymentInfo = voidCard.meta_data
					// transaction.paymentStatus = PaymentStatus.CANCELLED
					// transaction.createdBy = "1c17cd17-9432-40c8-a256-10db77b95bca"
					// transaction.createdDate = new Date()

					//const transactionId = await transaction.save();

					await getConnection()
						.createQueryBuilder()
						.update(Booking)
						.set({ bookingStatus: BookingStatus.FAILED , paymentStatus : PaymentStatus.REFUNDED , paymentInfo : voidCard.meta_data})
						.where("supplier_booking_id = :id", { id: booking.supplierBookingId })
						.execute();
					
					this.sendFlightFailerMail(booking.user.email,booking.laytripBookingId)
				}


				// void card & update booking status in DB & send email to customer
			}

			if (tripDetails.booking_status == "") {

				if (tripDetails.ticket_status == 'Ticketed') {
					await getConnection()
						.createQueryBuilder()
						.update(Booking)
						.set({ isTicketd: true, supplierStatus: 1 })
						.where("supplier_booking_id = :id", { id: booking.supplierBookingId })
						.execute();
				}
			}

			if (tripDetails.booking_status == 'Booked') {

				let ticketDetails: any = await this.flightService.ticketFlight(booking.supplierBookingId);
				//return ticketDetails; 
				let newTripDetails: any = await this.flightService.tripDetails(booking.supplierBookingId);
				if (newTripDetails.ticket_status == 'Ticketed') {
					await getConnection()
						.createQueryBuilder()
						.update(Booking)
						.set({ isTicketd: true, supplierStatus: 1 })
						.where("supplier_booking_id = :id", { id: booking.supplierBookingId })
						.execute();
				}

				//if TicketStatus = TktInProgress call it again
			}
		}
	}

	async getDataTimefromString(dateTime) {
		var date = dateTime.split('/')
		console.log(date);

		return `${date[2]}-${date[1]}-${date[0]}`
		
	}

	async sendFlightConfirmationMail(bookingID,emailId)
	{
		console.log(`bookingId`,bookingID);
		console.log(`bookingId`,emailId);
	}

	async sendFlightFailerMail(email,bookingId,error = null)
	{
		this.mailerService
		.sendMail({
			to: email,
			from: mailConfig.from,
			cc:mailConfig.BCC,
			subject: "Booking Failer Mail",
			html: BookingFailerMail({
				error:error,
			},bookingId),
		})
		.then((res) => {
			console.log("res", res);
		})
		.catch((err) => {
			console.log("err", err);
		});
	}
}
