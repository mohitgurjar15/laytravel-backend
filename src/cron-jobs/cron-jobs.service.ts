import { Injectable, NotFoundException } from "@nestjs/common";
import { UserRepository } from "src/auth/user.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { MailerService } from "@nestjs-modules/mailer";
import { Role } from "src/enum/role.enum";
import { Activity } from "src/utility/activity.utility";
import * as config from "config";
import { ConvertCustomerMail } from "src/config/email_template/convert-user-mail.html";
import { FlightService } from "src/flight/flight.service";
import { getConnection, getManager } from "typeorm";
import { Booking } from "src/entity/booking.entity";
import { BookingRepository } from "src/booking/booking.repository";
import { BookingInstalments } from "src/entity/booking-instalments.entity";
import { BookingType } from "src/enum/booking-type.enum";
import { PaymentStatus } from "src/enum/payment-status.enum";
import { PaymentService } from "src/payment/payment.service";
import { FailedPaymentAttempt } from "src/entity/failed-payment-attempt.entity";
const mailConfig = config.get("email");

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

			let transaction = await this.paymentService.getPayment(cardToken, amount, cardToken)

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

			}
			await instalment.save()

			let transactionData = {
				userId: instalment.userId,
				bookingId: instalment.bookingId,
				installmentId: instalment.id,
				PaymentStatus: transaction.status,
				paymentToken: transaction.token,
				amount: amount,
				currency_code : currencyCode,
				card_token : cardToken
			}
			paidInstallment.push(transactionData)			
		}
		return { data: paidInstallment };
	}
}
