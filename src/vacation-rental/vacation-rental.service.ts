import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotAcceptableException, NotFoundException } from '@nestjs/common';
import Axios from "axios";
import { LocationInfo } from './model/location.model';
import { getConnection, getManager } from 'typeorm';
import { AvailabilityVacationDto } from './dto/availability.dto';
import { AvailabilityVacationDetailsDto } from './dto/availabilty_details.dto';
import { VerifyAvailabilityDto } from './dto/verify_availability.dto';
import { BookingDto } from './dto/booking.dto';
import { MonakerStrategy } from './strategy/strategy';
import { Monaker } from './strategy/monaker';
import { HotelView } from 'src/entity/hotel-view.entity';
import { PaymentType } from 'src/enum/payment-type.enum';
import { DateTime } from 'src/utility/datetime.utility';
import * as moment from "moment";
import { User } from 'src/entity/user.entity';
import { GenderTilte } from 'src/enum/gender-title.enum';
import { InstalmentType } from 'src/enum/instalment-type.enum';
import { Instalment } from 'src/utility/instalment.utility';
import { PaymentService } from 'src/payment/payment.service';
import { errorMessage } from 'src/config/common.config';
import { BookingRepository } from 'src/booking/booking.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingType } from 'src/enum/booking-type.enum';
import { InstalmentStatus } from 'src/enum/instalment-status.enum';
import { PaymentStatus } from 'src/enum/payment-status.enum';
import { BookingInstalments } from 'src/entity/booking-instalments.entity';
import { PredictiveBookingData } from 'src/entity/predictive-booking-data.entity';
import { BookingStatus } from 'src/enum/booking-status.enum';
import { Role } from 'src/enum/role.enum';
import { TravelerInfo } from 'src/entity/traveler-info.entity';
import { Module } from 'src/entity/module.entity';
import { Currency } from 'src/entity/currency.entity';
import { Booking } from 'src/entity/booking.entity';
import { v4 as uuidv4 } from "uuid";
import * as uniqid from 'uniqid';
import { MailerService } from "@nestjs-modules/mailer";
import { LayCreditRedeem } from 'src/entity/lay-credit-redeem.entity';
import { FlightBookingEmailParameterModel } from 'src/config/email_template/model/flight-booking-email-parameter.model';
import * as config from "config";
import { FlightBookingConfirmtionMail } from 'src/config/email_template/flight-booking-confirmation-mail.html';
import { BookingFailerMail } from 'src/config/email_template/booking-failure-mail.html';
import { Language } from 'src/entity/language.entity';
import { HomeRentalBookingParameterModel, hotelData } from 'src/config/email_template/model/home-rental-booking-email-parameter.model';
import { HotelBookingConfirmationMail } from 'src/config/email_template/hotel-booking-confirmation-mail.html';
import { HomeRentalBookingConfirmationMail } from 'src/config/email_template/home-rental-confirmation-mail.html';
import { CancellationPolicy } from './model/room_details.model';
import { HomeRentalFullCalendarDto } from './dto/home-rental-full-calendar.dto';
import { LayCreditEarn } from 'src/entity/lay-credit-earn.entity';
import { RewordStatus } from 'src/enum/reword-status.enum';
import { RewordMode } from 'src/enum/reword-mode.enum';
import { PushNotification } from 'src/utility/push-notification.utility';
import { vacationCategoty } from './vacation-rental.const';
import { BookingDetailsUpdateMail } from 'src/config/email_template/booking-details-updates.html';
import { SearchFullTextDto } from './dto/search-full-text.dto';
import { Activity } from 'src/utility/activity.utility';
import { ModulesName } from 'src/enum/module.enum';
import { HomeRentalFlexibleDayDto } from './dto/home-rental-flexible-day.dto';
import { InjectTwilio, TwilioClient } from 'nestjs-twilio';
import { Twilio } from 'twilio';
import { TwilioSMS } from 'src/utility/sms.utility';

const mailConfig = config.get("email");

@Injectable()
export class VacationRentalService {

	constructor(
		@InjectRepository(BookingRepository)
		private bookingRepository: BookingRepository,
		private paymentService: PaymentService,
		private readonly mailerService: MailerService,
	) { }

	async getSearchLocation(searchLocation) {

		try {
			const hotels = await getManager()
				.createQueryBuilder(HotelView, "hotel_view")
				// .distinctOn(["hotel_id"])
				.select([
					'hotel_view.hotelId',
					"hotel_view.id",
					"hotel_view.hotelName",
					"hotel_view.city",
					"hotel_view.country"
				])
				.where("hotel_view.hotel_name ILIKE :name AND hotel_view.hotel_category IN(:...category)", { name: `%${searchLocation}%`, category: vacationCategoty })
				.getMany();

			const city = await getManager()
				.createQueryBuilder(HotelView, "hotel_view")
				.distinctOn(["city"])
				.select([
					"hotel_view.id",
					"hotel_view.city",
					"hotel_view.country",
				])
				.where("hotel_view.city ILIKE :name", { name: `%${searchLocation}%` })
				.getMany();

			let location: LocationInfo;
			let result = [];

			for (let i = 0; i < hotels.length; i++) {
				location = new LocationInfo();
				location.id = hotels[i]["id"]
					location.type = "hotel"
					location.display_name = hotels[i]["hotelName"]
					location.city = hotels[i]["city"]
					location.country = hotels[i]["country"]

				result.push(location);
			}

			for (let j = 0; j < city.length; j++) {
				location = new LocationInfo();
				location.id = city[j]["id"]
				location.type = "city"
					location.display_name = city[j]["city"] + "," + city[j]["country"]
					location.city = city[j]["city"]
					location.country = city[j]["country"]

				result.push(location)
			}

			if (!result.length) {
				throw new NotFoundException(`No found any location`)
			}
			return result;

		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No found any location`);
			}
			throw new InternalServerErrorException(error.message);
		}

	}

	async getSearchFullText(searchFullTextDto: SearchFullTextDto, user, headers) {
		await this.validateHeaders(headers);
		const monaker = new MonakerStrategy(new Monaker(headers));
		const result = new Promise((resolve) => resolve(monaker.searchFullText(searchFullTextDto, user, false)));

		Activity.addSearchLog(ModulesName.VACATION_RENTEL, searchFullTextDto, user.user_id);
		return result;
	}

	// async availabilityHotel(
	// 	availability: AvailabilityVacationDto,
	// 	user,
	// 	headers
	// ) {
	// 	await this.validateHeaders(headers);
	// 	const monaker = new MonakerStrategy(new Monaker(headers));
	// 	const result = new Promise((resolve) => resolve(monaker.checkAllavaiability(availability, user, false)));
	// 	return result;

	// }

	async unitTypeListAvailability(availabilityDetailsDto: AvailabilityVacationDetailsDto, headers, user) {
		await this.validateHeaders(headers);
		const monaker = new MonakerStrategy(new Monaker(headers));
		const result = new Promise((resolve) => resolve(monaker.unitTypeListAvailability(availabilityDetailsDto, user)));

		return result;

	}

	async verifyUnitAvailability(verifyAvailabilitydto: VerifyAvailabilityDto, headers, user) {
		await this.validateHeaders(headers);
		const monaker = new MonakerStrategy(new Monaker(headers));
		const result = new Promise((resolve) => resolve(monaker.verifyUnitTypeAvailability(verifyAvailabilitydto, user, true)));

		return result;
	}

	async homeRentalRevalidate(dto, user, header) {
		await this.validateHeaders(header);
		const monaker = new MonakerStrategy(new Monaker(header));
		let result = await monaker.homeRentalRevalidate(dto, user);
		return result;
	}

	cancellationPolicy(data) {
		// return data.map((item,i)=>item[i])
		console.log(data)
	}

	async booking(bookingDto: BookingDto, headers, user) {
		const headerDetails = await this.validateHeaders(headers);
		const {
			property_id,
			check_in_date,
			check_out_date,
			adult_count,
			number_and_children_ages = [],
			original_price,
			additional_amount,
			booking_through,
			card_token,
			custom_instalment_amount,
			custom_instalment_no,
			instalment_type,
			laycredit_points,
			payment_type,
			rate_plan_code,
			room_id,
			travelers,
		} = bookingDto;

		const monaker = new MonakerStrategy(new Monaker(headers));

		let verifyDto = {
			"property_id": property_id,
			"room_id": room_id,
			"original_price": original_price,
			"rate_plan_code": rate_plan_code,
			"check_in_date": check_in_date,
			"check_out_date": check_out_date,
			"adult_count": adult_count,
			"number_and_children_ages": number_and_children_ages
		};

		const verifyAvailabilityResult = await monaker.verifyUnitTypeAvailability(verifyDto, user, true);

		let bookingRequestInfo: any = {};

		if (verifyAvailabilityResult) {
			bookingRequestInfo.adult_count = adult_count;
				bookingRequestInfo.number_and_children_ages = number_and_children_ages.length != 0 ? number_and_children_ages.length : 0;
				bookingRequestInfo.net_rate = verifyAvailabilityResult["net_price"];

			if (payment_type == PaymentType.INSTALMENT) {
				bookingRequestInfo.selling_price = verifyAvailabilityResult["selling_price"];

			}
			else {
				if (typeof verifyAvailabilityResult["secondary_selling_price"] != 'undefined' && verifyAvailabilityResult["secondary_selling_price"] > 0) {

					bookingRequestInfo.selling_price = verifyAvailabilityResult["secondary_selling_price"];
				}
				else {
					bookingRequestInfo.selling_price = verifyAvailabilityResult["selling_price"];
				}
			}

			bookingRequestInfo.check_in_date = DateTime.convertDateFormat(
				check_in_date,
				"YYYY-MM-DD",
				"DD/MM/YYYY"
			);

			bookingRequestInfo.check_out_date = DateTime.convertDateFormat(
				check_out_date,
				"YYYY-MM-DD",
				"DD/MM/YYYY"
			);

			bookingRequestInfo.instalment_type = instalment_type;
			bookingRequestInfo.additional_amount = additional_amount;
			bookingRequestInfo.booking_through = booking_through;
			bookingRequestInfo.laycredit_points = laycredit_points;
			bookingRequestInfo.card_token = card_token;
		}

		let {
			selling_price,
		} = bookingRequestInfo;

		let currencyId = headerDetails.currency.id;
		const userId = user.user_id;

		let bookingDate = moment(new Date()).format("YYYY-MM-DD");
		let travelersDetails = await this.getTravelersInfo(
			travelers
		);

		let locationInfo = {
			display_name: verifyAvailabilityResult["property_name"],
			city: verifyAvailabilityResult["city"],
			country: verifyAvailabilityResult["country"]
		}

		let booking_code = verifyAvailabilityResult["booking_code"];
		let net_price = verifyAvailabilityResult["net_price"];

		if (payment_type == PaymentType.INSTALMENT) {
			let instalmentDetails;

			let totalAdditionalAmount = additional_amount || 0;
			if (laycredit_points > 0) {
				totalAdditionalAmount = totalAdditionalAmount + laycredit_points;
			}
			if (instalment_type == InstalmentType.WEEKLY) {
				instalmentDetails = Instalment.weeklyInstalment(
					selling_price,
					check_in_date,
					bookingDate,
					totalAdditionalAmount,
					custom_instalment_amount,
					custom_instalment_no
				);
			}
			if (instalment_type == InstalmentType.BIWEEKLY) {
				instalmentDetails = Instalment.biWeeklyInstalment(
					selling_price,
					check_in_date,
					bookingDate,
					totalAdditionalAmount,
					custom_instalment_amount,
					custom_instalment_no
				);
			}
			if (instalment_type == InstalmentType.MONTHLY) {
				instalmentDetails = Instalment.monthlyInstalment(
					selling_price,
					check_in_date,
					bookingDate,
					totalAdditionalAmount,
					custom_instalment_amount,
					custom_instalment_no
				);
			}

			if (instalmentDetails.instalment_available) {
				let firstInstalemntAmount =
					instalmentDetails.instalment_date[0].instalment_amount;
				if (laycredit_points > 0) {
					firstInstalemntAmount = firstInstalemntAmount - laycredit_points;
				}
				let authCardResult = await this.paymentService.authorizeCard(
					card_token,
					Math.ceil(firstInstalemntAmount * 100),
					"USD"
				);

				if (authCardResult.status == true) {
					let dayDiff = moment(check_in_date).diff(bookingDate, 'days');
					let bookingResult;

					if (dayDiff <= 90) {
						const monaker = new MonakerStrategy(new Monaker(headers));
						bookingResult = await monaker.booking(bookingDto, travelersDetails, booking_code, net_price)
					}

					let authCardToken = authCardResult.token;

					let captureCardresult;

					if (typeof bookingResult == "undefined" || bookingResult.booking_status == "success") {

						captureCardresult = await this.paymentService.captureCard(
							authCardToken
						);
					}
					else if (typeof bookingResult !== "undefined" && bookingResult.booking_status != "success") {
						await this.paymentService.voidCard(authCardToken);
						throw new HttpException(
							{
								status: 424,
								message: bookingResult.error_message,
							},
							424
						);
					}

					if (captureCardresult.status == true) {
						let laytripBookingResult = await this.saveBooking(
							bookingRequestInfo,
							currencyId,
							bookingDate,
							BookingType.INSTALMENT,
							userId,
							verifyAvailabilityResult,
							instalmentDetails,
							captureCardresult,
							bookingResult || null,
							travelers,
							locationInfo
						);
						this.sendBookingEmail(laytripBookingResult.laytripBookingId, check_in_date, check_out_date);
						return {
							laytrip_booking_id: laytripBookingResult.id,
							booking_status: "pending",
							supplier_booking_id: "",
							success_message: `Booking is in pending state!`,
							error_message: "",
							booking_details: await this.bookingRepository.getBookingDetails(
								laytripBookingResult.laytripBookingId
							),
						};
					} else {
						throw new BadRequestException(
							`Card capture is failed&&&card_token&&&${errorMessage}`
						);
					}
				} else {
					throw new BadRequestException(
						`Card authorization is failed&&&card_token&&&${errorMessage}`
					);
				}
			} else {
				throw new BadRequestException(
					`Instalment option is not available for your search criteria`
				);
			}
		}
		else if (payment_type == PaymentType.NOINSTALMENT) {
			let sellingPrice = selling_price;
			if (laycredit_points > 0) {
				sellingPrice = selling_price - laycredit_points
			}

			if (sellingPrice > 0) {

				let authCardResult = await this.paymentService.authorizeCard(
					card_token,
					Math.ceil(sellingPrice * 100),
					"USD"
				);
				// console.log("authcard", authCardResult)
				if (authCardResult.status == true) {

					const monaker = new MonakerStrategy(new Monaker(headers));
					const bookingResult = await monaker.booking(
						bookingDto,
						travelersDetails,
						booking_code,
						net_price
					);

					let authCardToken = authCardResult.token;
					if (bookingResult.booking_status == "success") {
						let captureCardresult = await this.paymentService.captureCard(
							authCardToken
						);
						let laytripBookingResult = await this.saveBooking(
							bookingRequestInfo,
							currencyId,
							bookingDate,
							BookingType.NOINSTALMENT,
							userId,
							verifyAvailabilityResult,
							null,
							captureCardresult,
							bookingResult,
							travelers,
							locationInfo
						);

						//send email here
						this.sendBookingEmail(laytripBookingResult.laytripBookingId, check_in_date, check_out_date);
						bookingResult.laytrip_booking_id = laytripBookingResult.id;
						bookingResult.booking_details = await this.bookingRepository.getBookingDetails(
							laytripBookingResult.laytripBookingId
						);

						return bookingResult;
					} else {
						await this.paymentService.voidCard(authCardToken);
						throw new HttpException(
							{
								status: 424,
								message: bookingResult.error_message,
							},
							424
						);
					}
				} else {
					throw new BadRequestException(
						`Card authorization is failed&&&card_token&&&${errorMessage}`
					);
				}
			} else {
				//for full laycredit rdeem
				const monaker = new MonakerStrategy(new Monaker(headers));
				const bookingResult = await monaker.booking(
					bookingDto,
					booking_code,
					travelersDetails,
					net_price
				);

				if (bookingResult.booking_status == "success") {

					let laytripBookingResult = await this.saveBooking(
						bookingRequestInfo,
						currencyId,
						bookingDate,
						BookingType.NOINSTALMENT,
						userId,
						verifyAvailabilityResult,
						null,
						null,
						bookingResult,
						travelers,
						locationInfo
					);
					//send email here
					this.sendBookingEmail(laytripBookingResult.laytripBookingId, check_in_date, check_out_date);

					bookingResult.laytrip_booking_id = laytripBookingResult.id;
					bookingResult.booking_details = await this.bookingRepository.getBookingDetails(
						laytripBookingResult.laytripBookingId
					);
					return bookingResult;
				} else {
					throw new HttpException(
						{
							status: 424,
							message: bookingResult.error_message,
						},
						424
					);
				}
			}
		}

	}

	async saveBooking(
		bookFlightDto,
		currencyId,
		bookingDate,
		bookingType,
		userId,
		moduleInfo,
		instalmentDetails = null,
		captureCardresult = null,
		supplierBookingData,
		travelers,
		locationInfo
	) {
		const {
			selling_price,
			net_rate,
			instalment_type,
			laycredit_points,
			card_token,
			booking_through,
			check_in_date,
			check_out_date
		} = bookFlightDto;

		let moduleDetails = await getManager()
			.createQueryBuilder(Module, "module")
			.where(`"module"."name"=:name`, { name: "home rental" })
			.getOne();
		if (!moduleDetails) {
			throw new BadRequestException(
				`Please configure flight module in database&&&module_id&&&${errorMessage}`
			);
		}

		let currencyDetails = await getManager()
			.createQueryBuilder(Currency, "currency")
			.where(`"currency"."id"=:currencyId and "currency"."status"=true`, {
				currencyId,
			})
			.getOne();

		let booking = new Booking();
		booking.id = uuidv4();
		booking.moduleId = moduleDetails.id;
		booking.laytripBookingId = `LTV${uniqid.time().toUpperCase()}`;
		booking.bookingType = bookingType;
		booking.currency = currencyId;
		booking.totalAmount = selling_price.toString();
		booking.netRate = net_rate.toString();
		booking.markupAmount = (selling_price - net_rate).toString();
		booking.bookingDate = bookingDate;
		booking.usdFactor = currencyDetails.liveRate.toString();
		booking.layCredit = laycredit_points || 0;
		booking.bookingThrough = booking_through || '';

		booking.userId = userId;

		if (laycredit_points > 0) {

			const layCreditReedem = new LayCreditRedeem();
			layCreditReedem.userId = userId;
			layCreditReedem.points = laycredit_points;
			layCreditReedem.redeemDate = moment().format('YYYY-MM-DD');
			layCreditReedem.status = 1;
			layCreditReedem.redeemMode = 'auto';
			layCreditReedem.description = '';
			layCreditReedem.redeemBy = userId;
			await layCreditReedem.save();
		}

		if (instalmentDetails) {
			booking.totalInstallments = instalmentDetails.instalment_date.length;
			if (instalmentDetails.instalment_date.length > 1) {
				booking.nextInstalmentDate =
					instalmentDetails.instalment_date[1].instalment_date;
			}

			booking.bookingStatus = supplierBookingData != null && supplierBookingData.supplier_booking_id ? BookingStatus.CONFIRM : BookingStatus.PENDING;
			booking.paymentStatus = PaymentStatus.PENDING;
			booking.supplierBookingId = supplierBookingData != null && supplierBookingData.supplier_booking_id ? supplierBookingData.supplier_booking_id : "";
			booking.isPredictive = supplierBookingData != null && supplierBookingData.supplier_booking_id ? false : true;
			booking.supplierStatus = (supplierBookingData != null && supplierBookingData.supplier_status == 'BOOKINGINPROCESS') ? 0 : 1;
		} else {
			//pass here mystifly booking id
			booking.supplierBookingId = supplierBookingData.supplier_booking_id;
			booking.supplierStatus = (supplierBookingData != null && supplierBookingData.supplier_status == 'BOOKINGINPROCESS') ? 0 : 1;
			//booking.supplierBookingId = "";
			booking.bookingStatus = BookingStatus.CONFIRM;
			booking.paymentStatus = PaymentStatus.CONFIRM;
			booking.isPredictive = false;
			booking.totalInstallments = 0;
		}
		booking.cardToken = card_token;

		booking.moduleInfo = [moduleInfo];
		booking.checkInDate = await this.changeDateFormat(check_in_date)
		booking.checkOutDate = await this.changeDateFormat(check_out_date)
		booking.locationInfo = locationInfo
		try {
			let bookingDetails = await booking.save();

			await this.saveTravelers(bookingDetails.id, userId, travelers);
			if (instalmentDetails) {
				let bookingInstalments: BookingInstalments[] = [];
				let bookingInstalment = new BookingInstalments();

				let i = 0;
				for (let instalment of instalmentDetails.instalment_date) {
					bookingInstalment = new BookingInstalments();
					bookingInstalment.bookingId = bookingDetails.id;
					bookingInstalment.userId = userId;
					bookingInstalment.moduleId = moduleDetails.id;
					bookingInstalment.instalmentType = instalment_type;
					bookingInstalment.instalmentDate = instalment.instalment_date;
					bookingInstalment.currencyId = currencyId;
					bookingInstalment.amount = instalment.instalment_amount;
					bookingInstalment.instalmentStatus =
						i == 0 ? InstalmentStatus.PAID : InstalmentStatus.PENDING;
					bookingInstalment.transactionToken =
						i == 0 ? captureCardresult.token : null;
					bookingInstalment.paymentStatus =
						i == 0 ? PaymentStatus.CONFIRM : PaymentStatus.PENDING;
					bookingInstalment.attempt =
						i == 0 ? 1 : 0;
					bookingInstalment.supplierId = 1;
					bookingInstalment.isPaymentProcessedToSupplier = 0;
					bookingInstalment.isInvoiceGenerated = 0;
					i++;
					bookingInstalments.push(bookingInstalment);
				}

				await getConnection()
					.createQueryBuilder()
					.insert()
					.into(BookingInstalments)
					.values(bookingInstalments)
					.execute();
			}
			const predictiveBooking = new PredictiveBookingData
			predictiveBooking.bookingId = booking.id
			predictiveBooking.date = new Date()
			predictiveBooking.netPrice = parseFloat(booking.netRate)
			predictiveBooking.isBelowMinimum = false
			predictiveBooking.price = parseFloat(booking.totalAmount);
			predictiveBooking.remainSeat = 0
			await predictiveBooking.save()
			return await this.bookingRepository.getBookingDetails(booking.laytripBookingId);
		} catch (error) {
			console.log(error);
		}
	}

	async saveTravelers(bookingId, userId, travelers: any) {
		// const userData = await getManager()
		// 	.createQueryBuilder(User, "user")
		// 	.select(["user.roleId", "user.userId"])
		// 	.where(`"user"."user_id" =:user_id AND "user"."is_deleted" = false `, { user_id: userId })
		// 	.getOne();

		// var primaryTraveler = new TravelerInfo();

		// primaryTraveler.bookingId = bookingId;
		// primaryTraveler.userId = userId;
		// primaryTraveler.roleId = userData.roleId;

		// primaryTraveler.save();

		for await (var traveler of travelers) {
			if (typeof traveler.traveler_id) {
				var travelerId = traveler.traveler_id;

				var travelerUser = new TravelerInfo();
				travelerUser.bookingId = bookingId;
				travelerUser.userId = travelerId;
				travelerUser.roleId = Role.TRAVELER_USER;
				await travelerUser.save();
			}
		}
	}

	async sendBookingEmail(bookingId, check_in_date, check_out_date) {
		const bookingData = await this.bookingRepository.bookingDetail(bookingId);
		if (bookingData.bookingStatus < 2) {
			var param = new HomeRentalBookingParameterModel();
			const user = bookingData.user;
			const moduleInfo = bookingData.moduleInfo
			const travelers = bookingData.travelers
			let hotelInfo = new hotelData();
			var status = bookingData.bookingStatus == 0 ? "Pending" : "Confirm";

			hotelInfo.property_name = moduleInfo[0]["property_name"]
			// hotelInfo.room_name = moduleInfo[0][""];
			hotelInfo.city = moduleInfo[0]["city"];
			hotelInfo.country = moduleInfo[0]["country"]
			hotelInfo.check_in_date = check_in_date;
			hotelInfo.check_out_date = check_out_date;
			hotelInfo.cancellation_policy = moduleInfo[0]["cancellation_policy"]

			console.log("cancellation policy-------------->", hotelInfo.cancellation_policy)

			var paymentDetail = bookingData.bookingInstalments;
			var installmentDetail = [];
			var EmailSubject = '';
			if (bookingData.bookingType == BookingType.INSTALMENT) {
				EmailSubject = "Home Rental Booking Details";
				for await (const installment of paymentDetail) {
					installmentDetail.push({
						amount: bookingData.currency2.symbol + installment.amount,
						date: await this.formatDate(installment.instalmentDate),
						status: installment.paymentStatus == 1 ? 'Confirm' : 'Pending'
					})
				}
			}
			else {
				EmailSubject = "Home Rental Booking Confirmation"
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

			param.user_name = `${user.firstName}  ${user.lastName}`;
			param.booking_status = status;
			param.hotelData = hotelInfo;
			param.orderId = bookingData.id;
			param.paymentDetail = installmentDetail;
			param.travelers = travelerInfo

			this.mailerService
				.sendMail({
					to: user.email,
					from: mailConfig.from,
					bcc: mailConfig.BCC,
					subject: EmailSubject,
					html: await HomeRentalBookingConfirmationMail(param)
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
					bcc: mailConfig.BCC,
					subject: "Flight Booking Failed",
					html: BookingFailerMail({
						error: null
					}),

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

	async fullcalenderRate(searchHomeRental: HomeRentalFullCalendarDto, header, user) {
		const { name, type, adult_count, number_and_children_ages, start_date, end_date, check_in_date } = searchHomeRental;

		const monaker = new MonakerStrategy(new Monaker(header));

		const startDate = new Date(start_date);
		console.log("Start date===>", startDate);
		const endDate = new Date(end_date);
		const checkIndate = new Date(check_in_date);

		const dayDiffrence = await this.getDifferenceInDays(startDate, endDate)

		console.log("Diffrence--->", dayDiffrence);

		// console.log("leap year---->", is_leap_year);
		var result = [];

		var resultIndex = 0;
		var flag = 1;
		for (let index = 0; index <= dayDiffrence; index++) {

			if (start_date != check_in_date) {
				if (flag == 1) {
					startDate.setDate(startDate.getDate());
				} else {
					startDate.setDate(startDate.getDate() + 1);
				}

			} else {
				startDate.setDate(startDate.getDate() + 1);
			}

			var check_out_date = startDate.toISOString().split('T')[0];
			check_out_date = check_out_date
				.replace(/T/, " ") // replace T with a space
				.replace(/\..+/, "");
			console.log("checkout date--->", check_out_date);
			let dto = {
				"name": name,
				"type": type,
				"check_in_date": check_in_date,
				"check_out_date": check_out_date,
				"number_and_children_ages": number_and_children_ages,
				"adult_count": adult_count,
			}

			var diff = await this.getDifferenceInDays(checkIndate, new Date(check_out_date));

			// console.log("difference===>", diff);
			result[resultIndex] = await monaker.searchFullText(dto, user, true);

			// if ((getMonth % 2) != 0) {
			// 	if (getMonth == 1) {
			// 		if (is_leap_year) {
			// 			if (diff <= 28) {
			// 				result[resultIndex] = await monaker.searchFullText(dto, user, true);
			// 				// result[resultIndex] = new Promise((resolve) => resolve(monaker.checkAllavaiability(dto, user, true)));
			// 			}
			// 		} else {
			// 			if (diff <= 27) {
			// 				result[resultIndex] = await monaker.searchFullText(dto, user, true);
			// 				// result[resultIndex] = new Promise((resolve) => resolve(monaker.checkAllavaiability(dto, user, true)));
			// 			}
			// 		}
			// 	}
			// 	else if (diff <= 29) {
			// 		result[resultIndex] = await monaker.searchFullText(dto, user, true);
			// 		// result[resultIndex] = new Promise((resolve) => resolve(monaker.checkAllavaiability(dto, user, true)));
			// 	}
			// }
			// else {
			// 	if (diff <= 30) {
			// 		// result[resultIndex] = new Promise((resolve) => resolve(monaker.checkAllavaiability(dto, user, true)));
			// 		result[resultIndex] = await monaker.searchFullText(dto, user, true);
			// 	}
			// }

			resultIndex++;
			flag = 0;
		}

		const response = await Promise.all(result);
		// console.log("RESULT----->", response);
		let returnResponce = [];
		for await (const data of response) {
			if (!data.message) {
				var lowestprice = 0;
				var netRate = 0;
				var key = 0;
				var checkin_date = '';
				var checkout_date = '';
				var startPrice = 0;
				var secondaryStartPrice = 0;
				for await (const hoteltInfo of data.items) {
					// console.log("data", hoteltInfo)
					if (key == 0) {
						netRate = hoteltInfo.net_price;
						lowestprice = hoteltInfo.selling_price
						checkin_date = hoteltInfo.check_in_date
						checkout_date = hoteltInfo.check_out_date
						startPrice = hoteltInfo.start_price || 0
						secondaryStartPrice = hoteltInfo.secondary_start_price || 0
					}
					else if (lowestprice > hoteltInfo.selling_price) {
						netRate = hoteltInfo.net_price;
						lowestprice = hoteltInfo.selling_price
						checkin_date = hoteltInfo.check_in_date
						checkout_date = hoteltInfo.check_out_date
						startPrice = hoteltInfo.start_price || 0
						secondaryStartPrice = hoteltInfo.secondary_start_price || 0
					}
					key++;
				}
				var output = {
					check_in_date: checkin_date,
					check_out_date: checkout_date,
					net_rate: netRate,
					price: lowestprice,
					start_price: startPrice,
					secondary_start_price: secondaryStartPrice
				}


				returnResponce.push(output)
			}
		}

		if (returnResponce.length > 0) {
			let minPrice; let maxPrice;

			if (returnResponce[0].secondary_start_price > 0) {
				minPrice = Math.min.apply(null, returnResponce.map(item => item.secondary_start_price))
				maxPrice = Math.max.apply(null, returnResponce.map(item => item.secondary_start_price))
			}
			else {

				minPrice = Math.min.apply(null, returnResponce.map(item => item.price))
				maxPrice = Math.max.apply(null, returnResponce.map(item => item.price))
			}
			let diff = (maxPrice - minPrice) / 3;

			let priceRange = [minPrice];
			priceRange.push(minPrice + diff);
			priceRange.push(minPrice + diff + diff);
			priceRange.push(maxPrice);

			// console.log(minPrice,maxPrice,priceRange)

			let price;
			for (let i in returnResponce) {
				if (returnResponce[i].secondary_start_price > 0) {
					price = returnResponce[i].secondary_start_price;
				}
				else {
					price = returnResponce[i].price;
				}

				if (price >= priceRange[0] && price <= priceRange[1])
					returnResponce[i].flag = 'low';
				if (price > priceRange[1] && price <= priceRange[2])
					returnResponce[i].flag = 'medium';
				if (price > priceRange[2] && price <= priceRange[3])
					returnResponce[i].flag = 'high';
			}
		}

		return returnResponce;
	}

	async flexibleDayRate(searchHomeRental: HomeRentalFlexibleDayDto, header, user) {
		const monaker = new MonakerStrategy(new Monaker(header));

		const { name, type, check_in_date, check_out_date, adult_count, number_and_children_ages = [] } = searchHomeRental;

		const checkInDate = new Date(check_in_date);
		const checkOutDate = new Date(check_out_date);

		let dayDiffrence = await this.getDifferenceInDays(checkInDate, new Date());
		console.log(dayDiffrence)
		dayDiffrence = dayDiffrence <= 3 ? dayDiffrence : 3;

		var startDate = new Date(check_in_date);
		startDate.setDate(startDate.getDate() - dayDiffrence);

		var tourDiffrence = await this.getDifferenceInDays(checkInDate, checkOutDate);
		// console.log(tourDiffrence);

		const afterDateDiffrence = tourDiffrence <= 3 ? tourDiffrence : 3

		var endDate = new Date(check_in_date);
		endDate.setDate(endDate.getDate() + afterDateDiffrence);

		var result = [];

		var resultIndex = 0;

		const checkIn = startDate;


		var count = await this.getDifferenceInDays(startDate, endDate);
		// console.log(count);
		for (var index = 0; index <= count; index++) {
			var beforeDateString = checkIn.toISOString().split('T')[0];
			beforeDateString = beforeDateString
				.replace(/T/, " ") // replace T with a space
				.replace(/\..+/, "");

			const checkOut = new Date(checkIn);
			checkOut.setDate(checkOut.getDate() + tourDiffrence);
			console.log(checkOut)
			var afterDateString = checkOut.toISOString().split('T')[0];
			afterDateString = afterDateString
				.replace(/T/, " ") // replace T with a space
				.replace(/\..+/, "");

			let dto: any = {};

			dto.name = name;
				dto.type = type;
				dto.check_in_date = beforeDateString;
				dto.check_out_date = afterDateString;
				dto.adult_count = adult_count;

			if (number_and_children_ages.length != 0) {
				dto.number_and_children_ages = number_and_children_ages;
			}

			// console.log("DTO", dto);
			result[resultIndex] = await monaker.searchFullText(dto, user, true);
			checkIn.setDate(checkIn.getDate() + 1);
			resultIndex++;
		}

		const response = await Promise.all(result);

		let returnResponce = [];
		for await (const data of response) {
			if (!data.message) {
				var lowestprice = 0;
				var netRate = 0;
				var key = 0;
				var checkin_date = '';
				var checkout_date = '';
				var startPrice = 0;
				var secondaryStartPrice = 0;
				for await (const hoteltInfo of data.items) {
					// console.log("data", hoteltInfo)
					if (key == 0) {
						netRate = hoteltInfo.net_price;
						lowestprice = hoteltInfo.selling_price
						checkin_date = hoteltInfo.check_in_date
						checkout_date = hoteltInfo.check_out_date
						startPrice = hoteltInfo.start_price || 0
						secondaryStartPrice = hoteltInfo.secondary_start_price || 0
					}
					else if (lowestprice > hoteltInfo.selling_price) {
						netRate = hoteltInfo.net_price;
						lowestprice = hoteltInfo.selling_price
						checkin_date = hoteltInfo.check_in_date
						checkout_date = hoteltInfo.check_out_date
						startPrice = hoteltInfo.start_price || 0
						secondaryStartPrice = hoteltInfo.secondary_start_price || 0
					}
					key++;
				}
				var output = {
					check_in_date: checkin_date,
					check_out_date: checkout_date,
					net_rate: netRate,
					price: lowestprice,
					start_price: startPrice,
					secondary_start_price: secondaryStartPrice
				}


				returnResponce.push(output)
			}
		}
		return returnResponce;
	}

	async getDifferenceInDays(date1, date2) {
		console.log("date1", date1);
		console.log("date2", date2);

		const diffInMs = Math.abs(date2 - date1);
		console.log("diff", Math.floor(diffInMs / (1000 * 60 * 60 * 24)));
		return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
	}

	async deleteBooking(bookingId: string, userId) {
		const bookingData = await this.bookingRepository.getBookingDetails(bookingId)

		const checkInDate = new Date(bookingData.checkInDate)

		const date = new Date()

		if (bookingData.bookingStatus == BookingStatus.PENDING && bookingData.bookingType == BookingType.INSTALMENT && checkInDate > date) {
			const paidInstallment = await getConnection().query(
				`SELECT  sum(amount) as "total" FROM "booking_instalments" WHERE payment_status = ${PaymentStatus.CONFIRM} AND booking_id = ${bookingData.id}`
			)
			const point = parseFloat(paidInstallment[0].total) / parseFloat(bookingData.usdFactor)

			const laytripPoint = new LayCreditEarn

			laytripPoint.userId = bookingData.userId
			laytripPoint.points = point
			laytripPoint.earnDate = new Date()
			laytripPoint.status = RewordStatus.AVAILABLE
			laytripPoint.creditMode = RewordMode.CANCELBOOKING
			laytripPoint.description = `Booking ${bookingData.laytripBookingId} is canceled by admin`
			laytripPoint.creditBy = userId

			const savedLaytripPoint = await laytripPoint.save()
			if (savedLaytripPoint) {
				bookingData.bookingStatus = BookingStatus.CANCELLED
				await bookingData.save();
				return `booking (bookingData.laytripBookingId) is canceled successfully `
			}
			else {
				throw new InternalServerErrorException(errorMessage)
			}
		}
		else {
			if (bookingData.bookingStatus != BookingStatus.PENDING) {
				throw new BadRequestException(`Given booking not in pending state`)

			}
			if (bookingData.bookingType != BookingType.INSTALMENT) {
				throw new BadRequestException(`Given booking type is not a instalment`)
			}
			if (checkInDate > date) {
				throw new BadRequestException(`Booking depature date is a past date`)
			}

		}

		// 	// const monakar = new MonakerStrategy(new Monaker({}));
		// 	// const result = new Promise((resolve) => resolve(monakar.deleteBooking(reservationId)));
		// 	// return result;
	}

	async validateHeaders(headers) {
		let currency = headers.currency;
		let language = headers.language;
		if (typeof currency == "undefined" || currency == "") {
			throw new BadRequestException(`Please enter currency code&&&currency`);
		} else if (typeof language == "undefined" || language == "") {
			throw new BadRequestException(`Please enter language code&&&language`);
		}

		let currencyDetails = await getManager()
			.createQueryBuilder(Currency, "currency")
			.where(`"currency"."code"=:currency and "currency"."status"=true`, {
				currency,
			})
			.getOne();
		if (!currencyDetails) {
			throw new BadRequestException(`Invalid currency code sent!`);
		}

		let languageDetails = await getManager()
			.createQueryBuilder(Language, "language")
			.where(`"language"."iso_1_code"=:language and "language"."active"=true`, {
				language,
			})
			.getOne();
		if (!languageDetails) {
			throw new BadRequestException(`Invalid language code sent!`);
		}
		return {
			currency: currencyDetails,
			language: languageDetails,
		};
	}

	async getTravelersInfo(travelers) {

		let customer_count = 0;
		let customer_id;
		travelers.forEach((travelers) => {
			if (travelers.is_customer) {
				customer_count++;
				customer_id = travelers.traveler_id;
			}
		})

		if (customer_count == 0) {
			throw new NotAcceptableException(`You have only 1 customer selected`);
		}

		let travelerIds = travelers.map((traveler) => {
			return traveler.traveler_id;
		});

		let travelersResult = await getManager()
			.createQueryBuilder(User, "user")
			.leftJoinAndSelect("user.country", "countries")
			.leftJoinAndSelect("user.state", "states")
			.select([
				"user.userId",
				"user.title",
				"user.firstName",
				"user.lastName",
				"user.email",
				"user.countryCode",
				"user.phoneNo",
				"user.zipCode",
				"user.address",
				"user.cityName",
				"states.name",
				"user.gender",
				"user.dob",
				"user.passportNumber",
				"user.passportExpiry",
				"countries.name",
				"countries.iso2",
				"countries.iso3",
				"countries.id",
			])
			.where('"user"."user_id" IN (:...travelerIds)', { travelerIds })
			.getMany();

		let traveleDetails = {
			customer: {},
			guest: []
		};

		if (travelersResult.length > 0) {
			for (let i = 0; i < travelersResult.length; i++) {
				let ageDiff = moment(new Date()).diff(moment(travelersResult[i].dob), "years");

				if ((travelersResult[i].email == null || travelersResult[i].email == "") && ageDiff >= 12)
					throw new BadRequestException(
						`Email is missing for traveler ${travelersResult[i].firstName}`
					);
				if (
					(travelersResult[i].countryCode == null || travelersResult[i].countryCode == "") &&
					ageDiff >= 12
				)
					throw new BadRequestException(
						`Country code is missing for traveler ${travelersResult[i].firstName}`
					);
				if (
					(travelersResult[i].phoneNo == null || travelersResult[i].phoneNo == "") &&
					ageDiff >= 12
				)
					throw new BadRequestException(
						`Phone number is missing for traveler ${travelersResult[i].firstName}`
					);
				if (travelersResult[i].gender == null || travelersResult[i].gender == "")
					throw new BadRequestException(
						`Gender is missing for traveler ${travelersResult[i].firstName}`
					);
				if (travelersResult[i].dob == null || travelersResult[i].dob == "")
					throw new BadRequestException(
						`Dob is missing for traveler ${travelersResult[i].firstName}`
					);
				if (
					travelersResult[i].country == null ||
					(typeof travelersResult[i].country.iso2 !== "undefined" &&
						travelersResult[i].country.iso2 == "")
				)
					throw new BadRequestException(
						`Country code is missing for traveler ${travelersResult[i].firstName}`
					);
				if (
					travelersResult[i].state == null)
					throw new BadRequestException(
						`State name is missing for traveler ${travelersResult[i].firstName}`
					);
				if (travelersResult[i].address == null) {
					throw new BadRequestException(
						`Address is missing for traveler ${travelersResult[i].firstName}`
					);
				}
				if (travelersResult[i].cityName == null) {
					throw new BadRequestException(
						`City name is missing for traveler ${travelersResult[i].firstName}`
					);
				}
				if (travelersResult[i].zipCode == null) {
					throw new BadRequestException(
						`Zip code is missing for traveler ${travelersResult[i].firstName}`
					);
				}
				if (travelersResult[i].phoneNo == null) {
					throw new BadRequestException(
						`Phone no is missing for traveler ${travelersResult[i].firstName}`
					);
				}
				if (travelersResult[i].title == null) {
					throw new BadRequestException(
						`title is missing for traveler ${travelersResult[i].firstName}`
					);
				}
				if (customer_id == travelersResult[i].userId) {
					traveleDetails.customer = {
						firstName: travelersResult[i].firstName,
						lastName: travelersResult[i].lastName,
						address: travelersResult[i].address,
						city: travelersResult[i].cityName,
						stateOrTerritory: travelersResult[i].state.name,
						zip: travelersResult[i].zipCode,
						country: travelersResult[i].country.iso2,
						phoneNumber: travelersResult[i].phoneNo,
						email: travelersResult[i].email,
						salutation: travelersResult[i].title,
						dateOfBirth: travelersResult[i].dob,
						gender: travelersResult[i].gender
					}
				}
				else {
					let guestData = {
						firstName: travelersResult[i].firstName,
						lastName: travelersResult[i].lastName,
						address: travelersResult[i].address,
						city: travelersResult[i].cityName,
						stateOrTerritory: travelersResult[i].state.name,
						zip: travelersResult[i].zipCode,
						country: travelersResult[i].country.iso2,
						phoneNumber: travelersResult[i].phoneNo,
						email: travelersResult[i].email,
						salutation: travelersResult[i].title,
						dateOfBirth: travelersResult[i].dob,
						gender: travelersResult[i].gender
					}
					traveleDetails.guest.push(guestData);
				}

			}
			console.log("travers ==>", traveleDetails);
			return traveleDetails;
		} else {
			throw new BadRequestException(`Please enter valid traveler(s) id`);
		}
	}

	async changeDateFormat(dateTime) {
		var date = dateTime.split('/')

		return `${date[2]}-${date[1]}-${date[0]}`

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

	async partiallyBookVacationRental(bookingId, header) {
		const bookingData = await this.bookingRepository.getBookingDetails(bookingId)

		// console.log(bookingData.travelers);
		let travelers = [];
		let travelerInfo;
		if (new Date(await this.changeDateFormat(bookingData.checkInDate)) > new Date()) {
			travelerInfo = bookingData.travelers;
			for (let i = 0; i < travelerInfo.length; i++) {
				if (i == 0) {
					travelers.push({
						"is_customer": true,
						"traveler_id": travelerInfo[i].userId
					})
				} else {
					travelers.push({
						"is_customer": false,
						"traveler_id": travelerInfo[i].userId
					});
				}

			}

			let bookingDto = {
				"property_id": bookingData.moduleInfo[0]["property_id"],
				"room_id": bookingData.moduleInfo[0]["room_id"],
				"rate_plan_code": bookingData.moduleInfo[0]["rate_plan_code"],
				"check_in_date": bookingData.checkInDate,
				"check_out_date": bookingData.checkOutDate,
				"adult_count": bookingData.moduleInfo[0]["adult"],
				"original_price": bookingData.moduleInfo[0]["net_price"],
				"number_and_children_ages": bookingData.moduleInfo[0]["number_and_chidren_age"],
				"travelers": travelers,
				"payment_type": bookingData.bookingType,
				"instalment_type": bookingData.bookingType,
				"bookingDto.additional_amount": 0,
				"bookingDto.laycredit_points": 0
			}

			const user = bookingData.user

			const bookingId = bookingData.laytripBookingId;

			console.log("step-1 find vacation rental");

			const result = await this.partiallyVacationRentalBook(bookingDto, header, user, bookingId);

			this.sendFlightUpdateMail(bookingData.laytripBookingId, user.email, user.cityName)

			return result;

		}
	}


	async partiallyVacationRentalBook(bookingDto, header, user, bookingId) {
		let headerDetails = await this.validateHeaders(header);

		const {
			property_id,
			room_id,
			rate_plan_code,
			check_in_date,
			check_out_date,
			adult_count,
			number_and_children_ages,
			original_price,
			travelers,
			payment_type,
			instalment_type,
			additional_amount,
			laycredit_points
		} = bookingDto;

		// console.log(bookingDto)

		const monaker = new MonakerStrategy(new Monaker(header));
		const verifyAvailabilityResult = await monaker.verifyUnitTypeAvailability(bookingDto, user, true);

		// console.log("Verify result",verifyAvailabilityResult);

		let booking_code = verifyAvailabilityResult["booking_code"];
		let net_price = verifyAvailabilityResult["net_price"];

		let bookingRequestInfo: any = {};

		if (verifyAvailabilityResult) {
			bookingRequestInfo.adult_count = verifyAvailabilityResult["adult"];
				bookingRequestInfo.number_and_children_ages = verifyAvailabilityResult["number_and_chidren_age"];
				bookingRequestInfo.net_rate = verifyAvailabilityResult["net_price"];

			if (payment_type == PaymentType.INSTALMENT) {
				bookingRequestInfo.selling_price = verifyAvailabilityResult["selling_price"];

			}
			else {
				if (typeof verifyAvailabilityResult["secondary_selling_price"] != 'undefined' && verifyAvailabilityResult["secondary_selling_price"] > 0) {

					bookingRequestInfo.selling_price = verifyAvailabilityResult["secondary_selling_price"];
				}
				else {
					bookingRequestInfo.selling_price = verifyAvailabilityResult["selling_price"];
				}
			}

			bookingRequestInfo.check_in_date = DateTime.convertDateFormat(
				check_in_date,
				"YYYY-MM-DD",
				"DD/MM/YYYY"
			);

			bookingRequestInfo.check_out_date = DateTime.convertDateFormat(
				check_out_date,
				"YYYY-MM-DD",
				"DD/MM/YYYY"
			);

			bookingRequestInfo.instalment_type = instalment_type;
			bookingRequestInfo.additional_amount = additional_amount;
			bookingRequestInfo.laycredit_points = laycredit_points;
		}

		let travelersDetails = await this.getTravelersInfo(
			travelers,
		);

		let currencyId = headerDetails.currency.id;
		const userId = user.user_id;

		console.log("call booking api -2")

		const bookingResult = await monaker.booking(
			bookingDto,
			travelersDetails,
			booking_code,
			net_price,
		);

		// console.log("Booking result", bookingResult);

		if (bookingResult.booking_status == "success") {
			console.log(`step - 3 save Booking`, bookingResult);
			let bookingInfo = {
				"net_price": net_price
			};

			let laytripBookingResult = await this.partialyBookingSave(
				bookingInfo,
				currencyId,
				verifyAvailabilityResult,
				bookingId,
				bookingResult,
			);

			PushNotification.sendNotificationTouser(laytripBookingResult.userId,
				{  //you can send only notification or only data(or include both)
					module_name: 'booking',
					task: 'booking_done',
					bookingId: laytripBookingResult.laytripBookingId
				},
				{
					title: 'Booking',
					body: `We’re as excited for your trip as you are! please check all the details`
				},
				userId)

			//console.log(laytripBookingResult);

			//send email here
			console.log(`step - 4 mail`);
			this.sendBookingEmail(laytripBookingResult.laytripBookingId, check_in_date, check_out_date);
			bookingResult.laytrip_booking_id = laytripBookingResult.id;
			bookingResult.booking_details = await this.bookingRepository.getBookingDetails(
				laytripBookingResult.laytripBookingId
			);
			// console.log("----------------------------------->", bookingResult);
			return bookingResult;

		}
		else {
			throw new HttpException(bookingResult.error_message, 424)
		}
	}

	async partialyBookingSave(
		bookingDto,
		currencyId,
		moduleInfo,
		bookingId,
		supplierBookingData,
	) {
		const {
			net_price,
			fare_type
		} = bookingDto;

		let moduleDetails = await getManager()
			.createQueryBuilder(Module, "module")
			.where(`"module"."name"=:name`, { name: "home rental" })
			.getOne();
		if (!moduleDetails) {
			throw new BadRequestException(
				`Please configure flight module in database&&&module_id&&&${errorMessage}`
			);
		}

		let currencyDetails = await getManager()
			.createQueryBuilder(Currency, "currency")
			.where(`"currency"."id"=:currencyId and "currency"."status"=true`, {
				currencyId,
			})
			.getOne();

		let booking = await this.bookingRepository.getBookingDetails(bookingId);

		booking.bookingStatus = BookingStatus.CONFIRM;
		//console.log("Net rate", net_rate)

		booking.netRate = `${net_price}`;
		booking.usdFactor = `${currencyDetails.liveRate}`;
		booking.supplierBookingId = supplierBookingData.supplier_booking_id;
		booking.moduleInfo = [moduleInfo];
		try {
			let bookingDetails = await booking.save();
			return await this.bookingRepository.getBookingDetails(bookingDetails.laytripBookingId);
		} catch (error) {
			console.log(error);
		}
	}

	async sendFlightUpdateMail(bookingId, email, userName) {
		this.mailerService
			.sendMail({
				to: email,
				from: mailConfig.from,
				bcc: mailConfig.BCC,
				subject: "Booking detail updated",
				html: BookingDetailsUpdateMail({ username: userName }),
			})
			.then((res) => {
				console.log("res", res);
			})
			.catch((err) => {
				console.log("err", err);
			});
	}

}

