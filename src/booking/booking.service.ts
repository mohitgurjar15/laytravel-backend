import {
	Injectable,
	NotFoundException,
	InternalServerErrorException,
	ConflictException,
	BadRequestException,
	NotAcceptableException,
	UnauthorizedException,
	ForbiddenException,
} from "@nestjs/common";
import { BookingRepository } from "./booking.repository";
import * as uniqid from 'uniqid';
import { InjectRepository } from "@nestjs/typeorm";
import { MailerService } from "@nestjs-modules/mailer";
import { FlightBookingEmailParameterModel } from "src/config/email_template/model/flight-booking-email-parameter.model";
import { ModulesName } from "src/enum/module.enum";
import { FlightBookingConfirmtionMail } from "src/config/email_template/flight-booking-confirmation-mail.html";
import { ListBookingDto } from "./dto/list-booking.dto";
import * as moment from 'moment';
import { ListPaymentAdminDto } from "src/booking/dto/list-payment-admin.dto";
import * as config from "config";
import { Booking } from "src/entity/booking.entity";
import { TravelerInfo } from "src/entity/traveler-info.entity";
import { BookingFailerMail } from "src/config/email_template/booking-failure-mail.html";
import { BookingType } from "src/enum/booking-type.enum";
import { exit } from "process";
import { PaymentType } from "src/enum/payment-type.enum";
import { PaymentStatus } from "src/enum/payment-status.enum";
import { getConnection, getManager } from "typeorm";
import { InstalmentStatus } from "src/enum/instalment-status.enum";
const mailConfig = config.get("email");
import * as uuidValidator from "uuid-validate"
import { listPredictedBookingData } from "./dto/get-predictive-data.dto";
import { BookingInstalments } from "src/entity/booking-instalments.entity";
import { PredictionFactorMarkup } from "src/entity/prediction-factor-markup.entity";
import { ExportBookingDto } from "./dto/export-booking.dto";

@Injectable()
export class BookingService {
	constructor(
		@InjectRepository(BookingRepository)
		private bookingRepository: BookingRepository,

		public readonly mailerService: MailerService
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

	async flightBookingEmailSend(bookingData: Booking) {
		if (bookingData.bookingStatus < 2) {
			var param = new FlightBookingEmailParameterModel();
			const user = bookingData.user;
			const moduleInfo = bookingData.moduleInfo[0]
			const routes = moduleInfo.routes;
			const travelers = bookingData.travelers
			let flightData = [];
			for (let index = 0; index < routes.length; index++) {
				const element = routes[index];
				var rout = index == 0 ? `${moduleInfo.departure_info.city} To ${moduleInfo.arrival_info.city} (${moduleInfo.routes[0].type})` : `${moduleInfo.arrival_info.city} To ${moduleInfo.departure_info.city} (${moduleInfo.routes[1].type})`;
				var status = bookingData.bookingStatus == 0 ? "Pending" : "Confirm";
				var droups = [];
				for await (const stop of element.stops) {
					var flight = `${stop.airline}-${stop.flight_number}`;
					var depature = {
						code: stop.departure_info.code,
						name: stop.departure_info.name,
						city: stop.departure_info.city,
						country: stop.departure_info.country,
						date: await this.formatDate(stop.departure_date_time),
						time: stop.departure_time
					}
					var arrival = {
						code: stop.arrival_info.code,
						name: stop.arrival_info.name,
						city: stop.arrival_info.city,
						country: stop.arrival_info.country,
						date: await this.formatDate(stop.arrival_date_time),
						time: stop.arrival_time
					}
					droups.push({
						flight: flight, depature: depature, arrival: arrival, airline: stop.airline_name
					})
				}
				console.log();
				flightData.push({
					rout: rout,
					status: status,
					droups: droups,
				})
			}

			var paymentDetail = bookingData.bookingInstalments;
			var installmentDetail = [];
			var EmailSubject = '';
			if (bookingData.bookingType == BookingType.INSTALMENT) {
				EmailSubject = "Flight Booking Details";
				for await (const installment of paymentDetail) {
					installmentDetail.push({
						amount: bookingData.currency2.symbol + installment.amount,
						date: await this.formatDate(installment.instalmentDate),
						status: installment.paymentStatus == 1 ? 'Confirm' : 'Pending'
					})
				}
			}
			else {
				EmailSubject = "Flight Booking Confirmation";
				installmentDetail.push({
					amount: bookingData.currency2.symbol + bookingData.totalAmount,
					date: await this.formatDate(bookingData.bookingDate),
					status: bookingData.paymentStatus == 1 ? 'Confirm' : 'Pending'
				})
			}

			var travelerInfo = [];
			for await (const traveler of travelers) {
				var today = new Date();
				var birthDate = new Date(traveler.userData.dob);
				var age = moment(new Date()).diff(moment(birthDate), 'years');

				var user_type = '';
				if (age < 2) {
					user_type = "infant";
				} else if (age < 12) {
					user_type = "child";
				} else {
					user_type = "adult";
				}
				travelerInfo.push({
					name: traveler.userData.firstName + ' ' + traveler.userData.lastName,
					email: traveler.userData.email,
					type: user_type
				})

			}

			param.user_name = `${user.firstName}  ${user.firstName}`;
			param.flightData = flightData;
			param.orderId = bookingData.id;
			param.paymentDetail = installmentDetail;
			param.travelers = travelerInfo


			console.log(param);
			// console.log(param.flightData);

			this.mailerService
				.sendMail({
					to: user.email,
					from: mailConfig.from,
					cc: mailConfig.BCC,
					subject: EmailSubject,
					html: await FlightBookingConfirmtionMail(param),
				})
				.then((res) => {
					console.log("res", res);
				})
				.catch((err) => {
					console.log("err", err);
				});
		}
		else if (bookingData.bookingStatus == 2) {
			var status = "Failed"
			this.mailerService
				.sendMail({
					to: bookingData.user.email,
					from: mailConfig.from,
					cc: mailConfig.BCC,
					subject: "Flight Booking Failed",
					html: BookingFailerMail({
						error: null,
					}, bookingData.laytripBookingId),

				})
				.then((res) => {
					console.log("res", res);
				})
				.catch((err) => {
					console.log("err", err);
				});
		}
		else {
			var status = "Canceled"
		}
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
				result.data[i]["paidAmount"] = result.data[i].bookingType == BookingType.NOINSTALMENT && result.data[i].paymentStatus == PaymentStatus.CONFIRM ? result.data[i].totalAmount : paidAmount;
				result.data[i]["remainAmount"] = result.data[i].bookingType == BookingType.NOINSTALMENT && result.data[i].paymentStatus == PaymentStatus.CONFIRM ? 0 : remainAmount;

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
					case 403:
						throw new ForbiddenException(error.response.message);
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
			//console.log(result);

			for (let i in result.data) {
				let paidAmount = 0;
				let remainAmount = 0;
				let pandinginstallment = 0;

				for (let instalment of result.data[i].bookingInstalments) {
					if (instalment.instalmentStatus == InstalmentStatus.PAID) {
						paidAmount += parseFloat(instalment.amount);
					} else {
						remainAmount += parseFloat(instalment.amount);
						pandinginstallment = pandinginstallment + 1;
					}
				}
				result.data[i]["paidAmount"] = result.data[i].bookingType == BookingType.NOINSTALMENT && result.data[i].paymentStatus == PaymentStatus.CONFIRM ? result.data[i].totalAmount : paidAmount;
				result.data[i]["remainAmount"] = result.data[i].bookingType == BookingType.NOINSTALMENT && result.data[i].paymentStatus == PaymentStatus.CONFIRM ? 0 : remainAmount;
				result.data[i]["pendingInstallment"] = result.data[i].bookingType == BookingType.NOINSTALMENT && result.data[i].paymentStatus == PaymentStatus.CONFIRM ? 0 : pandinginstallment;
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
					case 403:
						throw new ForbiddenException(error.response.message);
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
			result["paidAmount"] = result.bookingType == BookingType.NOINSTALMENT && result.paymentStatus == PaymentStatus.CONFIRM ? result.totalAmount : paidAmount;
			result["remainAmount"] = result.bookingType == BookingType.NOINSTALMENT && result.paymentStatus == PaymentStatus.CONFIRM ? 0 : remainAmount;
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
					case 403:
						throw new ForbiddenException(error.response.message);
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
		let result: any = await this.bookingRepository.getPayments(user, listPaymentDto);
		if (result.total_result == 0) {
			throw new NotFoundException(`No payment history found!`);
		}


		for (let i = 0; i < result.data.length; i++) {
			let paidAmount = 0;
			for (let instalment of result.data[i].bookingInstalments) {
				if (instalment.instalmentStatus == 1) {
					paidAmount += parseFloat(instalment.amount);
				}
			}
			var totalAMount = result.data[i].totalAmount
			let remainAmount = totalAMount - paidAmount

			result.data[i]["paidAmount"] = result.data[i].bookingType == BookingType.NOINSTALMENT && result.data[i].paymentStatus == PaymentStatus.CONFIRM ? result.data[i].totalAmount : paidAmount;
			result.data[i]["remainAmount"] = result.data[i].bookingType == BookingType.NOINSTALMENT && result.data[i].paymentStatus == PaymentStatus.CONFIRM ? 0 : remainAmount;
		}
		return result;
	}

	async listPaymentForAdmin(listPaymentAdminDto: ListPaymentAdminDto) {
		const {
			limit,
			page_no,
			module_id,
			supplier,
			status,
			start_date,
			end_date,
			instalment_type,
			user_id,
			booking_id,
			search
		} = listPaymentAdminDto;

		let where;
		where = `1=1 `;
		if (user_id) {
			where += `AND ("BookingInstalments"."user_id" = '${user_id}')`;
		}

		if (booking_id) {
			where += `AND ("BookingInstalments"."booking_id" = '${booking_id}')`;
		}
		if (start_date) {
			where += `AND (DATE("BookingInstalments".instalment_date) >= '${start_date}') `;
		}
		if (end_date) {
			where += `AND (DATE("BookingInstalments".instalment_date) <= '${end_date}') `;
		}
		if (status) {
			where += `AND ("BookingInstalments"."payment_status" = '${status}')`;
		}
		if (module_id) {
			where += `AND ("BookingInstalments"."module_id" = '${module_id}')`;
		}
		if (supplier) {
			where += `AND ("BookingInstalments"."supplier_id" = '${supplier}') `;
		}
		if (instalment_type) {
			where += `AND ("BookingInstalments"."instalment_type" = '${instalment_type}') `;
		}
		if (search) {
			where += `AND (("User"."first_name" ILIKE '%${search}%')or("User"."email" ILIKE '%${search}%')or("User"."last_name" ILIKE '%${search}%'))`;

		}
		const { data, total_count } = await this.bookingRepository.listPayment(where, limit, page_no);
		const result: any = data;
		for await (const instalment of result) {
			let infoDate = instalment.booking.moduleInfo[0].instalment_details.instalment_date;

			for (let index = 0; index < infoDate.length; index++) {
				const element = infoDate[index];

				if (element.instalment_date == instalment.instalmentDate) {
					instalment.installmentNo = index + 1;
					exit;
				}
			}
		}

		return {
			data: result, total_count: total_count
		};
	}

	async formatDate(date) {
		var d = new Date(date),
			month = '' + (d.getMonth() + 1),
			day = '' + d.getDate(),
			year = d.getFullYear();

		if (month.length < 2)
			month = '0' + month;
		if (day.length < 2)
			day = '0' + day;

		return [month, day, year].join('/');
	}

	async getPredictiveBookingDdata() {
		try {

			const result = await this.bookingRepository.getPredictiveBookingDdata();
			let responce = [];
			for await (const data of result.data) {
				const bookingData = data.booking
				// booking data
				const paidAmount = await this.paidAmountByUser(data.bookingId)
				// value of amount paid by user

				const markups = await this.getPreductionMarkup()
				// preduction markup maximum aur minimum value

				const predictiveDate = new Date(bookingData.predectedBookingDate);
				// predictive date for booking 

				//const predictiveMarkupAmount = await this.predictiveMarkupAmount(bookingData.totalAmount)

				// predictive markup amount for minimum paid by user 


				const predictiveBookingData: any = {}
				predictiveBookingData['booking_id'] = data.bookingId
				predictiveBookingData['net_price'] = data.netPrice
				predictiveBookingData['date'] = data.date
				predictiveBookingData['is_below_minimum'] = data.isBelowMinimum
				predictiveBookingData['remain_seat'] = data.remainSeat
				predictiveBookingData['selling_price'] = data.price;
				predictiveBookingData['paid_amount'] = paidAmount.amount;
				predictiveBookingData['installment_status'] = paidAmount.attempt <= 1 ? 'ON TRAC' : 'FAIL'
				predictiveBookingData['paid_amount_in_percentage'] = (paidAmount.amount * 100) / parseFloat(bookingData.totalAmount)
				predictiveBookingData['booking_status'] = bookingData.bookingStatus;
				predictiveBookingData['departure_date'] = bookingData.moduleInfo[0].departure_date
				predictiveBookingData['laytrip_booking_id'] = bookingData.laytripBookingId
				predictiveBookingData['bookIt'] = false;

				predictiveBookingData['profit'] = parseFloat(bookingData.totalAmount) - data.netPrice;

				const net_rate_percentage_variation = ((data.netPrice - parseFloat(bookingData.netRate)) * 100) / parseFloat(bookingData.netRate);
				predictiveBookingData['net_rate_percentage_variation'] = net_rate_percentage_variation

				predictiveBookingData['is_minimum_installment_paid'] = false;
				predictiveBookingData['is_net_rate_price_change_below_threshold'] = false;
				predictiveBookingData['is_net_rate_price_change_above_threshold'] = false;
				predictiveBookingData['is_last_date_for_booking'] = false;


				if (net_rate_percentage_variation == 0) {
					predictiveBookingData['net_rate_percentage_variation_stage'] = 'EQUAL'
					predictiveBookingData['profit_stage'] = 'EQUAL'
				} else {
					predictiveBookingData['net_rate_percentage_variation_stage'] = net_rate_percentage_variation > 0 ? 'UP' : 'DOWN';
					predictiveBookingData['profit_stage'] = net_rate_percentage_variation > 0 ? 'DOWN' : 'UP';
				}

				//predictiveBookingData['bookingData'] = bookingData;

				if (data.isBelowMinimum == true) {
					console.log(`rule 1 :- flight below minimum`)
					predictiveBookingData.bookIt = true;
				}

				if (net_rate_percentage_variation > markups.minRatePercentage && predictiveBookingData['net_rate_percentage_variation_stage'] == 'DOWN') {
					console.log(`rule 2 :- flight net rate less than the user book net rate`)
					predictiveBookingData.bookIt = true;
					predictiveBookingData['is_net_rate_price_change_below_threshold'] = true;
				}
				else if (net_rate_percentage_variation > markups.maxRatePercentage && predictiveBookingData['net_rate_percentage_variation_stage'] == 'UP') {
					console.log(`rule 3 :- flight net rate less than the preduction markup max amount`)
					predictiveBookingData.bookIt = true;
					predictiveBookingData['is_net_rate_price_change_above_threshold'] = true;
				}

				if (predictiveDate <= data.date) {
					console.log(`rule 4 :- last date for booking`)
					predictiveBookingData.bookIt = true;
					predictiveBookingData['is_last_date_for_booking'] = true;
				}

				if (predictiveBookingData.paid_amount_in_percentage >= markups.minInstallmentPercentage) {
					predictiveBookingData.bookIt = true;
					predictiveBookingData['is_minimum_installment_paid'] = true;
				}

				responce.push(predictiveBookingData)
			}
			return { data: responce, count: result.count }
		} catch (error) {
			if (typeof error.response !== "undefined") {
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
					case 403:
						throw new ForbiddenException(error.response.message);
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

	async paidAmountByUser(bookingId) {
		console.log(bookingId);

		let query = await getManager()
			.createQueryBuilder(BookingInstalments, "instalment")
			.select([
				"instalment.amount",
				"instalment.paymentStatus",
				"instalment.attempt"
			])
			.where(`booking_id=:bookingId AND payment_status=:paymentStatus`, { bookingId, paymentStatus: PaymentStatus.CONFIRM })
			.orderBy(`instalment_date`, "ASC")
			.getMany();
		let amount = 0
		let attempt = 0;
		for await (const data of query) {
			amount = amount + parseFloat(data.amount)
			if (data.paymentStatus == PaymentStatus.CONFIRM) {
				attempt = data.attempt
			}

		}

		return { amount, attempt }
	}


	async getPreductionMarkup() {

		let query = getManager()
			.createQueryBuilder(PredictionFactorMarkup, "markup")
		// .select([
		// 	"markup.maxRatePercentage",
		// 	"markup.minRatePercentage"
		// ])
		const result = await query.getOne();

		return result;
	}

	async exportBookings(listBookingDto: ExportBookingDto) {
		try {
			let result = await this.bookingRepository.exportCSV(listBookingDto);

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
				result.data[i]["paidAmount"] = result.data[i].bookingType == BookingType.NOINSTALMENT && result.data[i].paymentStatus == PaymentStatus.CONFIRM ? result.data[i].totalAmount : paidAmount;
				result.data[i]["remainAmount"] = result.data[i].bookingType == BookingType.NOINSTALMENT && result.data[i].paymentStatus == PaymentStatus.CONFIRM ? 0 : remainAmount;

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
					case 403:
						throw new ForbiddenException(error.response.message);
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


}
