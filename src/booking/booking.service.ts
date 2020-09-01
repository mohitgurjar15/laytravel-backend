import { Injectable, NotFoundException } from "@nestjs/common";
import { BookingRepository } from "./booking.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { MailerService } from "@nestjs-modules/mailer";
import { FlightBookingEmailParameterModel } from "src/config/email_template/model/flight-booking-email-parameter.model";
import { PaymentStatus } from "src/enum/payment-status.enum";
import { BookingStatus } from "src/enum/booking-status.enum";
import { ModulesName } from "src/enum/module.enum";
import { FlightBookingConfirmtionMail } from "src/config/email_template/flight-booking-confirmation-mail.html";

@Injectable()
export class BookingService {
	constructor(
		@InjectRepository(BookingRepository)
		private bookingRepository: BookingRepository,

		private readonly mailerService: MailerService
	) {}

	async resendBookingEmail(bookingId: string): Promise<{ message: any }> {
		const bookingData = await this.bookingRepository.getBookingDetails(
			bookingId
		);

		if (!bookingData) {
			throw new NotFoundException(
				"Given booking id not exiest&&&booking_id&&&Given booking id not exiest"
			);
		}
		console.log(bookingData);
		const Data = bookingData[0];
		switch (Data.moduleId) {
			case ModulesName.HOTEL:
				break;

			case ModulesName.FLIGHT:
				await this.flightBookingEmailSend(Data);
				break;

			default:
				break;
		}

		return { message: `Booking information send on ragister user email id ` };
	}

	async flightBookingEmailSend(bookingData) {
		var param = new FlightBookingEmailParameterModel();
		const user = bookingData.user;
		const moduleInfo = bookingData.moduleInfo;
		const currency = bookingData.currency2;
		const netPrice = bookingData.netRate;
		param.user_name = `${user.firstName}  ${user.firstName}`;
		param.date = moduleInfo.departure_date;
		param.laytrip_points = bookingData.laytrip_points ? 0 : 0;
		param.travelers = [`${user.firstName}  ${user.firstName}`];
		param.airline = moduleInfo.airline ? moduleInfo.airline : "";
		param.pnr_no = moduleInfo.pnr_no ? moduleInfo.pnr_no : "";
		param.ticket_no = bookingData.id;
		param.flight_name = moduleInfo.flight_name ? moduleInfo.flight_name : "";
		param.class = moduleInfo.flight_class ? moduleInfo.flight_class : "";
		param.rout = moduleInfo.flight_rout ? moduleInfo.flight_rout : "";
		param.duration = moduleInfo.duration ? moduleInfo.duration : "";
		param.cardholder_name = bookingData.cardholder_name
			? bookingData.cardholder_name
			: "";
		param.visa_ending_in = user.passportExpiry ? user.passportExpiry : null;
		param.amount = `${currency.symbol} ${bookingData.totalAmount} ${currency.code}`;
		param.base_fare = `${currency.symbol} ${netPrice} ${currency.code}`;
		param.tax = bookingData.tax
			? `${currency.symbol}${bookingData.tax} ${currency.code}`
			: "0";

		var status = "";
		if (bookingData.bookingStatus > 2) {
			bookingData.bookingStatus == 0 ? "Pending" : "Confirm";
		} else {
			bookingData.bookingStatus == 2 ? "Failed" : "Canceled";
		}
		param.status = status;
		this.mailerService
			.sendMail({
				to: user.email,
				from: "no-reply@laytrip.com",
				subject: "Flight booking data",
				html: FlightBookingConfirmtionMail(param),
			})
			.then((res) => {
				console.log("res", res);
			})
			.catch((err) => {
				console.log("err", err);
			});
	}
}
