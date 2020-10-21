import {
	Injectable,
	NotFoundException,
	InternalServerErrorException,
	ConflictException,
	BadRequestException,
	NotAcceptableException,
	UnauthorizedException,
} from "@nestjs/common";
import { BookingRepository } from "./booking.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { MailerService } from "@nestjs-modules/mailer";
import { FlightBookingEmailParameterModel } from "src/config/email_template/model/flight-booking-email-parameter.model";
import { ModulesName } from "src/enum/module.enum";
import { FlightBookingConfirmtionMail } from "src/config/email_template/flight-booking-confirmation-mail.html";
import { ListBookingDto } from "./dto/list-booking.dto";
import * as moment from 'moment';

@Injectable()
export class BookingService {
	constructor(
		@InjectRepository(BookingRepository)
		private bookingRepository: BookingRepository,

		private readonly mailerService: MailerService
	) { }

	async resendBookingEmail(bookingId: string): Promise<{ message: any }> {
		const bookingData = await this.bookingRepository.bookingDetail(bookingId);

		if (!bookingData) {
			throw new NotFoundException(
				"Given booking id not found&&&booking_id&&&Given booking id not found"
			);
		}
		console.log(bookingData);
		const Data = bookingData;
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
		const moduleInfo = bookingData.moduleInfo[0];
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

	async listBooking(listBookingDto: ListBookingDto) {
		try {
			let result = await this.bookingRepository.listBooking(listBookingDto);

			let paidAmount = 0;
			let remainAmount = 0;

			//console.log(result);

			for (let i in result.data) {
				for (let instalment of result.data[i].bookingInstalments) {
					if (instalment.instalmentStatus == 1) {
						paidAmount += parseFloat(instalment.amount);
					} else {
						remainAmount += parseFloat(instalment.amount);
					}
				}
				result.data[i]["paidAmount"] = paidAmount;
				result.data[i]["remainAmount"] = remainAmount;
				delete result.data[i].user.updatedDate;
				delete result.data[i].user.salt;
				delete result.data[i].user.password;
				for (let j in result.data[i].travelers) {
					delete result.data[i].travelers[j].userData.updatedDate;
					delete result.data[i].travelers[j].userData.salt;
					delete result.data[i].travelers[j].userData.password;

					var birthDate = new Date(result.data[i].travelers[j].userData.dob);
					var age = moment(new Date()).diff(moment(birthDate), 'years');


					if (age < 2) {
						result.data[i].travelers[j].userData.user_type = "infant";
					} else if (age < 12) {
						result.data[i].travelers[j].userData.user_type = "child";
					} else {
						result.data[i].travelers[j].userData.user_type = "adult";
					}
				}
			}
			return result;
		} catch (error) {

			if (typeof error.response !== "undefined") {
				console.log('m');
				switch (error.response.statusCode) {
					case 404:
						throw new NotFoundException(error.response.message);
					case 409:
						throw new ConflictException(error.response.message);
					case 422:
						throw new BadRequestException(error.response.message);
					case 500:
						throw new InternalServerErrorException(error.response.message);
					case 406:
						throw new NotAcceptableException(error.response.message);
					case 404:
						throw new NotFoundException(error.response.message);
					case 401:
						throw new UnauthorizedException(error.response.message);
					default:
						throw new InternalServerErrorException(
							`${error.message}&&&id&&&${error.Message}`
						);
				}

			}
			throw new NotFoundException(
				`${error.message}&&&id&&&${error.message}`
			);

		}
	}

	async userBookingList(listBookingDto: ListBookingDto, userId: string) {
		try {
			let result = await this.bookingRepository.listBooking(listBookingDto, userId);
			let paidAmount = 0;
			let remainAmount = 0;
			//console.log(result);

			for (let i in result.data) {
				for (let instalment of result.data[i].bookingInstalments) {
					if (instalment.instalmentStatus == 1) {
						paidAmount += parseFloat(instalment.amount);
					} else {
						remainAmount += parseFloat(instalment.amount);
					}
				}
				result.data[i]["paidAmount"] = paidAmount;
				result.data[i]["remainAmount"] = remainAmount;
				delete result.data[i].user.updatedDate;
				delete result.data[i].user.salt;
				delete result.data[i].user.password;
				for (let j in result.data[i].travelers) {
					delete result.data[i].travelers[j].userData.updatedDate;
					delete result.data[i].travelers[j].userData.salt;
					delete result.data[i].travelers[j].userData.password;

					var birthDate = new Date(result.data[i].travelers[j].userData.dob);
					var age = moment(new Date()).diff(moment(birthDate), 'years');
					if (age < 2) {
						result.data[i].travelers[j].userData.user_type = "infant";
					} else if (age < 12) {
						result.data[i].travelers[j].userData.user_type = "child";
					} else {
						result.data[i].travelers[j].userData.user_type = "adult";
					}
				}
			}
			return result;
		} catch (error) {
			if (typeof error.response !== "undefined") {
				switch (error.response.statusCode) {
					case 404:
						if (
							error.response.message ==
							"This user does not exist&&&email&&&This user does not exist"
						) {
							error.response.message = `This traveler does not exist&&&email&&&This traveler not exist`;
						}
						throw new NotFoundException(error.response.message);
					case 409:
						throw new ConflictException(error.response.message);
					case 422:
						throw new BadRequestException(error.response.message);
					case 500:
						throw new InternalServerErrorException(error.response.message);
					case 406:
						throw new NotAcceptableException(error.response.message);
					case 404:
						throw new NotFoundException(error.response.message);
					case 401:
						throw new UnauthorizedException(error.response.message);
					default:
						throw new InternalServerErrorException(
							`${error.message}&&&id&&&${error.Message}`
						);
				}
			}
			throw new NotFoundException(
				`${error.message}&&&id&&&${error.message}`
			);
		}
	}

	async getBookingDetail(bookingId: string) {
		try {
			let result = await this.bookingRepository.bookingDetail(bookingId);

			let paidAmount = 0;
			let remainAmount = 0;

			//console.log(result);


			for (let instalment of result.bookingInstalments) {
				if (instalment.instalmentStatus == 1) {
					paidAmount += parseFloat(instalment.amount);
				} else {
					remainAmount += parseFloat(instalment.amount);
				}
			}
			result["paidAmount"] = paidAmount;
			result["remainAmount"] = remainAmount;
			delete result.user.updatedDate;
			delete result.user.salt;
			delete result.user.password;
			for (let j in result.travelers) {
				delete result.travelers[j].userData.updatedDate;
				delete result.travelers[j].userData.salt;
				delete result.travelers[j].userData.password;

				var birthDate = new Date(result.travelers[j].userData.dob);
				var age = moment(new Date()).diff(moment(birthDate), 'years');


				if (age < 2) {
					result.travelers[j].userData.user_type = "infant";
				} else if (age < 12) {
					result.travelers[j].userData.user_type = "child";
				} else {
					result.travelers[j].userData.user_type = "adult";
				}
			}

			return result;
		} catch (error) {
			if (typeof error.response !== "undefined") {
				console.log("m");
				switch (error.response.statusCode) {
					case 404:
						throw new NotFoundException(error.response.message);
					case 409:
						throw new ConflictException(error.response.message);
					case 422:
						throw new BadRequestException(error.response.message);
					case 500:
						throw new InternalServerErrorException(error.response.message);
					case 406:
						throw new NotAcceptableException(error.response.message);
					case 404:
						throw new NotFoundException(error.response.message);
					case 401:
						throw new UnauthorizedException(error.response.message);
					default:
						throw new InternalServerErrorException(
							`${error.message}&&&id&&&${error.Message}`
						);
				}
			}
			throw new NotFoundException(
				`${error.message}&&&id&&&${error.message}`
			);
		}
	}

	async getPaymentHistory(user, listPaymentDto) {
		let result = await this.bookingRepository.getPayments(user, listPaymentDto);
		if (result.total_result == 0) {
			throw new NotFoundException(`No payment history found!`);
		}

		let paidAmount = 0;
		for (let i in result.data) {
			for (let instalment of result.data[i].bookingInstalments) {
				if (instalment.instalmentStatus == 1) {
					paidAmount += parseFloat(instalment.amount);
				}
			}
			result.data[i]["paidAmount"] = paidAmount;
		}
		return result;
	}
}
