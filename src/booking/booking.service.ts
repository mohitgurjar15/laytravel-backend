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
import { InjectRepository } from "@nestjs/typeorm";
import { MailerService } from "@nestjs-modules/mailer";
import { FlightBookingEmailParameterModel } from "src/config/email_template/model/flight-booking-email-parameter.model";
import { ModulesName } from "src/enum/module.enum";
import { FlightBookingConfirmtionMail } from "src/config/email_template/flight-booking-confirmation-mail.html";
import { ListBookingDto } from "./dto/list-booking.dto";
import * as moment from 'moment';
import { ListPaymentAdminDto } from "src/booking/dto/list-payment-admin.dto";

import { Booking } from "src/entity/booking.entity";
import { BookingFailerMail } from "src/config/email_template/booking-failure-mail.html";
import { BookingType } from "src/enum/booking-type.enum";
import { exit } from "process";
import { PaymentStatus } from "src/enum/payment-status.enum";
import { getConnection, getManager } from "typeorm";
import { InstalmentStatus } from "src/enum/instalment-status.enum";
import * as config from "config";
const mailConfig = config.get("email");
import { BookingInstalments } from "src/entity/booking-instalments.entity";
import { PredictionFactorMarkup } from "src/entity/prediction-factor-markup.entity";
import { ExportBookingDto } from "./dto/export-booking.dto";
import { ShareBookingDto } from "./dto/share-booking-detail.dto";
import { BookingStatus } from "src/enum/booking-status.enum";
import { User } from "src/entity/user.entity";
import { getBookingDetailsDto } from "./dto/get-booking-detail.dto";
import { Generic } from "src/utility/generic.utility";
import { BookingFilterDto } from "./dto/booking-filter.dto";
import { ExportPaymentAdminDto } from "./dto/export-payment-list.dto";
import { CartBooking } from "src/entity/cart-booking.entity";
import { CryptoUtility } from "src/utility/crypto.utility";
import { UserCard } from "src/entity/user-card.entity";
import { LaytripFlightBookingConfirmtionMail } from "src/config/new_email_templete/flight-booking-confirmation.html";
import { DateTime } from "src/utility/datetime.utility";
import { CartDataUtility } from "src/utility/cart-data.utility";
import { LaytripCartBookingConfirmtionMail } from "src/config/new_email_templete/cart-booking-confirmation.html";
import { DeleteBookingDto } from "./dto/delete-cart.dto";

@Injectable()
export class BookingService {
	constructor(
		@InjectRepository(BookingRepository)
		private bookingRepository: BookingRepository,

		public readonly mailerService: MailerService
	) { }

	async resendCartEmail(bookingDetail: getBookingDetailsDto) {
		const { bookingId } = bookingDetail
		const responce = await CartDataUtility.CartMailModelDataGenerate(bookingId)
		if (responce?.param) {
			let subject = responce.param.bookingType == BookingType.INSTALMENT ? `BOOKING ID ${responce.param.orderId} CONFIRMATION` : `BOOKING ID ${responce.param.orderId} CONFIRMATION`
			this.mailerService
				.sendMail({
					to: responce.email,
					from: mailConfig.from,
					bcc: mailConfig.BCC,
					subject: subject,
					html: await LaytripCartBookingConfirmtionMail(responce.param),
				})
				.then((res) => {
					//console.log("res", res);
				})
				.catch((err) => {
					//console.log("err", err);
				});
			return {
				message: `Cart booking email send succeessfully`
			};
		} else {
			return {
				message: `We could not find your booking id please correct it.`
			};
		}


	}
	async resendBookingEmail(bookingDetail: getBookingDetailsDto): Promise<{ message: any }> {
		try {
			const { bookingId } = bookingDetail
			const bookingData = await this.bookingRepository.bookingDetail(bookingId);

			if (!bookingData) {
				throw new NotFoundException(
					"Given booking id not found&&&booking_id&&&Given booking id not found"
				);
			}
			//console.log(bookingData);
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

	async flightBookingEmailSend(bookingData: Booking, email = '') {
		if (bookingData.bookingStatus == BookingStatus.CONFIRM || bookingData.bookingStatus == BookingStatus.PENDING) {
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
				//console.log();
				flightData.push({
					rout: rout,
					status: status,
					droups: droups,
				})
			}

			var EmailSubject = '';
			if (bookingData.bookingType == BookingType.INSTALMENT) {
				EmailSubject = "Flight Booking Details"
			}
			else {
				EmailSubject = "Flight Booking Confirmation";
			}
			const d = await this.formatDate(bookingData.bookingDate)
			const installmentDetail = {
				amount: bookingData.currency2.symbol + Generic.formatPriceDecimal(parseFloat(bookingData.totalAmount)),
				date: DateTime.convertDateFormat(d, 'MM/DD/YYYY', 'MMM DD, YYYY'),
				status: bookingData.paymentStatus == 1 ? 'Confirm' : 'Pending'
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
			const cartData = await CartDataUtility.cartData(bookingData.cartId)
			param.user_name = `${user.firstName}  ${user.lastName}`;
			param.flightData = flightData;
			param.orderId = bookingData.laytripBookingId;
			param.paymentDetail = installmentDetail;
			param.travelers = travelerInfo
			if (bookingData.bookingType == BookingType.INSTALMENT) {
				param.cart = {
					cartId: bookingData.cart.laytripCartId,
					totalAmount: cartData.totalAmount,
					totalPaid: cartData.paidAmount,
					rememberAmount: cartData.remainAmount
				}
			}
			else {
				param.cart = {
					cartId: bookingData.cart.laytripCartId,
					totalAmount: cartData.totalAmount
				}
			}

			param.bookingType = bookingData.bookingType
			param.bookingStatus = bookingData.bookingStatus == BookingStatus.CONFIRM ? 'confirmed' : 'pending'

			//console.log(param);
			// //console.log(param.flightData);
			if (email != '') {
				this.mailerService
					.sendMail({
						to: email,
						cc: user.email,
						from: mailConfig.from,
						bcc: mailConfig.BCC,
						subject: EmailSubject,
						html: await LaytripFlightBookingConfirmtionMail(param),
					})
					.then((res) => {
						//console.log("res", res);
					})
					.catch((err) => {
						//console.log("err", err);
					});
			}
			else {
				this.mailerService
					.sendMail({
						to: user.email,
						from: mailConfig.from,
						bcc: mailConfig.BCC,
						subject: EmailSubject,
						html: await LaytripFlightBookingConfirmtionMail(param),
					})
					.then((res) => {
						//console.log("res", res);
					})
					.catch((err) => {
						//console.log("err", err);
					});
			}

		}
		else if (bookingData.bookingStatus == BookingStatus.FAILED) {
			if (email != '') {
				throw new BadRequestException(`Given booking is failed`)
			}
			var status = "Failed"
			this.mailerService
				.sendMail({
					to: bookingData.user.email,
					from: mailConfig.from,
					bcc: mailConfig.BCC,
					subject: "Flight Booking Failed",
					html: BookingFailerMail({
						error: null,
					}, bookingData.laytripBookingId),

				})
				.then((res) => {
					//console.log("res", res);
				})
				.catch((err) => {
					//console.log("err", err);
				});
		}
		else {
			var status = "Canceled"
			if (email != '') {
				throw new BadRequestException(`Given booking is canceled`)
			}
		}
	}

	async listBooking(listBookingDto: ListBookingDto) {
		try {
			let result = await this.bookingRepository.listBooking(listBookingDto);

			let paidAmount = 0;
			let remainAmount = 0;

			////console.log(result);

			for (let i in result.data) {
				if (result.data[i].bookingInstalments.length > 0) {
					result.data[i].bookingInstalments.sort((a, b) => a.id - b.id)

				}

				for (let instalment of result.data[i].bookingInstalments) {
					if (instalment.paymentStatus == PaymentStatus.CONFIRM) {
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
				//console.log('m');
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

			for (let i in result.data) {
				let paidAmount = 0;
				let remainAmount = 0;
				let pandinginstallment = 0;

				if (result.data[i].bookingInstalments.length > 0) {
					result.data[i].bookingInstalments.sort((a, b) => a.id - b.id)

					//result.data[i].bookingInstalments.reverse()
				}

				for (let instalment of result.data[i].bookingInstalments) {
					if (instalment.paymentStatus == PaymentStatus.CONFIRM) {
						paidAmount += parseFloat(instalment.amount);
					} else {
						remainAmount += parseFloat(instalment.amount);
						pandinginstallment = pandinginstallment + 1;
					}
				}
				result.data[i]["paidAmount"] = result.data[i].bookingType == BookingType.NOINSTALMENT && result.data[i].paymentStatus == PaymentStatus.CONFIRM ? parseFloat(result.data[i].totalAmount) : paidAmount;
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

	async currentBooking(bookingFilterDto: BookingFilterDto, user: User) {
		try {
			const { start_date,
				end_date,
				booking_id,
				module_id,
				supplier_id,
				booking_through,
				transaction_token, search } = bookingFilterDto

			const date = new Date();
			var todayDate = date.toISOString();
			todayDate = todayDate
				.replace(/T/, " ") // replace T with a space
				.replace(/\..+/, "");
			todayDate = todayDate.split(' ')[0]
			let where;
			where = `("cartBooking"."user_id" = '${user.userId}') AND 
				("booking"."booking_status" IN (${BookingStatus.CONFIRM},${BookingStatus.PENDING})) AND
				(DATE("cartBooking"."check_in_date") >= DATE('${todayDate}'))`;

			if (booking_through) {
				where += `AND ("booking"."booking_through" = '${booking_through}')`;
			}

			if (module_id) {
				where += `AND ("booking"."module_id" = '${module_id}')`;
			}

			if (supplier_id) {
				where += `AND ("booking"."supplier_id" = '${supplier_id}')`;
			}

			if (start_date) {
				where += `AND (DATE("booking".booking_date) >= '${start_date}') `;
			}
			if (end_date) {
				where += `AND (DATE("booking".booking_date) <= '${end_date}') `;
			}
			if (booking_id) {
				where += `AND ("cartBooking"."laytrip_cart_id" =  '${booking_id}')`;
			}
			if (transaction_token) {
				where += `AND ("instalments"."transaction_token" ILIKE '%${transaction_token}%')`;
			}

			if (search) {
				const source = {
					source_location: search
				}
				const destination = {
					destination_location: search
				}
				where += `AND (("booking"."laytrip_booking_id" ILIKE '%${search}%')
				OR("cartBooking"."laytrip_cart_id" ILIKE '%${search}%')
				)`;
			}
			const query = getConnection()
				.createQueryBuilder(CartBooking, "cartBooking")
				.leftJoinAndSelect("cartBooking.bookings", "booking")
				.leftJoinAndSelect("booking.bookingInstalments", "instalments")
				.leftJoinAndSelect("booking.currency2", "currency")
				//.leftJoinAndSelect("cartBooking.user", "User")
				.leftJoinAndSelect("booking.travelers", "traveler")
				.leftJoinAndSelect("traveler.userData", "userData")
				.leftJoinAndSelect("userData.state", "state")
				.leftJoinAndSelect("userData.country", "countries")

				.where(where)
				.orderBy(`cartBooking.bookingDate`, 'DESC')
			const [CartList, count] = await query.getManyAndCount();

			if (!CartList.length) {
				throw new NotFoundException(`No booking found&&&id&&&No booking found`);
			}
			let responce = []
			console.log('getData');

			for await (const cart of CartList) {
				let paidAmount = 0;
				let remainAmount = 0;
				let pandinginstallment = 0
				let totalAmount = 0
				let nextInstallmentDate = cart.bookings[0].nextInstalmentDate
				const currency = cart.bookings[0].currency2
				const baseBooking = cart.bookings[0].bookingInstalments
				const installmentType = cart.bookings[0]?.bookingInstalments[0]?.instalmentType
				let cartInstallments = [];
				if (baseBooking && cart.bookings[0].bookingType == BookingType.INSTALMENT) {
					console.log('baseBooking');
					for await (const baseInstallments of baseBooking) {

						let amount = parseFloat(baseInstallments.amount);

						if (cart.bookings.length > 1) {
							for (let index = 1; index < cart.bookings.length; index++) {

								for await (const installment of cart.bookings[index].bookingInstalments) {
									if (baseInstallments.instalmentDate == installment.instalmentDate) {
										amount += parseFloat(installment.amount)
									}
								}
							}
						}
						else {
							amount = parseFloat(baseInstallments.amount)
						}
						const installment = {
							instalmentDate: baseInstallments.instalmentDate,
							instalmentStatus: baseInstallments?.paymentStatus,
							attempt: baseInstallments.attempt,
							amount: Generic.formatPriceDecimal(amount)
						}
						cartInstallments.push(installment)
					}
				}


				for await (const booking of cart.bookings) {
					console.log('booking');
					if (booking.bookingInstalments.length) {
						for await (const installment of booking.bookingInstalments) {
							if (installment.paymentStatus == PaymentStatus.CONFIRM) {
								paidAmount += parseFloat(installment.amount);
							} else {
								remainAmount += parseFloat(installment.amount);
								pandinginstallment = pandinginstallment + 1;
							}
						}
					}

					totalAmount += parseFloat(booking.totalAmount)
					delete booking.currency2
					delete booking.bookingInstalments
					for await (const traveler of booking.travelers) {
						delete traveler.userData.salt
						delete traveler.userData.password
						traveler.userData.dob = traveler.userData.dob || ''
					}
				}

				if (cartInstallments.length > 0) {
					//cartInstallments.sort((o) => new Date( o.instalmentDate ) );
					cartInstallments.sort((a, b) => {
						var c = new Date(a.instalmentDate);
						var d = new Date(b.instalmentDate);
						return c > d ? 1 : -1;
					})
					//cartInstallments.sort((a, b) => a.instalmentDate - b.instalmentDate)
				}


				let cartResponce = {}
				cartResponce['id'] = cart.id
				const trackReport = await this.paidAmountByUser(cart.bookings[0].id)
				cartResponce['is_installation_on_track'] = trackReport?.attempt != 1 && trackReport?.paymentStatus != PaymentStatus.CONFIRM ? false : true
				cartResponce['checkInDate'] = cart.checkInDate
				cartResponce['checkOutDate'] = cart.checkOutDate
				cartResponce['laytripCartId'] = cart.laytripCartId
				cartResponce['bookingDate'] = cart.bookingDate
				cartResponce['booking'] = cart.bookings
				cartResponce['cartInstallments'] = cartInstallments
				cartResponce['paidAmount'] = Generic.formatPriceDecimal(paidAmount)
				cartResponce['remainAmount'] = Generic.formatPriceDecimal(remainAmount)
				cartResponce['pendinginstallment'] = pandinginstallment
				cartResponce['totalAmount'] = Generic.formatPriceDecimal(totalAmount)
				cartResponce['nextInstallmentDate'] = nextInstallmentDate
				cartResponce['currency'] = currency
				if (installmentType) {
					cartResponce['installmentType'] = installmentType
				}
				responce.push(cartResponce)
			}

			return {
				data: responce,
				count: count
			}

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

	async completeBooking(bookingFilterDto: BookingFilterDto, user: User) {
		try {
			const { start_date,
				end_date,
				booking_id,
				module_id,
				supplier_id,
				booking_through,
				transaction_token, search } = bookingFilterDto

			const date = new Date();
			var todayDate = date.toISOString();
			todayDate = todayDate
				.replace(/T/, " ") // replace T with a space
				.replace(/\..+/, "");
			todayDate = todayDate.split(' ')[0]
			let where;
			where = `("cartBooking"."user_id" = '${user.userId}') AND 
				("booking"."booking_status" IN (${BookingStatus.CONFIRM},${BookingStatus.PENDING},${BookingStatus.CANCELLED},${BookingStatus.FAILED})) AND
				(DATE("cartBooking"."check_in_date") < DATE('${todayDate}'))`;

			if (booking_through) {
				where += `AND ("booking"."booking_through" = '${booking_through}')`;
			}

			if (module_id) {
				where += `AND ("booking"."module_id" = '${module_id}')`;
			}

			if (supplier_id) {
				where += `AND ("booking"."supplier_id" = '${supplier_id}')`;
			}

			if (start_date) {
				where += `AND (DATE("booking".booking_date) >= '${start_date}') `;
			}
			if (end_date) {
				where += `AND (DATE("booking".booking_date) <= '${end_date}') `;
			}
			if (booking_id) {
				where += `AND ("cartBooking"."laytrip_cart_id" =  '${booking_id}')`;
			}
			if (transaction_token) {
				where += `AND ("instalments"."transaction_token" ILIKE '%${transaction_token}%')`;
			}
			if (search) {
				where += `AND (("booking"."laytrip_booking_id" ILIKE '%${search}%')
				OR("cartBooking"."laytrip_cart_id" ILIKE '%${search}%')
				)`;
			}
			const query = getConnection()
				.createQueryBuilder(CartBooking, "cartBooking")
				.leftJoinAndSelect("cartBooking.bookings", "booking")
				.leftJoinAndSelect("booking.bookingInstalments", "instalments")
				.leftJoinAndSelect("booking.currency2", "currency")
				//.leftJoinAndSelect("cartBooking.user", "User")
				.leftJoinAndSelect("booking.travelers", "traveler")
				.leftJoinAndSelect("traveler.userData", "userData")
				// .leftJoinAndSelect("User.state", "state")
				// .leftJoinAndSelect("User.country", "countries")

				.where(where)
				.orderBy(`cartBooking.bookingDate`, 'DESC')
			const CartList = await query.getMany();

			if (!CartList.length) {
				throw new NotFoundException(`No booking found&&&id&&&No booking found`);
			}

			let responce = []
			for await (const cart of CartList) {
				const installmentType = cart.bookings[0]?.bookingInstalments[0]?.instalmentType
				let paidAmount = 0;
				let remainAmount = 0;
				let pandinginstallment = 0
				let totalAmount = 0
				const currency = cart.bookings[0].currency2
				const baseBooking = cart.bookings[0].bookingInstalments
				let cartInstallments = [];
				if (baseBooking.length && cart.bookings[0].bookingType == BookingType.INSTALMENT) {
					for await (const baseInstallments of baseBooking) {

						let amount = parseFloat(baseInstallments.amount);

						if (cart.bookings.length > 1) {
							for (let index = 1; index < cart.bookings.length; index++) {

								for await (const installment of cart.bookings[index].bookingInstalments) {
									if (baseInstallments.instalmentDate == installment.instalmentDate) {
										amount += parseFloat(installment.amount)
									}
								}
							}
						}
						else {
							amount = parseFloat(baseInstallments.amount)
						}
						const installment = {
							instalmentDate: baseInstallments.instalmentDate,
							instalmentStatus: baseInstallments.instalmentStatus,
							attempt: baseInstallments.attempt,
							amount: Generic.formatPriceDecimal(amount)
						}
						cartInstallments.push(installment)
					}
				}


				for await (const booking of cart.bookings) {

					if (booking.bookingInstalments.length > 0) {
						booking.bookingInstalments.sort((a, b) => a.id - b.id)
						for await (const installment of booking.bookingInstalments) {
							if (installment.paymentStatus == PaymentStatus.CONFIRM) {
								paidAmount += parseFloat(installment.amount);
							} else {
								remainAmount += parseFloat(installment.amount);
								pandinginstallment = pandinginstallment + 1;
							}
						}
					}


					totalAmount += parseFloat(booking.totalAmount)
					delete booking.currency2
					delete booking.bookingInstalments
					for await (const traveler of booking.travelers) {
						delete traveler.userData.salt
						delete traveler.userData.password
						traveler.userData.dob = traveler.userData.dob || ''
					}
				}

				if (cartInstallments.length > 0) {
					//cartInstallments.sort((o) => new Date( o.instalmentDate ) );
					cartInstallments.sort((a, b) => {
						var c = new Date(a.instalmentDate);
						var d = new Date(b.instalmentDate);
						return c > d ? 1 : -1;
					})
					//cartInstallments.sort((a, b) => a.instalmentDate - b.instalmentDate)
				}

				let cartResponce = {}
				cartResponce['id'] = cart.id
				const trackReport = await this.paidAmountByUser(cart.bookings[0].id)
				cartResponce['is_installation_on_track'] = trackReport?.attempt != 1 && trackReport?.paymentStatus != PaymentStatus.CONFIRM ? false : true
				cartResponce['checkInDate'] = cart.checkInDate
				cartResponce['checkOutDate'] = cart.checkOutDate
				cartResponce['laytripCartId'] = cart.laytripCartId
				cartResponce['bookingDate'] = cart.bookingDate
				cartResponce['booking'] = cart.bookings
				cartResponce['cartInstallments'] = cartInstallments
				cartResponce['paidAmount'] = Generic.formatPriceDecimal(paidAmount) || 0
				cartResponce['remainAmount'] = Generic.formatPriceDecimal(remainAmount) || 0
				cartResponce['pendinginstallment'] = pandinginstallment || 0
				cartResponce['currency'] = currency
				cartResponce['totalAmount'] = Generic.formatPriceDecimal(totalAmount)
				cartResponce['nextInstallmentDate'] = cart.bookings[0].nextInstalmentDate
				if (installmentType) {
					cartResponce['installmentType'] = installmentType
				}
				responce.push(cartResponce)
			}
			return {
				data: responce
			}

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

	async getCartBookingDetail(cartId, user: User) {
		try {
			const where = `("cartBooking"."user_id" = '${user.userId}') AND ("cartBooking"."laytrip_cart_id" =  '${cartId}')`;
			const query = getConnection()
				.createQueryBuilder(CartBooking, "cartBooking")
				.leftJoinAndSelect("cartBooking.bookings", "booking")
				.leftJoinAndSelect("booking.bookingInstalments", "instalments")
				.leftJoinAndSelect("booking.currency2", "currency")
				.leftJoinAndSelect("booking.module", "module")
				//.leftJoinAndSelect("cartBooking.user", "User")
				.leftJoinAndSelect("booking.travelers", "traveler")
				.leftJoinAndSelect("traveler.userData", "userData")
				// .leftJoinAndSelect("User.state", "state")
				// .leftJoinAndSelect("User.country", "countries")

				.where(where)
				.orderBy(`cartBooking.bookingDate`, 'DESC')
			const cart = await query.getOne();

			if (!cart) {
				throw new NotFoundException(`Given cart booking id not found&&&id&&&Given cart booking id not found`);
			}
			let paidAmount = 0;
			let remainAmount = 0;
			let pandinginstallment = 0
			let totalAmount = 0
			const currency = cart.bookings[0]?.currency2
			const baseBooking = cart.bookings[0]?.bookingInstalments
			const installmentType = cart.bookings[0]?.bookingInstalments[0]?.instalmentType
			let cartInstallments = [];
			if (baseBooking?.length && cart.bookings[0].bookingType == BookingType.INSTALMENT) {
				for await (const baseInstallments of baseBooking) {

					let amount = 0;
					if (cart.bookings[0].bookingStatus <= BookingStatus.CONFIRM) {
						amount += parseFloat(baseInstallments.amount);
					}

					if (cart.bookings.length > 1) {
						for (let index = 1; index < cart.bookings.length; index++) {
							if (cart.bookings[index].bookingStatus <= BookingStatus.CONFIRM) {
								for await (const installment of cart.bookings[index].bookingInstalments) {
									if (baseInstallments.instalmentDate == installment.instalmentDate) {
										amount += parseFloat(installment.amount)
									}
								}
							}

						}
					}
					const installment = {
						instalmentDate: baseInstallments.instalmentDate,
						instalmentStatus: baseInstallments?.paymentStatus,
						attempt: baseInstallments.attempt,
						amount: Generic.formatPriceDecimal(amount)
					}
					cartInstallments.push(installment)
				}
			}


			for await (const booking of cart.bookings) {

				if (booking.bookingInstalments.length > 0) {
					booking.bookingInstalments.sort((a, b) => a.id - b.id)
				}
				if (booking.bookingStatus <= BookingStatus.CONFIRM) {
					if (booking?.bookingInstalments?.length) {
						for await (const installment of booking.bookingInstalments) {
							if (installment.paymentStatus == PaymentStatus.CONFIRM) {
								paidAmount += parseFloat(installment.amount);
							} else {
								remainAmount += parseFloat(installment.amount);
								pandinginstallment = pandinginstallment + 1;
							}
						}
					}

					totalAmount += parseFloat(booking.totalAmount)
					//console.log(totalAmount, 'totalAmount');
				}


				delete booking?.currency2
				delete booking?.bookingInstalments
				delete booking?.module.liveCredential
				delete booking?.module.testCredential
				delete booking?.module.mode
				delete booking?.module.status
				for await (const traveler of booking.travelers) {
					delete traveler.userData.salt
					delete traveler.userData.password
					traveler.userData.dob = traveler.userData.dob || ''
				}
			}

			if (cartInstallments.length > 0) {
				//cartInstallments.sort((o) => new Date( o.instalmentDate ) );
				cartInstallments.sort((a, b) => {
					var c = new Date(a.instalmentDate);
					var d = new Date(b.instalmentDate);
					return c > d ? 1 : -1;
				})
				//cartInstallments.sort((a, b) => a.instalmentDate - b.instalmentDate)
			}
			console.log('cartResponce');
			
			let cartResponce = {}
			cartResponce['id'] = cart?.id
			
			const trackReport = await this.paidAmountByUser(cart.bookings[0]?.id)
			cartResponce['is_installation_on_track'] = trackReport?.attempt != 1 && trackReport?.paymentStatus != PaymentStatus.CONFIRM ? false : true
			cartResponce['checkInDate'] = cart.checkInDate
			cartResponce['checkOutDate'] = cart.checkOutDate
			cartResponce['laytripCartId'] = cart.laytripCartId
			cartResponce['bookingDate'] = cart.bookingDate
			cartResponce['booking'] = cart.bookings
			cartResponce['cartInstallments'] = cartInstallments
			cartResponce['paidAmount'] = Generic.formatPriceDecimal(paidAmount)
			cartResponce['remainAmount'] = Generic.formatPriceDecimal(remainAmount)
			cartResponce['pandinginstallment'] = pandinginstallment
			cartResponce['currency'] = currency
			cartResponce['totalAmount'] = Generic.formatPriceDecimal(totalAmount)
			if (cart.bookings[0]?.nextInstalmentDate) {
				cartResponce['nextInstalmentDate'] = cart.bookings[0].nextInstalmentDate
			}

			cartResponce['cardDetail'] = await this.cardDetail(cart.bookings[0]?.cardToken)
			if (installmentType) {
				cartResponce['installmentType'] = installmentType
			}
			return cartResponce
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
	async cardDetail(transactionTotal) {
		const query = await getConnection()
			.createQueryBuilder(UserCard, "cartBooking")
			.where(`"card_token" = '${transactionTotal}'`)
			.getOne()
		//console.log(query.cardToken);

		return query
	}
	async getBookingDetail(bookingId: string) {
		try {
			let result = await this.bookingRepository.bookingDetail(bookingId);

			let paidAmount = 0;
			let remainAmount = 0;

			////console.log(result);

			if (result.bookingInstalments.length > 0) {
				result.bookingInstalments.sort((a, b) => a.id - b.id)

				//result.bookingInstalments.reverse()
			}
			for (let instalment of result.bookingInstalments) {
				if (instalment.paymentStatus == PaymentStatus.CONFIRM) {
					paidAmount += parseFloat(instalment.amount);
				} else {
					remainAmount += parseFloat(instalment.amount);
				}
			}
			result["paidAmount"] = result.bookingType == BookingType.NOINSTALMENT && result.paymentStatus == PaymentStatus.CONFIRM ? parseFloat(result.totalAmount) : paidAmount;
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
				//console.log("m");
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
			if (result.data[i].bookingInstalments.length > 0) {
				result.data[i].bookingInstalments.sort((a, b) => a.id - b.id)

				//result.data[i].bookingInstalments.reverse()
			}
			let paidAmount = 0;
			for (let instalment of result.data[i].bookingInstalments) {
				if (instalment.paymentStatus == PaymentStatus.CONFIRM) {
					paidAmount += parseFloat(instalment.amount);
				}
			}
			var totalAMount = result.data[i].totalAmount
			let remainAmount = totalAMount - paidAmount

			result.data[i]["paidAmount"] = result.data[i].bookingType == BookingType.NOINSTALMENT && result.data[i].paymentStatus == PaymentStatus.CONFIRM ? parseFloat(result.data[i].totalAmount) : paidAmount;
			result.data[i]["remainAmount"] = result.data[i].bookingType == BookingType.NOINSTALMENT && result.data[i].paymentStatus == PaymentStatus.CONFIRM ? 0 : remainAmount;
		}
		return result;
	}

	async upcomingPaymentForAdmin(listPaymentAdminDto: ListPaymentAdminDto) {
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
			search, product_id
		} = listPaymentAdminDto;

		let where;
		where = `"BookingInstalments"."attempt" = 0`;
		if (user_id) {
			where += `AND ("BookingInstalments"."user_id" = '${user_id}')`;
		}

		if (product_id) {
			where += `AND ("booking"."laytrip_booking_id" =  '${product_id}')`
		}

		if (booking_id) {
			where += `AND ("cart"."laytrip_cart_id" =  '${booking_id}')`
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

			const cipher = await CryptoUtility.encode(search)
			where += `AND (("User"."first_name" = '${cipher}')or("User"."email" = '${cipher}')or("User"."last_name" = '${cipher}'))`;
		}
		const { data, total_count } = await this.bookingRepository.listPayment(where, limit, page_no);
		//const result: any = data;

		// for await (const instalment of result) {
		// 	if (instalment.bookingInstalments) {
		// 		let infoDate = instalment.bookingInstalments;
		// 		infoDate.reverse()
		// 		for (let index = 0; index < infoDate.length; index++) {
		// 			const element = infoDate[index];
		// 			if (element.instalmentDate == instalment.instalmentDate) {
		// 				//console.log(element.instalmentDate, instalment.instalmentDate, index);

		// 				instalment.installmentNo = index + 1;
		// 				exit;
		// 			}
		// 		}
		// 	}
		// }

		return {
			data: data, total_count: total_count
		};
	}

	async exportUpcomingPaymentForAdmin(listPaymentAdminDto: ExportPaymentAdminDto) {
		const {
			module_id,
			supplier,
			status,
			start_date,
			end_date,
			instalment_type,
			user_id,
			booking_id,
			search, product_id
		} = listPaymentAdminDto;

		let where;
		where = `"BookingInstalments"."attempt" = 0`;
		if (user_id) {
			where += `AND ("BookingInstalments"."user_id" = '${user_id}')`;
		}

		if (product_id) {
			where += `AND ("booking"."laytrip_booking_id" =  '${product_id}')`
		}

		if (booking_id) {
			where += `AND ("cart"."laytrip_cart_id" =  '${booking_id}')`
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
			const cipher = await CryptoUtility.encode(search)
			where += `AND (("User"."first_name" = '${cipher}')or("User"."email" = '${cipher}')or("User"."last_name" = '${cipher}'))`;
		}
		const { data, total_count } = await this.bookingRepository.exportPayment(where);
		//const result: any = data;

		// for await (const instalment of result) {
		// 	if (instalment.bookingInstalments) {
		// 		let infoDate = instalment.bookingInstalments;
		// 		infoDate.reverse()
		// 		for (let index = 0; index < infoDate.length; index++) {
		// 			const element = infoDate[index];
		// 			if (element.instalmentDate == instalment.instalmentDate) {
		// 				//console.log(element.instalmentDate, instalment.instalmentDate, index);

		// 				instalment.installmentNo = index + 1;
		// 				exit;
		// 			}
		// 		}
		// 	}
		// }

		return {
			data: data, total_count: total_count
		};
	}

	async activePaymentForAdmin(listPaymentAdminDto: ListPaymentAdminDto) {
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
			search, product_id
		} = listPaymentAdminDto;

		let where;
		where = `"BookingInstalments"."attempt" > 0`;
		if (user_id) {
			where += `AND ("BookingInstalments"."user_id" = '${user_id}')`;
		}

		if (product_id) {
			where += `AND ("booking"."laytrip_booking_id" =  '${product_id}')`
		}

		if (booking_id) {
			where += `AND ("cart"."laytrip_cart_id" =  '${booking_id}')`
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
			const cipher = await CryptoUtility.encode(search)
			where += `AND (("User"."first_name" = '${cipher}')or("User"."email" = '${cipher}')or("User"."last_name" = '${cipher}'))`;

		}
		const { data, total_count } = await this.bookingRepository.listPayment(where, limit, page_no);


		return {
			data: data, total_count: total_count
		};
	}
	async exportActivePaymentForAdmin(listPaymentAdminDto: ExportPaymentAdminDto) {
		const {
			module_id,
			supplier,
			status,
			start_date,
			end_date,
			instalment_type,
			user_id,
			booking_id,
			search, product_id
		} = listPaymentAdminDto;

		let where;
		where = `"BookingInstalments"."attempt" > 0`;
		if (user_id) {
			where += `AND ("BookingInstalments"."user_id" = '${user_id}')`;
		}

		if (product_id) {
			where += `AND ("booking"."laytrip_booking_id" =  '${product_id}')`
		}

		if (booking_id) {
			where += `AND ("cart"."laytrip_cart_id" =  '${booking_id}')`
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
			const cipher = await CryptoUtility.encode(search)
			where += `AND (("User"."first_name" = '${cipher}')or("User"."email" = '${cipher}')or("User"."last_name" = '${cipher}'))`;

		}
		const { data, total_count } = await this.bookingRepository.exportPayment(where);


		return {
			data: data, total_count: total_count
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
			let todayPrice = [];
			let availableBookingId = [];
			for await (const data of result.data) {
				const bookingData = data.booking
				// booking data
				const paidAmount = await this.paidAmountByUser(data.bookingId)
				const totalPaidAmount = await this.totalpaidAmount(data.bookingId)
				// value of amount paid by user
				//console.log(paidAmount);

				const markups = await this.getPreductionMarkup()
				// preduction markup maximum aur minimum value

				const predictiveDate = new Date(bookingData.predectedBookingDate);
				// predictive date for booking 

				//const predictiveMarkupAmount = await this.predictiveMarkupAmount(bookingData.totalAmount)

				// predictive markup amount for minimum paid by user 


				const predictiveBookingData: any = {}
				predictiveBookingData['booking_id'] = data.bookingId
				predictiveBookingData['cart_id'] = data.booking.cart.laytripCartId
				predictiveBookingData['net_price'] = data.netPrice
				predictiveBookingData['date'] = data.date
				predictiveBookingData['is_below_minimum'] = data.isBelowMinimum
				predictiveBookingData['remain_seat'] = data.remainSeat
				predictiveBookingData['selling_price'] = bookingData.totalAmount;
				predictiveBookingData['paid_amount'] = totalPaidAmount;
				predictiveBookingData['is_installation_on_track'] = paidAmount?.attempt == 1 && paidAmount?.paymentStatus == PaymentStatus.CONFIRM ? true : false
				predictiveBookingData['paid_amount_in_percentage'] = (totalPaidAmount * 100) / parseFloat(bookingData.totalAmount)
				predictiveBookingData['booking_status'] = bookingData.bookingStatus;
				// //console.log(bookingData.laytripBookingId);

				predictiveBookingData['departure_date'] = bookingData.checkInDate || ''
				predictiveBookingData['laytrip_booking_id'] = bookingData.laytripBookingId
				predictiveBookingData['bookIt'] = false;
				predictiveBookingData['module_name'] = bookingData.module.name;
				predictiveBookingData['booking_time_net_rate'] = bookingData.netRate


				predictiveBookingData['profit'] = parseFloat(bookingData.totalAmount) - data.netPrice;

				const net_rate_percentage_variation = ((data.netPrice - parseFloat(bookingData.netRate)) * 100) / parseFloat(bookingData.netRate);
				predictiveBookingData['net_rate_percentage_variation'] = net_rate_percentage_variation

				predictiveBookingData['is_minimum_installment_paid'] = false;
				predictiveBookingData['is_net_rate_price_change_below_threshold'] = false;
				predictiveBookingData['is_net_rate_price_change_above_threshold'] = false;
				//predictiveBookingData['is_last_date_for_booking'] = false;


				if (net_rate_percentage_variation == 0) {
					predictiveBookingData['net_rate_percentage_variation_stage'] = 'EQUAL'
					predictiveBookingData['profit_stage'] = 'EQUAL'
				} else {
					predictiveBookingData['net_rate_percentage_variation_stage'] = net_rate_percentage_variation > 0 ? 'UP' : 'DOWN';
					predictiveBookingData['profit_stage'] = net_rate_percentage_variation > 0 ? 'DOWN' : 'UP';
				}

				//predictiveBookingData['bookingData'] = bookingData;

				if (data.isBelowMinimum == true) {
					//console.log(`rule 1 :- flight below minimum`)
					predictiveBookingData.bookIt = true;
				}

				if (net_rate_percentage_variation > markups.minRatePercentage && predictiveBookingData['net_rate_percentage_variation_stage'] == 'DOWN') {
					//console.log(`rule 2 :- flight net rate less than the user book net rate`)
					predictiveBookingData.bookIt = true;
					predictiveBookingData['is_net_rate_price_change_below_threshold'] = true;
				}
				else if (net_rate_percentage_variation > markups.maxRatePercentage && predictiveBookingData['net_rate_percentage_variation_stage'] == 'UP') {
					//console.log(`rule 3 :- flight net rate less than the preduction markup max amount`)
					predictiveBookingData.bookIt = true;
					predictiveBookingData['is_net_rate_price_change_above_threshold'] = true;
				}

				// if (predictiveDate <= data.date) {
				// 	//console.log(`rule 4 :- last date for booking`)
				// 	predictiveBookingData.bookIt = true;
				// 	predictiveBookingData['is_last_date_for_booking'] = true;
				// }

				if (predictiveBookingData.paid_amount_in_percentage >= markups.minInstallmentPercentage) {
					predictiveBookingData.bookIt = true;
					predictiveBookingData['is_minimum_installment_paid'] = true;
				}
				const id = predictiveBookingData.laytrip_booking_id
				todayPrice.push(predictiveBookingData)
				availableBookingId.push(id)
			}
			const allBooking = await this.bookingRepository.getPendingBooking()
			let responce = []
			////console.log(todayPrice);

			for await (const booking of allBooking) {
				if (availableBookingId.indexOf(booking.laytripBookingId) != -1) {
					////console.log(availableBookingId.indexOf(booking.laytripBookingId));
					responce.push(todayPrice[availableBookingId.indexOf(booking.laytripBookingId)])

				}
				else {
					const paidAmount = await this.paidAmountByUser(booking.id)
					const totalPaidAmount = await this.totalpaidAmount(booking.id)
					//console.log(booking.laytripBookingId);
					//console.log('booking.laytripBookingId');
					const predictiveBookingData: any = {}
					predictiveBookingData['booking_id'] = booking.id
					predictiveBookingData['cart_id'] = booking.cart.laytripCartId
					predictiveBookingData['net_price'] = null
					predictiveBookingData['date'] = null
					predictiveBookingData['is_below_minimum'] = false
					predictiveBookingData['remain_seat'] = 0
					predictiveBookingData['module_name'] = booking.module.name;
					predictiveBookingData['selling_price'] = booking.totalAmount
					predictiveBookingData['paid_amount'] = totalPaidAmount;
					predictiveBookingData['is_installation_on_track'] = paidAmount.attempt <= 1 ? true : false
					predictiveBookingData['paid_amount_in_percentage'] = (totalPaidAmount * 100) / parseFloat(booking.totalAmount)
					predictiveBookingData['booking_status'] = booking.bookingStatus;
					predictiveBookingData['departure_date'] = booking.checkInDate || ''
					predictiveBookingData['laytrip_booking_id'] = booking.laytripBookingId
					predictiveBookingData['bookIt'] = false;
					predictiveBookingData['booking_time_net_rate'] = booking.netRate

					predictiveBookingData['profit'] = 0

					predictiveBookingData['net_rate_percentage_variation'] = 0

					predictiveBookingData['is_minimum_installment_paid'] = false;
					predictiveBookingData['is_net_rate_price_change_below_threshold'] = false;
					predictiveBookingData['is_net_rate_price_change_above_threshold'] = false;

					responce.push(predictiveBookingData)

				}
			}
			return { data: responce, count: responce.length }
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
		////console.log(bookingId);

		let query = await getManager()
			.createQueryBuilder(BookingInstalments, "instalment")
			.select([
				"instalment.amount",
				"instalment.paymentStatus",
				"instalment.attempt"
			])
			.where(`booking_id=:bookingId AND attempt != 0 `, { bookingId, paymentStatus: PaymentStatus.CONFIRM })
			.orderBy(`id`, "DESC")
			.getOne();
		// let amount = 0
		// let attempt = 0;
		// //for await (const data of query) {
		// 	amount = amount + parseFloat(data.amount)
		// 	attempt = 
		// 	// if (data.paymentStatus == PaymentStatus.CONFIRM) {
		// 	// 	attempt = data.attempt
		// 	// }

		// // }

		return query
	}

	async totalpaidAmount(bookingId) {
		////console.log(bookingId);

		let query = await getManager()
			.createQueryBuilder(BookingInstalments, "instalment")
			.select([
				"instalment.amount"
			])
			.where(`booking_id=:bookingId AND payment_status =:paymentStatus`, { bookingId, paymentStatus: PaymentStatus.CONFIRM })
			.orderBy(`id`, "DESC")
			.getMany();
		let amount = 0
		for await (const data of query) {
			amount = amount + parseFloat(data.amount)
		}

		return amount
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

	async getDailyPricesOfBooking(bookingId: string) {
		try {
			const result = await this.bookingRepository.getDailyPredictiveBookingPrices(bookingId);
			const data: any = result.predictiveBookingData
			if (!data.length) {
				throw new NotFoundException(
					`No data found`
				);
			}
			for await (const value of data) {
				value['laytripBookingId'] = result.laytripBookingId
			}

			if (data.length > 0) {
				data.sort((a, b) => b.id - a.id)

				//data.reverse()
			}

			return {
				result: data, count: data.length
			}

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

	async exportBookings(listBookingDto: ExportBookingDto) {
		try {
			let result = await this.bookingRepository.exportCSV(listBookingDto);

			let paidAmount = 0;
			let remainAmount = 0;

			////console.log(result);

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
				//console.log('m');
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


	async shareBooking(shareBookingDto: ShareBookingDto, user: User): Promise<{ message: any }> {
		const { emails, bookingId } = shareBookingDto

		const responce = await CartDataUtility.CartMailModelDataGenerate(bookingId)
		if (responce?.param) {
			let subject = responce.param.bookingType == BookingType.INSTALMENT ? `BOOKING ID ${responce.param.orderId} CONFIRMATION` : `BOOKING ID ${responce.param.orderId} CONFIRMATION`
			let emailId = ''
			for await (const email of emails) {
				emailId += email.email + ','
			}
			this.mailerService
				.sendMail({
					to: emailId,
					cc: responce.email,
					from: mailConfig.from,
					bcc: mailConfig.BCC,
					subject: subject,
					html: await LaytripCartBookingConfirmtionMail(responce.param),
				})
				.then((res) => {
					//console.log("res", res);
				})
				.catch((err) => {
					//console.log("err", err);
				});
			return {
				message: `Cart booking email send successfully`
			};
		} else {
			return {
				message: `We could not find your booking id please correct it.`
			};
		}

	}
	async getBookingIds() {

		return await this.bookingRepository.getBookingId()
	}


	async deleteBooking(deleteBookingDto: DeleteBookingDto, user: User) {
		const { booking_id, product_id } = deleteBookingDto

		let where = `("cartBooking"."laytrip_cart_id" =  '${booking_id}')`;
		if (product_id) {
			where += `AND ("booking"."laytrip_booking_id" = '${product_id}')`
		}
		if (user.roleId >= 5) {
			where += `AND ("cartBooking"."user_id" =  '${user.userId}')`
		}
		const query = await getConnection()
			.createQueryBuilder(CartBooking, "cartBooking")
			.leftJoinAndSelect("cartBooking.bookings", "booking")
			.where(where)
			.getOne();

		if (!query && !query.bookings.length) {
			throw new BadRequestException(`Given booking id not found`)
		}

		for await (const booking of query.bookings) {
			await getConnection()
				.createQueryBuilder()
				.update(Booking)
				.set({ bookingStatus: BookingStatus.CANCELLED, paymentStatus: PaymentStatus.CANCELLED })
				.where(`id =:id AND payment_status = ${PaymentStatus.PENDING}`, { id: booking.id })
				.execute();

			await getConnection()
				.createQueryBuilder()
				.update(BookingInstalments)
				.set({ paymentStatus: PaymentStatus.CANCELLED })
				.where(`booking_id =:id AND payment_status = ${PaymentStatus.PENDING}`, { id: booking.id })
				.execute();
		}
		if (product_id) {
			return {
				message: `Selected product cancel successfully `
			}
		}
		return {
			message: `Selected booking cancel successfully `
		}
	}
}
