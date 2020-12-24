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
import { BookFlightDto } from "src/flight/dto/book-flight.dto";
import { LayCreditEarn } from "src/entity/lay-credit-earn.entity";
import { BookingFailerMail } from "src/config/email_template/booking-failure-mail.html";
import { RewordStatus } from "src/enum/reword-status.enum";
import { LaytripPointsType } from "src/enum/laytrip-point-type.enum";
import { PaidFor } from "src/enum/paid-for.enum";
import { PredictiveBookingData } from "src/entity/predictive-booking-data.entity";
import { InstalmentStatus } from "src/enum/instalment-status.enum";
import { getBookingDailyPriceDto } from "./dto/get-daily-booking-price.dto";
import { Generic } from "src/utility/generic.utility";
import { PushNotification } from "src/utility/push-notification.utility";
import { PaymentReminderMail } from "src/config/email_template/payment-reminder.html";
import { UserDeviceDetail } from "src/entity/user-device-detail.entity";
import { DateTime } from "src/utility/datetime.utility";
import { ModulesName } from "src/enum/module.enum";
import { VacationRentalService } from "src/vacation-rental/vacation-rental.service";
import { Translation } from "src/utility/translation.utility";
import { WebNotification } from "src/utility/web-notification.utility";
const AWS = require('aws-sdk');
var fs = require('fs');



@Injectable()
export class CronJobsService {
	constructor(
		@InjectRepository(UserRepository)
		private userRepository: UserRepository,

		@InjectRepository(BookingRepository)
		private bookingRepository: BookingRepository,

		private flightService: FlightService,

		private paymentService: PaymentService,

		private readonly mailerService: MailerService,

		private vacationRentalService: VacationRentalService

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

				PushNotification.sendNotificationTouser(data.userId,
					{  //you can send only notification or only data(or include both)
						module_name: 'user',
						task: 'user_convert',
						userId: data.userId
					},
					{
						title: 'We not capture subscription',
						body: `Just a friendly reminder that we not able to capture your subscription so we have convert your account to free user please subscribe manully`
					}, "1c17cd17-9432-40c8-a256-10db77b95bca")
				WebNotification.sendNotificationTouser(data.userId,
					{  //you can send only notification or only data(or include both)
						module_name: 'user',
						task: 'user_convert',
						userId: data.userId
					},
					{
						title: 'We not capture subscription',
						body: `Just a friendly reminder that we not able to capture your subscription so we have convert your account to free user please subscribe manully`
					}, "1c17cd17-9432-40c8-a256-10db77b95bca")

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
				"booking.id",
				"booking.laytripBookingId"
			])
			.where(
				`"booking"."is_ticketd"= false and "booking"."fare_type" = 'GDS' and "booking"."is_predictive" = false`
			)

		const result = await query.getMany();

		var total = 0;
		var failedlogArray = '';
		for (let index = 0; index < result.length; index++) {
			try {

				const element = result[index];

				// console.log(element.supplierBookingId);

				var responce: any = await this.flightService.ticketFlight(element.supplierBookingId);
			} catch (error) {
				console.log(error);
				const filename = `update-pending-flight-cron-failed-` + result[index].laytripBookingId + '-' + new Date().getTime() + '.json'

				Activity.createlogFile(filename, JSON.stringify(result[index]) + '-----------------------error-----------------------' + JSON.stringify(error), 'flight')
				failedlogArray += `<p>BookingId:- ${result[index].laytripBookingId}-----Log file----->/var/www/src/flight/${filename}</p> <br/>`
			}
		}
		if (failedlogArray != '') {
			this.cronfailedmail('cron fail for given booking id please check log files: <br/>' + failedlogArray, 'update pending flight cron failed')
		}
		throw new NotFoundException('update_booking_cron')
		return { message: await Translation.Translater('ES', 'responce', 'update_booking_cron') };
		// message: await Translation.Translater('ES', 'responce', 'update_booking_cron')
	}


	async partialPayment() {
		const date = new Date();
		let paidInstallment = [];
		var currentDate = date.toISOString();
		currentDate = currentDate
			.replace(/T/, " ") // replace T with a space
			.replace(/\..+/, "");
		var fromDate = new Date();
		fromDate.setDate(fromDate.getDate() - 2);
		var nextDate = fromDate.toISOString();
		nextDate = nextDate
			.replace(/T/, " ") // replace T with a space
			.replace(/\..+/, "");

		let query = getManager()
			.createQueryBuilder(BookingInstalments, "BookingInstalments")
			.leftJoinAndSelect("BookingInstalments.booking", "booking")
			.leftJoinAndSelect("BookingInstalments.currency", "currency")
			.leftJoinAndSelect("BookingInstalments.user", "User")

			// .select([
			// 	"BookingInstalments.id",
			// 	"BookingInstalments.bookingId",
			// 	"BookingInstalments.userId",
			// 	"BookingInstalments.instalmentType",
			// 	"BookingInstalments.instalmentDate",
			// 	"BookingInstalments.currencyId",
			// 	"BookingInstalments.amount",
			// 	"BookingInstalments.instalmentStatus",
			// 	"booking.bookingType",
			// 	"booking.bookingStatus",
			// 	"booking.cardToken",
			// 	"booking.currency",
			// 	"booking.netRate",
			// 	"booking.usdFactor",
			// 	"booking.isTicketd",
			// 	"currency.id",
			// 	"currency.code",
			// 	"currency.liveRate",
			// 	"User.userId",
			// 	"User.email",
			// 	"User.phoneNo",
			// ])

			.where(`(DATE("BookingInstalments".instalment_date) <= DATE('${currentDate}') ) AND (DATE("BookingInstalments".instalment_date) >= DATE('${nextDate}') ) AND ("BookingInstalments"."payment_status" = ${PaymentStatus.PENDING}) AND ("booking"."booking_type" = ${BookingType.INSTALMENT}) AND ("booking"."booking_status" In (${BookingStatus.CONFIRM},${BookingStatus.PENDING}))`)

		const data = await query.getMany();
		//console.log(data)
		// const count = await query.getCount();
		if (!data.length) {
			throw new NotFoundException(
				`Partial Payment not available`
			);
		}

		var failedlogArray = '';
		for await (const instalment of data) {

			try {

				console.log('installment amount', instalment.amount);

				let amount: number = Generic.formatPriceDecimal(parseFloat(instalment.amount))
				let currencyCode = instalment.currency.code
				let cardToken = instalment.booking.cardToken
				amount = amount * 100
				amount = Math.ceil(amount)
				console.log('amount', amount)
				console.log('currencyCode', currencyCode)
				console.log('cardToken', cardToken)

				if (cardToken) {
					let transaction = await this.paymentService.getPayment(cardToken, amount, currencyCode)

					console.log(transaction)

					instalment.paymentStatus = transaction.status == true ? PaymentStatus.CONFIRM : PaymentStatus.PENDING
					instalment.paymentInfo = transaction.meta_data;
					instalment.transactionToken = transaction.token;
					instalment.paymentCaptureDate = new Date();
					instalment.attempt = instalment.attempt ? instalment.attempt + 1 : 1;
					instalment.instalmentStatus = transaction.status == true ? PaymentStatus.CONFIRM : PaymentStatus.PENDING
					instalment.comment = `try to get Payment by cron on ${currentDate}`
					await instalment.save()

					console.log(transaction.status);

					if (transaction.status == false) {

						let faildTransaction = new FailedPaymentAttempt()
						faildTransaction.instalmentId = instalment.id
						faildTransaction.paymentInfo = transaction.meta_data
						faildTransaction.date = new Date();

						await faildTransaction.save()
						var availableTry = ''

						if (instalment.attempt == 1) {
							availableTry = 'two'

						} else {
							availableTry = instalment.attempt == 2 ? 'one' : 'zero'
						}

						let param = {
							date: DateTime.convertDateFormat(instalment.instalmentDate, 'yyyy-mm-dd', 'MM/DD/YYYY'),
							amount: amount,
							available_try: availableTry,
							payment_dates: DateTime.convertDateFormat(new Date(nextDate), 'YYYY-MM-DD', 'MM/DD/YYYY'),
							currency: instalment.currency.symbol
						}
						if (instalment.attempt >= 3) {
							await getConnection()
								.createQueryBuilder()
								.update(Booking)
								.set({ bookingStatus: BookingStatus.NOTCOMPLETED, paymentStatus: PaymentStatus.FAILED })
								.where("id = :id", { id: instalment.bookingId })
								.execute();
							await this.sendFlightFailerMail(instalment.user.email, instalment.booking.laytripBookingId, 'we not able to get payment from your card')
							PushNotification.sendNotificationTouser(instalment.user.userId,
								{  //you can send only notification or only data(or include both)
									module_name: 'booking',
									task: 'booking_cancelled',
									bookingId: instalment.booking.laytripBookingId
								},
								{
									title: 'booking Cancelled',
									body: `we have unfortunately had to cancel your booking and we will not be able to issue any refund.`
								}, "1c17cd17-9432-40c8-a256-10db77b95bca")
							WebNotification.sendNotificationTouser(instalment.user.userId,
								{  //you can send only notification or only data(or include both)
									module_name: 'booking',
									task: 'booking_cancelled',
									bookingId: instalment.booking.laytripBookingId
								},
								{
									title: 'booking Cancelled',
									body: `we have unfortunately had to cancel your booking and we will not be able to issue any refund.`
								}, "1c17cd17-9432-40c8-a256-10db77b95bca")

							instalment.paymentStatus = PaymentStatus.FAILED
							await instalment.save()
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

						PushNotification.sendNotificationTouser(instalment.user.userId,
							{  //you can send only notification or only data(or include both)
								module_name: 'instalment',
								task: 'instalment_failed',
								bookingId: instalment.booking.laytripBookingId,
								instalmentId: instalment.id
							},
							{
								title: 'Instalment Failed',
								body: `We were not able on our ${instalment.attempt} time and final try to successfully collect your $${instalment.amount} installment payment from your credit card on file that was scheduled for ${instalment.instalmentDate}`
							}, "1c17cd17-9432-40c8-a256-10db77b95bca")
						WebNotification.sendNotificationTouser(instalment.user.userId,
							{  //you can send only notification or only data(or include both)
								module_name: 'instalment',
								task: 'instalment_failed',
								bookingId: instalment.booking.laytripBookingId,
								instalmentId: instalment.id
							},
							{
								title: 'Instalment Failed',
								body: `We were not able on our ${instalment.attempt} time and final try to successfully collect your $${instalment.amount} installment payment from your credit card on file that was scheduled for ${instalment.instalmentDate}`
							}, "1c17cd17-9432-40c8-a256-10db77b95bca")

					}
					else {
						//console.log('nextDate');

						const nextInstalmentDate = await getManager()
							.createQueryBuilder(BookingInstalments, "BookingInstalments")
							.select(['BookingInstalments.instalmentDate'])
							.where(`"BookingInstalments"."instalment_status" =${InstalmentStatus.PENDING} AND "BookingInstalments"."booking_id" = '${instalment.bookingId}'AND "BookingInstalments"."id" > ${instalment.id}`)
							.orderBy(`"BookingInstalments"."id"`)
							.getOne()

						// console.log(nextDate);


						await getConnection()
							.createQueryBuilder()
							.update(Booking)
							.set({ nextInstalmentDate: nextInstalmentDate.instalmentDate })
							.where("id = :id", { id: instalment.bookingId })
							.execute();

						let param = {
							date: DateTime.convertDateFormat(new Date(instalment.instalmentDate), 'YYYY-MM-DD', 'MM/DD/YYYY'),
							userName: instalment.user.firstName + ' ' + instalment.user.lastName,
							cardHolderName: transaction.meta_data.transaction.payment_method.full_name,
							cardNo: transaction.meta_data.transaction.payment_method.number,
							orderId: instalment.booking.laytripBookingId,
							amount: Generic.formatPriceDecimal(parseFloat(instalment.amount)),
							installmentId: instalment.id,
							complitedAmount: parseFloat(await this.totalPaidAmount(instalment.bookingId)),
							totalAmount: Generic.formatPriceDecimal(parseFloat(instalment.booking.totalAmount))
						}

						this.mailerService
							.sendMail({
								to: instalment.user.email,
								from: mailConfig.from,
								bcc: mailConfig.BCC,
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

						PushNotification.sendNotificationTouser(instalment.user.userId,
							{  //you can send only notification or only data(or include both)
								module_name: 'instalment',
								task: 'instalment_received',
								bookingId: instalment.booking.laytripBookingId,
								instalmentId: instalment.id
							},
							{
								title: 'Installment Received',
								body: `We have received your payment of $${instalment.amount}.`
							}, "1c17cd17-9432-40c8-a256-10db77b95bca")
						WebNotification.sendNotificationTouser(instalment.user.userId,
							{  //you can send only notification or only data(or include both)
								module_name: 'instalment',
								task: 'instalment_received',
								bookingId: instalment.booking.laytripBookingId,
								instalmentId: instalment.id
							},
							{
								title: 'Installment Received',
								body: `We have received your payment of $${instalment.amount}.`
							}, "1c17cd17-9432-40c8-a256-10db77b95bca")
					}

					await this.checkAllinstallmentPaid(instalment.bookingId)
				}
			} catch (error) {

				const filename = `partial-payment-cron-failed-` + instalment.id + '-' + new Date().getTime() + '.json'
				Activity.createlogFile(filename, JSON.stringify(instalment) + '-----------------------error-----------------------' + JSON.stringify(error), 'payment')
				failedlogArray += `<p>instalmentId:- ${instalment.id}-----Log file----->/var/www/src/payment/${filename}</p> <br/>`
			}
		}
		if (failedlogArray != '') {
			this.cronfailedmail('cron fail for given installment id please check log files: <br/><pre>' + failedlogArray, 'partial payment cron failed')
		}


		return { message: `${currentDate} date installation payment capture successfully` };
	}

	async partialBookingPrice(Headers, options: getBookingDailyPriceDto) {
		const { booking_id } = options
		const date = new Date();
		var todayDate = date.toISOString();
		todayDate = todayDate
			.replace(/T/, " ") // replace T with a space
			.replace(/\..+/, "");
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
		if (booking_id) {
			query.andWhere(`"booking"."laytrip_booking_id" = '${booking_id}'`)
		}

		const result = await query.getMany();

		if (!result.length) {
			throw new NotFoundException(`No booking found`)
		}

		var total = 0;
		var failedlogArray = ''
		for (let index = 0; index < result.length; index++) {
			try {
				switch (result[index].moduleId) {
					case ModulesName.FLIGHT:
						await this.getDailyPriceOfFlight(result[index], Headers)
						break;
					case ModulesName.VACATION_RENTEL:
						await this.getDailyPriceOfVacationRental(result[index], Headers)
						break;
					default:

						break;
				}
			} catch (error) {
				console.log(error);
				const filename = `daily-booking-price-cron-failed-` + result[index].laytripBookingId + '-' + new Date().getTime() + '.json'
				Activity.createlogFile(filename, JSON.stringify(result[index]) + '-----------------------error-----------------------' + JSON.stringify(error), 'booking')
				failedlogArray += `<p>BookingId:- ${result[index].laytripBookingId}-----Log file----->/var/www/src/booking/${filename}</p> <br/>`
			}
		}
		if (failedlogArray != '') {
			this.cronfailedmail('cron fail for given booking id please check log files: <br/><pre>' + failedlogArray, 'daily booking price cron failed')
		}

		return { message: `today booking price added for pending booking` }
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


					await getConnection()
						.createQueryBuilder()
						.update(Booking)
						.set({ bookingStatus: BookingStatus.FAILED, paymentStatus: PaymentStatus.REFUNDED, paymentInfo: voidCard.meta_data })
						.where("supplier_booking_id = :id", { id: booking.supplierBookingId })
						.execute();

					this.sendFlightFailerMail(booking.user.email, booking.laytripBookingId)

					PushNotification.sendNotificationTouser(booking.user.userId,
						{
							module_name: 'booking',
							task: 'booking_failed',
							bookingId: booking.laytripBookingId
						},
						{
							title: 'Booking failed',
							body: `we couldn’t process your booking request.`
						}, "1c17cd17-9432-40c8-a256-10db77b95bca")
					WebNotification.sendNotificationTouser(booking.user.userId,
						{
							module_name: 'booking',
							task: 'booking_failed',
							bookingId: booking.laytripBookingId
						},
						{
							title: 'Booking failed',
							body: `we couldn’t process your booking request.`
						}, "1c17cd17-9432-40c8-a256-10db77b95bca")
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

				PushNotification.sendNotificationTouser(booking.user.userId,
					{  //you can send only notification or only data(or include both)
						module_name: 'booking',
						task: 'booking_done',
						bookingId: booking.laytripBookingId
					},
					{
						title: 'Booking ',
						body: `We’re as excited for your trip as you are! please check all the details`
					}, "1c17cd17-9432-40c8-a256-10db77b95bca")

				WebNotification.sendNotificationTouser(booking.user.userId,
					{  //you can send only notification or only data(or include both)
						module_name: 'booking',
						task: 'booking_done',
						bookingId: booking.laytripBookingId
					},
					{
						title: 'Booking ',
						body: `We’re as excited for your trip as you are! please check all the details`
					}, "1c17cd17-9432-40c8-a256-10db77b95bca")

				//if TicketStatus = TktInProgress call it again
			}
		}
		return {
			message: await Translation.Translater('ES', 'responce', 'update_booking_cron')
		}
	}

	async getDataTimefromString(dateTime) {
		var date = dateTime.split('/')
		console.log(date);

		return `${date[2]}-${date[1]}-${date[0]}`

	}

	async sendFlightFailerMail(email, bookingId, error = null) {
		this.mailerService
			.sendMail({
				to: email,
				from: mailConfig.from,
				cc: mailConfig.BCC,
				subject: "Booking Failure Mail",
				html: BookingFailerMail({
					error: error,
				}, bookingId),
			})
			.then((res) => {
				console.log("res", res);
			})
			.catch((err) => {
				console.log("err", err);
			});
	}

	async addRecurringLaytripPoint() {
		try {
			var toDate = new Date();

			var todayDate = toDate.toISOString();
			todayDate = todayDate
				.replace(/T/, " ") // replace T with a space
				.replace(/\..+/, "");

			const result = await getManager()
				.createQueryBuilder(LayCreditEarn, "layCreditEarn")
				.where(`DATE("layCreditEarn"."earn_date") <= '${todayDate}' AND "layCreditEarn"."status" = ${RewordStatus.PENDING} AND "layCreditEarn"."type" = ${LaytripPointsType.RECURRING}`)
				.getMany()
			console.log(result);


			if (result.length) {
				for (let index = 0; index < result.length; index++) {
					const data = result[index];
					console.log(data);

					const createTransaction = {
						"bookingId": null,
						"userId": data.userId,
						"card_token": data.cardToken,
						"currencyId": 1,
						"amount": data.points,
						"paidFor": PaidFor.RewordPoint,
						"note": ""
					}
					const payment = await this.paymentService.createTransaction(createTransaction, "1c17cd17-9432-40c8-a256-10db77b95bca")

					if (payment.paymentStatus == PaymentStatus.CONFIRM) {

						await getConnection()
							.createQueryBuilder()
							.update(LayCreditEarn)
							.set({ transactionId: payment.id, status: RewordStatus.AVAILABLE })
							.where("id = :id", { id: data.id })
							.execute();
						// 		this.mailerService
						// 	.sendMail({
						// 		to: data.user.email,
						// 		from: mailConfig.from,
						// 		cc: mailConfig.BCC,
						// 		subject: `Subscription Expired`,
						// 		html: ConvertCustomerMail({
						// 			username: data.first_name + " " + data.last_name,
						// 			date: data.next_subscription_date,
						// 		}),
						// 	})
						// 	.then((res) => {
						// 		console.log("res", res);
						// 	})
						// 	.catch((err) => {
						// 		console.log("err", err);
						// 	});
						Activity.logActivity(
							"1c17cd17-9432-40c8-a256-10db77b95bca",
							"cron",
							`${data.id} recurring laytrip poin added by cron`
						);
					}
					else {
						// failed transaction mail
					}
				}
			}
		} catch (error) {
			console.log(error);

		}
		return { message: `today recurring point added succesfully` }
	}

	async uploadLogIntoS3Bucket(folderName) {
		const path = require('path');
		const fs = require('fs');
		//joining path of directory 
		const directoryPath = path.join('/var/www/html/logs/' + folderName);
		//passsing directoryPath and callback function
		fs.readdir(directoryPath, function (err, files) {
			//handling error
			if (err) {
				return console.log('Unable to scan directory: ' + err);
			}
			//listing all files using forEach
			files.forEach(function (file) {
				// Do whatever you want to do with the file
				console.log(file);



				const AWSconfig = config.get('AWS');

				const s3 = new AWS.S3({
					accessKeyId: process.env.AWS_ACCESS_KEY || AWSconfig.accessKeyId,
					secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || AWSconfig.secretAccessKey
				});

				const fileName = '/var/www/html/logs/' + folderName + '/' + file;

				const uploadFile = () => {
					fs.readFile(fileName, (err, data) => {
						if (err) throw err;
						const params = {
							Bucket: 'laytrip/logs/' + folderName, // pass your bucket name
							Key: file, // file will be saved as testBucket/contacts.csv
							Body: data
						};
						s3.upload(params, function (s3Err, data) {
							if (s3Err) {
								throw s3Err
							}
							else {
								fs.unlinkSync(fileName)
								console.log(`File uploaded successfully at ${data.Location}`)
							}

						});
					});
				};

				uploadFile();
			});
		});

		return {
			message: `${folderName} log uploaded on s3 bucket`
		}

	}

	async paymentReminder() {

		const date = new Date();
		var currentDate = date.toISOString();
		currentDate = currentDate
			.replace(/T/, " ") // replace T with a space
			.replace(/\..+/, "");
		var fromDate = new Date();
		fromDate.setDate(fromDate.getDate() + 3);
		var toDate = fromDate.toISOString();
		toDate = toDate
			.replace(/T/, " ") // replace T with a space
			.replace(/\..+/, "");
		toDate = toDate.split(' ')[0]
		console.log(toDate);

		let query = getConnection()
			.createQueryBuilder(BookingInstalments, "BookingInstalments")
			.leftJoinAndSelect("BookingInstalments.booking", "booking")
			.leftJoinAndSelect("BookingInstalments.currency", "currency")
			.leftJoinAndSelect("BookingInstalments.user", "User")
			//.leftJoinAndSelect("User.userDeviceDetails", "userDeviceDetails")

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
				"booking.laytripBookingId",
				"currency.id",
				"currency.code",
				"currency.liveRate",
				"currency.symbol",
				"User.userId",
				"User.email",
				"User.phoneNo",
				"User.firstName"
			])
			.where(`(DATE("BookingInstalments".instalment_date) >= DATE('${currentDate}') ) AND (DATE("BookingInstalments".instalment_date) <= DATE('${toDate}') ) AND ("BookingInstalments"."payment_status" = ${PaymentStatus.PENDING}) AND ("booking"."booking_type" = ${BookingType.INSTALMENT}) AND ("booking"."booking_status" In (${BookingStatus.CONFIRM},${BookingStatus.PENDING}))`)

		const data = await query.getMany();

		for await (const installment of data) {
			const param = {
				userName: installment.user.firstName,
				amount: installment.currency.symbol + `${Generic.formatPriceDecimal(parseFloat(installment.amount))}`,
				date: DateTime.convertDateFormat(new Date(installment.instalmentDate), 'YYYY-MM-DD', 'MM/DD/YYYY')
			}
			this.mailerService
				.sendMail({
					to: installment.user.email,
					from: mailConfig.from,
					bcc: mailConfig.BCC,
					subject: "Payment Reminder",
					html: PaymentReminderMail(param),
				})
				.then((res) => {
					console.log("res", res);
				})
				.catch((err) => {
					console.log("err", err);
				});

			PushNotification.sendNotificationTouser(installment.user.userId,
				{  //you can send only notification or only data(or include both)
					module_name: 'payment',
					task: 'payment_reminder',
					bookingId: installment.booking.laytripBookingId,
					instalmentId: installment.id
				},
				{
					title: 'Payment Reminder',
					body: `Just a friendly reminder that your instalment amount of ${param.amount} will be collected on ${param.date} Please ensure you have sufficient funds on your account and all the banking information is up-to-date.`
				}, '1c17cd17-9432-40c8-a256-10db77b95bca')
			WebNotification.sendNotificationTouser(installment.user.userId,
				{  //you can send only notification or only data(or include both)
					module_name: 'payment',
					task: 'payment_reminder',
					bookingId: installment.booking.laytripBookingId,
					instalmentId: installment.id
				},
				{
					title: 'Payment Reminder',
					body: `Just a friendly reminder that your instalment amount of ${param.amount} will be collected on ${param.date} Please ensure you have sufficient funds on your account and all the banking information is up-to-date.`
				}, '1c17cd17-9432-40c8-a256-10db77b95bca')

		}
		return { message: `Payment reminder send successfully` };

	}

	async checkAllinstallmentPaid(bookingId) {

		let query = await getManager()
			.createQueryBuilder(BookingInstalments, "BookingInstalments")
			.where(`booking_id = '${bookingId}' AND payment_status != ${PaymentStatus.CONFIRM}`)
			.getCount()
		if (query <= 0) {
			await getConnection()
				.createQueryBuilder()
				.update(Booking)
				.set({ paymentStatus: PaymentStatus.CONFIRM })
				.where("id = :id", { id: bookingId })
				.execute();
		}

	}

	async cronfailedmail(data, subject) {
		this.mailerService
			.sendMail({
				to: mailConfig.BCC,
				from: mailConfig.from,
				//cc: mailConfig.BCC,
				subject: subject,
				html: data,
			})
			.then((res) => {
				console.log("res", res);
			})
			.catch((err) => {
				console.log("err", err);
			});
	}

	async totalPaidAmount(bookingId: string) {
		var paidAmount = await getConnection().query(`
                SELECT  SUM( amount) as total_amount from booking_instalments where payment_status = ${PaymentStatus.CONFIRM} AND booking_id = '${bookingId}'  
			`);
		return paidAmount[0].total_amount
	}

	async backupDatabase() {
		const AWSconfig = config.get('AWS');
		const dbConfig = config.get('db');

		const { execute } = require('@getvim/execute');

		var dbName = process.env.RDS_Database || dbConfig.database;

		var host = process.env.RDS_Host || dbConfig.host
		var port = process.env.RDS_Port || dbConfig.port
		var username = process.env.RDS_Username || dbConfig.username
		var password = process.env.RDS_Password || dbConfig.password

		var S3_BUCKET = 'laytrip/logs/database';
		var s3AccessKeyId = process.env.AWS_ACCESS_KEY || AWSconfig.accessKeyId;
		var s3SecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || AWSconfig.secretAccessKey

		process.env.AWS_ACCESS_KEY_ID = s3AccessKeyId;
		process.env.AWS_SECRET_ACCESS_KEY = s3SecretAccessKey;


		// Determine our filename
		//   20170312.011924.307000000.sql.gz
		var timestamp = (new Date()).toISOString()
			.replace(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d{3})Z$/, '$1$2$3.$4$5$6.$7000000');
		const fileName = 'laytrip'+ timestamp + '.sql'
		var filepath = '/var/www/html/logs/database/' + fileName;

		if (!fs.existsSync('/var/www/html/logs/database/')) {
			fs.mkdirSync('/var/www/html/logs/database/');
		}
		var s3 = new AWS.S3();

		// Dump our database to a file so we can collect its length
		// DEV: We output `stderr` to `process.stderr`
		// DEV: We write to disk so S3 client can calculate `Content-Length` of final result before uploading
		console.log('Dumping `pg_dump` into `gzip`');

		await execute(`PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${username} -d ${dbName} -f ${filepath} -F t`,).then(async () => {
			console.log("Finito");
			console.log('Uploading "' + filepath + '" to S3');
			s3.putObject({
				Bucket: S3_BUCKET,
				Key: fileName,
				// ACL: 'public',
				// ContentType: 'text/plain',
				Body: fs.createReadStream(filepath)
			}, function handlePutObject(err, data) {
				// If there was an error, throw it
				if (err) {
					throw err;
					return err
				} else {
					console.log('Successfully uploaded "' + filepath + '"');
					return { message: 'Successfully uploaded "' + filepath + '"' }
				}
			});
		}).catch(err => {
			console.log(err);
			return err
		})

		// Upload our gzip stream into S3
		// http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property

		return { message : `database backup uploadsuccefully `}

	}

	async getDailyPriceOfFlight(bookingData: Booking, Headers) {
		let flights: any = null;
		if (new Date(await this.getDataTimefromString(bookingData.moduleInfo[0].departure_date)) > new Date()) {
			var bookingType = bookingData.locationInfo['journey_type']

			let travelers = [];

			for await (const traveler of bookingData.travelers) {
				travelers.push({
					traveler_id: traveler.userId
				})
			}

			if (bookingType == 'oneway') {
				Headers['currency'] = bookingData.currency2.code
				Headers['language'] = 'en'

				let dto = {
					"source_location": bookingData.moduleInfo[0].departure_code,
					"destination_location": bookingData.moduleInfo[0].arrival_code,
					"departure_date": await this.getDataTimefromString(bookingData.moduleInfo[0].departure_date),
					"flight_class": bookingData.moduleInfo[0].routes[0].stops[0].cabin_class,
					"adult_count": bookingData.moduleInfo[0].adult_count ? bookingData.moduleInfo[0].adult_count : 0,
					"child_count": bookingData.moduleInfo[0].child_count ? bookingData.moduleInfo[0].child_count : 0,
					"infant_count": bookingData.moduleInfo[0].infant_count ? bookingData.moduleInfo[0].infant_count : 0
				}

				flights = await this.flightService.searchOneWayZipFlight(dto, Headers, bookingData.user);

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

				flights = await this.flightService.searchRoundTripZipFlight(dto, Headers, bookingData.user);
			}
			if (flights.items && flights.items.length) {
				for await (const flight of flights.items) {
					if (flight.unique_code == bookingData.moduleInfo[0].unique_code) {

						const markups = await this.flightService.applyPreductionMarkup(bookingData.totalAmount)

						const savedDate = new Date(bookingData.predectedBookingDate);
						var predictedDate = savedDate.toISOString();
						predictedDate = predictedDate
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

						const date = new Date();
						var todayDate = date.toISOString();
						todayDate = todayDate
							.replace(/T/, " ") // replace T with a space
							.replace(/\..+/, "");
						let query = await getManager()
							.createQueryBuilder(PredictiveBookingData, "predictiveBookingData")
							.leftJoinAndSelect("predictiveBookingData.booking", "booking")
							.where(`"predictiveBookingData"."created_date" = '${todayDate.split(' ')[0]}' AND "predictiveBookingData"."booking_id" = '${bookingData.id}'`)
							.getOne();
						if (query) {
							query.bookingId = bookingData.id
							query.netPrice = flight.net_rate
							query.date = new Date();
							query.isBelowMinimum = flight.routes[0].stops[0].below_minimum_seat;
							query.remainSeat = flight.routes[0].stops[0].remaining_seat
							query.price = flight.selling_price
							await query.save();
						}
						else {
							const predictiveBookingData = new PredictiveBookingData
							predictiveBookingData.bookingId = bookingData.id
							predictiveBookingData.netPrice = flight.net_rate
							predictiveBookingData.date = new Date();
							predictiveBookingData.isBelowMinimum = flight.routes[0].stops[0].below_minimum_seat;
							predictiveBookingData.remainSeat = flight.routes[0].stops[0].remaining_seat
							predictiveBookingData.price = flight.selling_price
							console.log(flight);
							//predictiveBookingData.bookIt = false;
							await predictiveBookingData.save()
						}

					}
				}
			}
		}
	}

	async getDailyPriceOfVacationRental(bookingData: Booking, Headers) {
		console.log(bookingData);
		let vacationData;
		if (new Date(await this.getDataTimefromString(bookingData.checkInDate)) > new Date()) {

			Headers['currency'] = bookingData.currency2.code
			Headers['language'] = 'en'

			let dto = {
				"property_id": bookingData.moduleInfo[0]["property_id"],
				"room_id": bookingData.moduleInfo[0]["room_id"],
				"rate_plan_code": bookingData.moduleInfo[0]["rate_plan_code"],
				"check_in_date": bookingData.checkInDate,
				"check_out_date": bookingData.checkOutDate,
				"adult_count": bookingData.moduleInfo[0]["adult"],
				"number_and_children_ages": bookingData.moduleInfo[0]["number_and_chidren_age"]
			}


			vacationData = await this.vacationRentalService.verifyUnitAvailability(dto, Headers, bookingData.user);
			// console.log(vacationData);


			const date = new Date();
			var todayDate = date.toISOString();
			todayDate = todayDate
				.replace(/T/, " ") // replace T with a space
				.replace(/\..+/, "");
			if (vacationData["available_status"] == true) {
				let query = await getManager()
					.createQueryBuilder(PredictiveBookingData, "predictiveBookingData")
					.leftJoinAndSelect("predictiveBookingData.booking", "booking")
					.where(`"predictiveBookingData"."created_date" = '${todayDate.split(' ')[0]}' AND "predictiveBookingData"."booking_id" = '${bookingData.id}'`)
					.getOne();

				if (query) {
					query.bookingId = bookingData.id
					query.netPrice = vacationData.net_price
					query.date = new Date();
					query.isBelowMinimum = false;
					query.remainSeat = 0;
					query.price = vacationData.selling_price
					await query.save();
				}
				else {
					const predictiveBookingData = new PredictiveBookingData
					predictiveBookingData.bookingId = bookingData.id
					predictiveBookingData.netPrice = vacationData.net_price
					predictiveBookingData.date = new Date();
					predictiveBookingData.isBelowMinimum = false;
					predictiveBookingData.remainSeat = 0;
					predictiveBookingData.price = vacationData.selling_price;
					// console.log(flight);
					//predictiveBookingData.bookIt = false;
					await predictiveBookingData.save()
				}
			}

		}
	}
}
