import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	BadRequestException,
	HttpException,
} from "@nestjs/common";
import { Strategy } from "./strategy/strategy";
import { OneWaySearchFlightDto } from "./dto/oneway-flight.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { AirportRepository } from "./airport.repository";
import { getManager, getConnection, In } from "typeorm";
import { RouteIdsDto } from "./dto/routeids.dto";
import { RoundtripSearchFlightDto } from "./dto/roundtrip-flight.dto";
import { Mystifly } from "./strategy/mystifly";
import { Currency } from "src/entity/currency.entity";
import { Language } from "src/entity/language.entity";
import { BookFlightDto } from "./dto/book-flight.dto";
import { User } from "src/entity/user.entity";
import * as moment from "moment";
import { PaymentType } from "src/enum/payment-type.enum";
import { Instalment } from "src/utility/instalment.utility";
import { InstalmentType } from "src/enum/instalment-type.enum";
import { Booking } from "src/entity/booking.entity";
import { v4 as uuidv4 } from "uuid";
import { BookingStatus } from "src/enum/booking-status.enum";
import { BookingType } from "src/enum/booking-type.enum";
import { PaymentStatus } from "src/enum/payment-status.enum";
import { Module } from "src/entity/module.entity";
import { errorMessage } from "src/config/common.config";
import { BookingInstalments } from "src/entity/booking-instalments.entity";
import { InstalmentStatus } from "src/enum/instalment-status.enum";
import { PaymentService } from "src/payment/payment.service";
import { GenderTilte } from "src/enum/gender-title.enum";
import { FlightJourney } from "src/enum/flight-journey.enum";
import { DateTime } from "src/utility/datetime.utility";
import { BookingRepository } from "src/booking/booking.repository";
import { FlightBookingEmailParameterModel } from "src/config/email_template/model/flight-booking-email-parameter.model";
import { FlightBookingConfirmtionMail } from "src/config/email_template/flight-booking-confirmation-mail.html";
import { MailerService } from "@nestjs-modules/mailer";
import { TravelerInfo } from "src/entity/traveler-info.entity";
import { Role } from "src/enum/role.enum";
import { LayCreditRedeem } from "src/entity/lay-credit-redeem.entity";
import { PreductBookingDateDto } from "./dto/preduct-booking-date.dto";
import { FullCalenderRateDto } from "./dto/full-calender-date-rate.dto";
//import { Airport } from 'src/entity/airport.entity';
//import { allAirpots } from './all-airports';
import * as config from "config";
import { BookingService } from "src/booking/booking.service";
import { BookingFailerMail } from "src/config/email_template/booking-failure-mail.html";
import { PriceMarkup } from "src/utility/markup.utility";
import { NetRateDto } from "./dto/net-rate.dto";
import { Generic } from "src/utility/generic.utility";
const mailConfig = config.get("email");
import * as uniqid from 'uniqid';
import { PredictionFactorMarkup } from "src/entity/prediction-factor-markup.entity";
import { InstalmentService } from "src/instalment/instalment.service";
import { exit } from "process";
import { ManullyBookingDto } from "./dto/manully-update-flight.dto";
import { airports } from "./airports";
import { BookingDetailsUpdateMail } from "src/config/email_template/booking-details-updates.html";
import { match } from "assert";

@Injectable()
export class FlightService {
	constructor(
		@InjectRepository(AirportRepository)
		private airportRepository: AirportRepository,

		@InjectRepository(BookingRepository)
		private bookingRepository: BookingRepository,

		private paymentService: PaymentService,

		private instalmentService: InstalmentService,

		private readonly mailerService: MailerService
	) { }

	/**
	 * 
	 * @param name 
	 * @param type [mobile, web]
	 */
	async searchAirport(name: String, type: string) {
		try {
			let result = await this.airportRepository.find({
				where: `("code" ILIKE '%${name}%' or "name" ILIKE '%${name}%' or "city" ILIKE '%${name}%' or "country" ILIKE '%${name}%') and status=true and is_deleted=false`,
				order: { parentId: 'ASC' }
			});
			if (type == 'web')
				result = this.sortAirport(result)
			else
				result = this.getNestedChildren(result, 0, true)

			if (!result.length)
				throw new NotFoundException(`No Airport Found.&&&name`);
			return result;
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No Airport Found.&&&name`);
			}
			throw new InternalServerErrorException(error.message);
		}
	}

	sortAirport(airports) {
		let result = [];
		for (let airport of airports) {

			let find = result.findIndex(x => x.id === airport.parentId);

			if (find > -1) {
				result.splice(find + 1, 0, airport)
			}
			else {
				result.push(airport)
			}
		}

		return result;
	}
	getNestedChildren(arr, parent, param) {
		let out = [];
		for (let i in arr) {
			arr[i].display_name = `${arr[i].city},${arr[i].country},(${arr[i].code}),${arr[i].name}`;
			if (arr[i].parentId == parent) {
				let children = this.getNestedChildren(arr, arr[i].id, false);

				if (children.length) {
					arr[i].sub_airport = children;
				} else {
					arr[i].sub_airport = [];
				}
				arr[
					i
				].display_name = `${arr[i].city},${arr[i].country},(${arr[i].code}),${arr[i].name}`;
				out.push(arr[i]);
			}


		}

		if (param === true && arr.length == 1 && arr[0].parentId != 0) {
			arr['display_name'] = `${arr.city},${arr.country},(${arr.code}),${arr.name}`;
			out.push(arr[0]);
		}
		return out;
	}

	/* async mapChildParentAirport(name:String){

		for(let airport of allAirpots){

			await getConnection()
			.createQueryBuilder()
				.update(Airport)
				.set({ 
					parentId : airport.id
				})
				.where(`(country=:country and city=:city and  name!=:name)`, { country:airport.country, city:airport.city, name:airport.name })
				.execute();
		}
		return true;
	} */

	async getSellingPrice(netRateDto: NetRateDto, user) {

		const {
			departure_date,
			net_rate
		} = netRateDto;

		let module = await getManager()
			.createQueryBuilder(Module, "module")
			.where("module.name = :name", { name: 'flight' })
			.getOne();

		const bookingDate = moment().format("YYYY-MM-DD");
		let result = await this.getMarkupDetails(departure_date, bookingDate, user, module);
		let sellingPrice = PriceMarkup.applyMarkup(net_rate, result.markUpDetails);
		let secondarySellingPrice = PriceMarkup.applyMarkup(net_rate, result.secondaryMarkUpDetails) || 0;

		sellingPrice = Generic.formatPriceDecimal(sellingPrice);
		secondarySellingPrice = Generic.formatPriceDecimal(secondarySellingPrice);

		let response = [];
		const mystifly = new Strategy(new Mystifly({}));
		response[0] = {
			net_rate: net_rate,
			selling_price: sellingPrice,
			secondary_selling_price: secondarySellingPrice
		}
		return response;
	}

	async getMarkupDetails(departure_date, bookingDate, user, module) {
		let isInstalmentAvaible = Instalment.instalmentAvailbility(departure_date, bookingDate);

		let markUpDetails;
		let secondaryMarkUpDetails;
		if (!user.roleId || user.roleId == 7) {

			markUpDetails = await PriceMarkup.getMarkup(module.id, user.roleId, 'no-instalment');
		}
		else if (isInstalmentAvaible && (user.roleId == 5 || user.roleId == 6)) {

			markUpDetails = await PriceMarkup.getMarkup(module.id, user.roleId, 'instalment');
			secondaryMarkUpDetails = await PriceMarkup.getMarkup(module.id, user.roleId, 'no-instalment');
		}
		else {
			markUpDetails = await PriceMarkup.getMarkup(module.id, user.roleId, 'no-instalment');
		}

		if (!markUpDetails) {
			throw new InternalServerErrorException(`Markup is not configured for flight&&&module&&&${errorMessage}`);
		}
		else {
			return {
				markUpDetails,
				secondaryMarkUpDetails
			}
		}
	}

	async searchOneWayFlight(
		searchFlightDto: OneWaySearchFlightDto,
		headers,
		user
	) {
		await this.validateHeaders(headers);
		const mystifly = new Strategy(new Mystifly(headers));
		const result = new Promise((resolve) =>
			resolve(mystifly.oneWaySearch(searchFlightDto, user))
		);
		return result;
	}

	async searchOneWayZipFlight(searchFlightDto, headers, user) {
		await this.validateHeaders(headers);
		const mystifly = new Strategy(new Mystifly(headers));
		const result = new Promise((resolve) =>
			resolve(mystifly.oneWaySearchZip(searchFlightDto, user))
		);
		return result;
	}

	async tripDetails(tripId) {
		const mystifly = new Strategy(new Mystifly({}));
		const result = new Promise((resolve) => resolve(mystifly.tripDetails(tripId))
		);
		return result;
	}

	async searchRoundTripZipFlight(searchFlightDto, headers, user) {
		await this.validateHeaders(headers);
		const mystifly = new Strategy(new Mystifly(headers));
		const result = new Promise((resolve) =>
			resolve(mystifly.roundTripSearchZip(searchFlightDto, user))
		);
		return result;
	}




	async preductBookingDate(serchFlightDto: PreductBookingDateDto, headers, user: User) {
		await this.validateHeaders(headers);

		const mystifly = new Strategy(new Mystifly(headers));

		const { source_location, destination_location, departure_date, flight_class, adult_count, child_count, infant_count, unique_token, isRoundtrip, arrivale_date } = serchFlightDto;

		const depatureDate = new Date(departure_date);

		const currentDate = new Date();

		const dayDiffrence = await this.getDifferenceInDays(depatureDate, currentDate)

		var weeklylastdate = depatureDate;

		var result = [];

		for (let index = 0; index <= Math.floor(dayDiffrence / 7); index++) {

			var date = weeklylastdate.toISOString().split('T')[0];
			date = date
				.replace(/T/, " ") // replace T with a space
				.replace(/\..+/, "");
			if (isRoundtrip) {
				let dto = {
					"source_location": source_location,
					"destination_location": destination_location,
					"departure_date": date,
					"arrival_date": arrivale_date,
					"flight_class": flight_class,
					"adult_count": adult_count,
					"child_count": child_count,
					"infant_count": infant_count
				}
				result[index] = new Promise((resolve) => resolve(mystifly.roundTripSearchZip(dto, user)));
			} else {
				let dto = {
					"source_location": source_location,
					"destination_location": destination_location,
					"departure_date": date,
					"flight_class": flight_class,
					"adult_count": adult_count,
					"child_count": child_count,
					"infant_count": infant_count
				}
				result[index] = new Promise((resolve) => resolve(mystifly.oneWaySearchZip(dto, user)));
			}

			weeklylastdate.setDate(weeklylastdate.getDate() - 7);

		}

		const response = await Promise.all(result);

		var lowestPriceIndex = 0;
		var lowestprice = 0
		let returnResponce = [];
		var key = 0;
		var preductionMarkup = 0
		var minimumForInstallment = 0;
		var depature = '';
		const DepatureDateData = response[0];
		var installmentDTO = null;

		if (!DepatureDateData.message) {
			for await (const flightData of DepatureDateData.items) {
				if (unique_token == flightData.unique_code) {
					console.log(flightData)
					const markupValue = await this.getValueWithPreductionPercentage(flightData.net_rate)
					preductionMarkup = flightData.net_rate + markupValue;
					depature = flightData.departure_date
					minimumForInstallment = (flightData.selling_price * 60) / 100
					installmentDTO = {
						"instalment_type": "weekly",
						"checkin_date": departure_date,
						"booking_date": moment(new Date()).format("YYYY-MM-DD"),
						"amount": flightData.selling_price,
						"additional_amount": 0,
						"custom_instalment_no": null,
						"custom_amount": 0
					}
					console.log(preductionMarkup)
					console.log(minimumForInstallment)
					console.log(installmentDTO);

				}
			}
		}

		for await (const data of response) {
			if (!data.message) {
				for await (const flightData of data.items) {
					if (unique_token == flightData.unique_code) {
						var is_booking_avaible = false;
						if (key == 0) {
							lowestPriceIndex = key
							lowestprice = flightData.net_rate;
							is_booking_avaible = true;
						}
						// else if (lowestprice == flightData.net_rate && returnResponce[lowestPriceIndex].date > flightData.departure_date) {

						// 	returnResponce[lowestPriceIndex].is_booking_avaible = false
						// 	lowestPriceIndex = key
						// 	lowestprice = flightData.net_rate;
						// 	is_booking_avaible = true
						// }
						else if (lowestprice > flightData.net_rate || preductionMarkup > flightData.net_rate) {
							returnResponce[lowestPriceIndex].is_booking_avaible = false
							lowestPriceIndex = key
							lowestprice = flightData.net_rate;
							is_booking_avaible = true
						}

						var output = {
							date: flightData.departure_date,
							price: flightData.net_rate,
							is_booking_avaible: is_booking_avaible
						}

						returnResponce.push(output)
						key++;

					}
					// console.log(flightData.unique_code);
					// console.log(flightData.net_rate);
					// console.log(flightData.departure_date);
				}
			}

		}


		if (returnResponce[lowestPriceIndex]['date'] && returnResponce[lowestPriceIndex]['date'] == depature) {
			console.log(returnResponce[lowestPriceIndex]);
			const Installments = await this.instalmentService.calculateInstalemnt(installmentDTO)

			console.log(Installments);
			if (Installments.instalment_available == true) {
				var totalOfInstallment = 0;
				for (let index = 0; index < Installments.instalment_date.length; index++) {
					const element = Installments.instalment_date[index];

					totalOfInstallment = totalOfInstallment + element.instalment_amount

					if (totalOfInstallment > minimumForInstallment) {
						returnResponce[lowestPriceIndex].is_booking_avaible = false
						var o = {
							date: element.instalment_date,
							price: totalOfInstallment,
							is_booking_avaible: true,
							message: `Prediction date based on 60% of Installment value`
						}

						return [o]

					}
				}
			}
		}

		return returnResponce;
	}

	async flexibleDateRate(serchFlightDto: OneWaySearchFlightDto, headers, user: User) {
		await this.validateHeaders(headers);

		const mystifly = new Strategy(new Mystifly(headers));

		const { source_location, destination_location, departure_date, flight_class, adult_count, child_count, infant_count } = serchFlightDto;

		const depatureDate = new Date(departure_date);
		const depatureDate2 = new Date(departure_date);
		const currentDate = new Date();

		const dayDiffrence = await this.getDifferenceInDays(depatureDate, currentDate) + 1

		var previousWeekDates = depatureDate2;

		var nextWeekDates = depatureDate;

		// nextWeekDates.setDate(nextWeekDates.getDate() + 1);

		var result = [];

		var resultIndex = 0;


		var count = dayDiffrence <= 7 ? dayDiffrence : 7;


		previousWeekDates.setDate(previousWeekDates.getDate() - count);

		for (let index = 0; index < count; index++) {
			var predate = previousWeekDates.toISOString().split('T')[0];
			predate = predate
				.replace(/T/, " ") // replace T with a space
				.replace(/\..+/, "");
			let dto = {
				"source_location": source_location,
				"destination_location": destination_location,
				"departure_date": predate,
				"flight_class": flight_class,
				"adult_count": adult_count,
				"child_count": child_count,
				"infant_count": infant_count
			}
			result[resultIndex] = new Promise((resolve) => resolve(mystifly.oneWaySearchZip(dto, user)));
			previousWeekDates.setDate(previousWeekDates.getDate() + 1);
			resultIndex++;
		}

		for (let index = 0; index <= 7; index++) {

			var nextdate = nextWeekDates.toISOString().split('T')[0];
			nextdate = nextdate
				.replace(/T/, " ") // replace T with a space
				.replace(/\..+/, "");
			let dto = {
				"source_location": source_location,
				"destination_location": destination_location,
				"departure_date": nextdate,
				"flight_class": flight_class,
				"adult_count": adult_count,
				"child_count": child_count,
				"infant_count": infant_count
			}
			result[resultIndex] = new Promise((resolve) => resolve(mystifly.oneWaySearchZip(dto, user)));
			nextWeekDates.setDate(nextWeekDates.getDate() + 1);
			resultIndex++;
		}


		const response = await Promise.all(result);

		let returnResponce = [];
		for await (const data of response) {
			if (!data.message) {
				var unique_code = '';
				var lowestprice = 0;
				var netRate = 0;
				var key = 0;
				var date;
				var startPrice = 0;
				var secondaryStartPrice = 0;
				for await (const flightData of data.items) {

					if (key == 0) {
						netRate = flightData.net_rate;
						lowestprice = flightData.selling_price
						unique_code = flightData.unique_code;
						date = flightData.departure_date
						startPrice = flightData.start_price || 0
						secondaryStartPrice = flightData.secondary_start_price || 0
					}
					// else if (lowestprice == flightData.net_rate && returnResponce[lowestPriceIndex].date > flightData.departure_date) {

					// 	returnResponce[lowestPriceIndex].is_booking_avaible = false
					// 	lowestPriceIndex = key
					// 	lowestprice = flightData.net_rate;
					// 	is_booking_avaible = true
					// }
					else if (lowestprice > flightData.selling_price) {
						netRate = flightData.net_rate;
						lowestprice = flightData.selling_price
						unique_code = flightData.unique_code;
						date = flightData.departure_date
						startPrice = flightData.start_price || 0
						secondaryStartPrice = flightData.secondary_start_price || 0
					}
					key++;
				}
				var output = {
					date: date,
					net_rate: netRate,
					price: lowestprice,
					unique_code: unique_code,
					start_price: startPrice,
					secondary_start_price: secondaryStartPrice
				}

				returnResponce.push(output)
				// console.log(flightData.unique_code);
				// console.log(flightData.net_rate);
				// console.log(flightData.departure_date);
			}
		}
		return returnResponce;
	}


	async fullcalenderRate(serchFlightDto: FullCalenderRateDto, headers, user: User) {
		await this.validateHeaders(headers);

		const mystifly = new Strategy(new Mystifly(headers));

		const { source_location, destination_location, start_date, end_date, flight_class, adult_count, child_count, infant_count, isRoundtrip, arrivale_date } = serchFlightDto;



		const startDate = new Date(start_date);
		const endDate = new Date(end_date);
		const currentDate = new Date();

		const dayDiffrence = await this.getDifferenceInDays(startDate, endDate)

		// nextWeekDates.setDate(nextWeekDates.getDate() + 1);

		var result = [];

		var resultIndex = 0;




		for (let index = 0; index <= dayDiffrence; index++) {
			var date = startDate.toISOString().split('T')[0];
			date = date
				.replace(/T/, " ") // replace T with a space
				.replace(/\..+/, "");
			if (isRoundtrip && isRoundtrip == true) {
				console.log(`Roundtrip`)
				let dto = {
					"source_location": source_location,
					"destination_location": destination_location,
					"departure_date": date,
					"arrival_date": arrivale_date,
					"flight_class": flight_class,
					"adult_count": adult_count,
					"child_count": child_count,
					"infant_count": infant_count
				}
				result[resultIndex] = new Promise((resolve) => resolve(mystifly.oneWaySearchZip(dto, user)));
			} else {
				let dto = {
					"source_location": source_location,
					"destination_location": destination_location,
					"departure_date": date,
					"flight_class": flight_class,
					"adult_count": adult_count,
					"child_count": child_count,
					"infant_count": infant_count
				}
				result[resultIndex] = new Promise((resolve) => resolve(mystifly.oneWaySearchZip(dto, user)));
			}

			startDate.setDate(startDate.getDate() + 1);
			resultIndex++;
		}



		const response = await Promise.all(result);

		let returnResponce = [];
		for await (const data of response) {
			if (!data.message) {
				var unique_code = '';
				var lowestprice = 0;
				var netRate = 0;
				var key = 0;
				var date = '';
				var startPrice;
				var secondaryStartPrice = 0;
				for await (const flightData of data.items) {

					if (key == 0) {
						netRate = flightData.net_rate;
						lowestprice = flightData.selling_price
						unique_code = flightData.unique_code;
						date = flightData.departure_date
						startPrice = flightData.start_price || 0
						secondaryStartPrice = flightData.secondary_start_price || 0
					}
					// else if (lowestprice == flightData.net_rate && returnResponce[lowestPriceIndex].date > flightData.departure_date) {

					// 	returnResponce[lowestPriceIndex].is_booking_avaible = false
					// 	lowestPriceIndex = key
					// 	lowestprice = flightData.net_rate;
					// 	is_booking_avaible = true
					// }
					else if (lowestprice > flightData.selling_price) {
						netRate = flightData.net_rate;
						lowestprice = flightData.selling_price
						unique_code = flightData.unique_code;
						date = flightData.departure_date
						startPrice = flightData.start_price || 0
						secondaryStartPrice = flightData.secondary_start_price || 0
					}
					key++;
				}
				var output = {
					date: date,
					net_rate: netRate,
					price: lowestprice,
					unique_code: unique_code,
					start_price: startPrice,
					secondary_start_price: secondaryStartPrice
				}

				returnResponce.push(output)
				// console.log(flightData.unique_code);
				// console.log(flightData.net_rate);
				// console.log(flightData.departure_date);
			}
		}
		return returnResponce;
	}


	async flexibleDateRateForRoundTrip(serchFlightDto: RoundtripSearchFlightDto, headers, user: User) {
		await this.validateHeaders(headers);

		const mystifly = new Strategy(new Mystifly(headers));

		const { source_location, destination_location, departure_date, flight_class, adult_count, child_count, infant_count, arrival_date } = serchFlightDto;

		const depatureDate = new Date(departure_date);
		const depatureDate2 = new Date(departure_date);
		const currentDate = new Date();

		const dayDiffrence = await this.getDifferenceInDays(depatureDate, currentDate) + 1

		var previousWeekDates = depatureDate2;

		var nextWeekDates = depatureDate;

		// nextWeekDates.setDate(nextWeekDates.getDate() + 1);

		var result = [];

		var resultIndex = 0;


		var count = dayDiffrence <= 7 ? dayDiffrence : 7;


		previousWeekDates.setDate(previousWeekDates.getDate() - count);

		for (let index = 0; index < count; index++) {
			var predate = previousWeekDates.toISOString().split('T')[0];
			predate = predate
				.replace(/T/, " ") // replace T with a space
				.replace(/\..+/, "");
			let dto = {
				"source_location": source_location,
				"destination_location": destination_location,
				"departure_date": predate,
				"arrival_date": arrival_date,
				"flight_class": flight_class,
				"adult_count": adult_count,
				"child_count": child_count,
				"infant_count": infant_count
			}
			result[resultIndex] = new Promise((resolve) => resolve(mystifly.roundTripSearchZip(dto, user)));
			previousWeekDates.setDate(previousWeekDates.getDate() + 1);
			resultIndex++;
		}

		for (let index = 0; index <= 7; index++) {

			var nextdate = nextWeekDates.toISOString().split('T')[0];
			nextdate = nextdate
				.replace(/T/, " ") // replace T with a space
				.replace(/\..+/, "");
			let dto = {
				"source_location": source_location,
				"destination_location": destination_location,
				"departure_date": nextdate,
				"flight_class": flight_class,
				"adult_count": adult_count,
				"child_count": child_count,
				"infant_count": infant_count
			}
			result[resultIndex] = new Promise((resolve) => resolve(mystifly.oneWaySearchZip(dto, user)));
			nextWeekDates.setDate(nextWeekDates.getDate() + 1);
			resultIndex++;
		}


		const response = await Promise.all(result);

		let returnResponce = [];
		for await (const data of response) {
			if (!data.message) {
				var unique_code = '';
				var lowestprice = 0;
				var netRate = 0;
				var key = 0;
				var date;
				var startPrice = 0;
				for await (const flightData of data.items) {

					if (key == 0) {
						netRate = flightData.net_rate;
						lowestprice = flightData.selling_price
						unique_code = flightData.unique_code;
						date = flightData.departure_date
						startPrice = flightData.start_price || 0
					}
					// else if (lowestprice == flightData.net_rate && returnResponce[lowestPriceIndex].date > flightData.departure_date) {

					// 	returnResponce[lowestPriceIndex].is_booking_avaible = false
					// 	lowestPriceIndex = key
					// 	lowestprice = flightData.net_rate;
					// 	is_booking_avaible = true
					// }
					else if (lowestprice > flightData.selling_price) {
						netRate = flightData.net_rate;
						lowestprice = flightData.selling_price
						unique_code = flightData.unique_code;
						date = flightData.departure_date
						startPrice = flightData.start_price || 0
					}
					key++;
				}
				var output = {
					date: date,
					net_rate: netRate,
					price: lowestprice,
					unique_code: unique_code,
					start_price: startPrice
				}

				returnResponce.push(output)
			}
		}
		return returnResponce;
	}



	async getDifferenceInDays(date1, date2) {
		const diffInMs = Math.abs(date2 - date1);
		return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
	}

	async baggageDetails(routeIdDto: RouteIdsDto) {
		const mystifly = new Strategy(new Mystifly({}));
		const result = new Promise((resolve) =>
			resolve(mystifly.baggageDetails(routeIdDto))
		);
		return result;
	}

	async cancellationPolicy(routeIdsDto: RouteIdsDto) {
		const mystifly = new Strategy(new Mystifly({}));
		const result = new Promise((resolve) =>
			resolve(mystifly.cancellationPolicy(routeIdsDto))
		);
		return result;
	}

	async searchRoundTripFlight(
		searchFlightDto: RoundtripSearchFlightDto,
		headers,
		user
	) {
		await this.validateHeaders(headers);
		const mystifly = new Strategy(new Mystifly(headers));
		const result = new Promise((resolve) =>
			resolve(mystifly.roundTripSearch(searchFlightDto, user))
		);
		return result;
	}

	async airRevalidate(routeIdDto, headers, user) {
		await this.validateHeaders(headers);
		const mystifly = new Strategy(new Mystifly(headers));
		const result = new Promise((resolve) =>
			resolve(mystifly.airRevalidate(routeIdDto, user))
		);
		return result;
	}

	async ticketFlight(id) {
		const mystifly = new Strategy(new Mystifly({}));
		const result = await mystifly.ticketFlight(id);
		if (result.status == 'true') {
			await getConnection()
				.createQueryBuilder()
				.update(Booking)
				.set({ isTicketd: true })
				.where("supplier_booking_id = :id", { id: id })
				.execute();
		}
		return result;
	}

	async bookFlight(bookFlightDto: BookFlightDto, headers, user) {
		let headerDetails = await this.validateHeaders(headers);

		let {
			travelers,
			payment_type,
			instalment_type,
			route_code,
			additional_amount,
			custom_instalment_amount,
			custom_instalment_no,
			laycredit_points,
			card_token
		} = bookFlightDto;

		const mystifly = new Strategy(new Mystifly(headers));
		const airRevalidateResult = await mystifly.airRevalidate(
			{ route_code },
			user
		);
		let isPassportRequired = false;
		let bookingRequestInfo: any = {};
		if (airRevalidateResult) {
			bookingRequestInfo.adult_count = airRevalidateResult[0].adult_count;
			bookingRequestInfo.child_count =
				typeof airRevalidateResult[0].child_count != "undefined"
					? airRevalidateResult[0].child_count
					: 0;
			bookingRequestInfo.infant_count =
				typeof airRevalidateResult[0].infant_count != "undefined"
					? airRevalidateResult[0].infant_count
					: 0;
			bookingRequestInfo.net_rate = airRevalidateResult[0].net_rate;
			if (payment_type == PaymentType.INSTALMENT) {
				bookingRequestInfo.selling_price = airRevalidateResult[0].selling_price;
			}
			else {

				if (typeof airRevalidateResult[0].secondary_selling_price != 'undefined' && airRevalidateResult[0].secondary_selling_price > 0) {

					bookingRequestInfo.selling_price = airRevalidateResult[0].secondary_selling_price;
				}
				else {
					bookingRequestInfo.selling_price = airRevalidateResult[0].selling_price;
				}
			}

			bookingRequestInfo.departure_date = DateTime.convertDateFormat(
				airRevalidateResult[0].departure_date,
				"DD/MM/YYYY",
				"YYYY-MM-DD"
			);
			bookingRequestInfo.arrival_date = DateTime.convertDateFormat(
				airRevalidateResult[0].arrival_date,
				"DD/MM/YYYY",
				"YYYY-MM-DD"
			);

			bookingRequestInfo.source_location =
				airRevalidateResult[0].departure_code;
			bookingRequestInfo.destination_location =
				airRevalidateResult[0].arrival_code;
			bookingRequestInfo.flight_class = "Economy";
			bookingRequestInfo.instalment_type = instalment_type;
			bookingRequestInfo.additional_amount = additional_amount;
			isPassportRequired = airRevalidateResult[0].is_passport_required;
			if (airRevalidateResult[0].routes.length == 1) {
				bookingRequestInfo.journey_type = FlightJourney.ONEWAY;
			} else {
				bookingRequestInfo.journey_type = FlightJourney.ROUNDTRIP;
			}
			bookingRequestInfo.laycredit_points = laycredit_points;
			bookingRequestInfo.fare_type = airRevalidateResult[0].fare_type;
			bookingRequestInfo.card_token = card_token;
		}
		let {
			selling_price,
			departure_date,
			adult_count,
			child_count,
			infant_count,
		} = bookingRequestInfo;
		let bookingDate = moment(new Date()).format("YYYY-MM-DD");
		let travelersDetails = await this.getTravelersInfo(
			travelers,
			isPassportRequired
		);

		let currencyId = headerDetails.currency.id;
		const userId = user.user_id;
		if (adult_count != travelersDetails.adults.length)
			throw new BadRequestException(
				`Adults count is not match with search request!`
			);

		if (child_count != travelersDetails.children.length)
			throw new BadRequestException(
				`Children count is not match with search request`
			);

		if (infant_count != travelersDetails.infants.length)
			throw new BadRequestException(
				`Infants count is not match with search request`
			);

		if (payment_type == PaymentType.INSTALMENT) {
			let instalmentDetails;

			let totalAdditionalAmount = additional_amount || 0;
			if (laycredit_points > 0) {
				totalAdditionalAmount = totalAdditionalAmount + laycredit_points;
			}
			//save entry for future booking
			if (instalment_type == InstalmentType.WEEKLY) {
				instalmentDetails = Instalment.weeklyInstalment(
					selling_price,
					departure_date,
					bookingDate,
					totalAdditionalAmount,
					custom_instalment_amount,
					custom_instalment_no
				);
			}
			if (instalment_type == InstalmentType.BIWEEKLY) {
				instalmentDetails = Instalment.biWeeklyInstalment(
					selling_price,
					departure_date,
					bookingDate,
					totalAdditionalAmount,
					custom_instalment_amount,
					custom_instalment_no
				);
			}
			if (instalment_type == InstalmentType.MONTHLY) {
				instalmentDetails = Instalment.monthlyInstalment(
					selling_price,
					departure_date,
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

					/* Call mystifly booking API if checkin date is less 3 months */
					let dayDiff = moment(departure_date).diff(bookingDate, 'days');
					let bookingResult;
					if (dayDiff <= 90) {
						const mystifly = new Strategy(new Mystifly(headers));
						bookingResult = await mystifly.bookFlight(
							bookFlightDto,
							travelersDetails,
							isPassportRequired
						);
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
							airRevalidateResult,
							instalmentDetails,
							captureCardresult,
							bookingResult || null,
							travelers
						);
						this.sendBookingEmail(laytripBookingResult.id);
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
		} else if (payment_type == PaymentType.NOINSTALMENT) {

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
				if (authCardResult.status == true) {

					const mystifly = new Strategy(new Mystifly(headers));
					const bookingResult = await mystifly.bookFlight(
						bookFlightDto,
						travelersDetails,
						isPassportRequired
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
							airRevalidateResult,
							null,
							captureCardresult,
							bookingResult,
							travelers
						);
						//send email here
						this.sendBookingEmail(laytripBookingResult.id);
						bookingResult.laytrip_booking_id = laytripBookingResult.id;
						bookingResult.booking_details = await this.bookingRepository.getBookingDetails(
							laytripBookingResult.laytripBookingId
						);

						if (bookingRequestInfo.fare_type == 'GDS') {
							this.ticketFlight(bookingResult.supplier_booking_id)
						}
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
			}
			else {
				//for full laycredit rdeem
				const mystifly = new Strategy(new Mystifly(headers));
				const bookingResult = await mystifly.bookFlight(
					bookFlightDto,
					travelersDetails,
					isPassportRequired
				);
				if (bookingResult.booking_status == "success") {

					let laytripBookingResult = await this.saveBooking(
						bookingRequestInfo,
						currencyId,
						bookingDate,
						BookingType.NOINSTALMENT,
						userId,
						airRevalidateResult,
						null,
						null,
						bookingResult,
						travelers
					);
					//send email here
					this.sendBookingEmail(laytripBookingResult.id);
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
		airRevalidateResult,
		instalmentDetails = null,
		captureCardresult = null,
		supplierBookingData,
		travelers,
	) {
		const {
			selling_price,
			net_rate,
			journey_type,
			source_location,
			destination_location,
			instalment_type,
			laycredit_points,
			fare_type, card_token
		} = bookFlightDto;

		let moduleDetails = await getManager()
			.createQueryBuilder(Module, "module")
			.where(`"module"."name"=:name`, { name: "flight" })
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
		booking.laytripBookingId = `LTF${uniqid.time().toUpperCase()}`;
		booking.bookingType = bookingType;
		booking.currency = currencyId;
		booking.totalAmount = selling_price.toString();
		booking.netRate = net_rate.toString();
		booking.markupAmount = (selling_price - net_rate).toString();
		booking.bookingDate = bookingDate;
		booking.usdFactor = currencyDetails.liveRate.toString();
		booking.layCredit = laycredit_points || 0;
		booking.locationInfo = {
			journey_type,
			source_location,
			destination_location,
		};
		booking.fareType = fare_type;
		booking.isTicketd = fare_type == 'LCC' ? true : false;

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

		booking.moduleInfo = airRevalidateResult;
		try {
			let bookingDetails = await booking.save();
			await this.saveTravelers(booking.id, userId, travelers);
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
			return await this.bookingRepository.getBookingDetails(booking.laytripBookingId);
		} catch (error) {
			console.log(error);
		}
	}
	async partialyBookingSave(
		bookFlightDto,
		currencyId,
		airRevalidateResult,
		bookingId,
		supplierBookingData,
	) {
		const {
			net_rate,
			fare_type
		} = bookFlightDto;

		let moduleDetails = await getManager()
			.createQueryBuilder(Module, "module")
			.where(`"module"."name"=:name`, { name: "flight" })
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
		booking.netRate = net_rate.toString();
		booking.usdFactor = currencyDetails.liveRate.toString();
		booking.fareType = fare_type;
		booking.isTicketd = fare_type == 'LCC' ? true : false;
		booking.supplierBookingId = supplierBookingData.supplier_booking_id;

		booking.moduleInfo = airRevalidateResult;
		try {
			let bookingDetails = await booking.save();
			return await this.bookingRepository.getBookingDetails(bookingDetails.laytripBookingId);
		} catch (error) {
			console.log(error);
		}
	}
	async partiallyBookFlight(bookFlightDto: BookFlightDto, headers, user, bookingId) {
		let headerDetails = await this.validateHeaders(headers);

		let {
			travelers,
			payment_type,
			instalment_type,
			route_code,
			additional_amount,
			laycredit_points,
		} = bookFlightDto;

		const mystifly = new Strategy(new Mystifly(headers));
		const airRevalidateResult = await mystifly.airRevalidate(
			{ route_code },
			user
		);
		let isPassportRequired = false;
		let bookingRequestInfo: any = {};
		if (airRevalidateResult) {
			bookingRequestInfo.adult_count = airRevalidateResult[0].adult_count;
			bookingRequestInfo.child_count =
				typeof airRevalidateResult[0].child_count != "undefined"
					? airRevalidateResult[0].child_count
					: 0;
			bookingRequestInfo.infant_count =
				typeof airRevalidateResult[0].infant_count != "undefined"
					? airRevalidateResult[0].infant_count
					: 0;
			bookingRequestInfo.net_rate = airRevalidateResult[0].net_rate;
			if (payment_type == PaymentType.INSTALMENT) {
				bookingRequestInfo.selling_price = airRevalidateResult[0].selling_price;
			}
			else {

				if (typeof airRevalidateResult[0].secondary_selling_price != 'undefined' && airRevalidateResult[0].secondary_selling_price > 0) {

					bookingRequestInfo.selling_price = airRevalidateResult[0].secondary_selling_price;
				}
				else {
					bookingRequestInfo.selling_price = airRevalidateResult[0].selling_price;
				}
			}

			bookingRequestInfo.departure_date = DateTime.convertDateFormat(
				airRevalidateResult[0].departure_date,
				"DD/MM/YYYY",
				"YYYY-MM-DD"
			);
			bookingRequestInfo.arrival_date = DateTime.convertDateFormat(
				airRevalidateResult[0].arrival_date,
				"DD/MM/YYYY",
				"YYYY-MM-DD"
			);
			bookingRequestInfo.source_location =
				airRevalidateResult[0].departure_code;
			bookingRequestInfo.destination_location =
				airRevalidateResult[0].arrival_code;
			bookingRequestInfo.flight_class = "Economy";
			bookingRequestInfo.instalment_type = instalment_type;
			bookingRequestInfo.additional_amount = additional_amount;
			isPassportRequired = airRevalidateResult[0].is_passport_required;
			if (airRevalidateResult[0].routes.length == 1) {
				bookingRequestInfo.journey_type = FlightJourney.ONEWAY;
			} else {
				bookingRequestInfo.journey_type = FlightJourney.ROUNDTRIP;
			}
			bookingRequestInfo.laycredit_points = laycredit_points;
			bookingRequestInfo.fare_type = airRevalidateResult[0].fare_type;
		}
		let {
			selling_price,
			departure_date,
			adult_count,
			child_count,
			infant_count,
		} = bookingRequestInfo;
		let bookingDate = moment(new Date()).format("YYYY-MM-DD");
		let travelersDetails = await this.getTravelersInfo(
			travelers,
			isPassportRequired
		);

		let currencyId = headerDetails.currency.id;
		const userId = user.user_id;
		console.log(`step - 2 call booking`);
		const bookingResult = await mystifly.bookFlight(
			bookFlightDto,
			travelersDetails,
			isPassportRequired
		);
		console.log(bookingResult);

		if (bookingResult.booking_status == "success") {
			console.log(`step - 3 save Booking`);
			let laytripBookingResult = await this.partialyBookingSave(
				bookFlightDto,
				currencyId,
				airRevalidateResult,
				bookingId,
				bookingResult,
			);

			//console.log(laytripBookingResult);

			//send email here
			console.log(`step - 4 mail`);
			this.sendBookingEmail(laytripBookingResult.id);
			bookingResult.laytrip_booking_id = laytripBookingResult.id;
			bookingResult.booking_details = await this.bookingRepository.getBookingDetails(
				laytripBookingResult.laytripBookingId
			);
			return bookingResult;

		}
		else {
			throw new InternalServerErrorException(bookingResult.error_message)
		}
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

	async getTravelersInfo(travelers, isPassportRequired = null) {
		let travelerIds = travelers.map((traveler) => {
			return traveler.traveler_id;
		});

		let travelersResult = await getManager()
			.createQueryBuilder(User, "user")
			.leftJoinAndSelect("user.country", "countries")
			.select([
				"user.userId",
				"user.title",
				"user.firstName",
				"user.lastName",
				"user.email",
				"user.countryCode",
				"user.phoneNo",
				"user.zipCode",
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
			adults: [],
			children: [],
			infants: [],
		};

		if (travelersResult.length > 0) {
			for (let traveler of travelersResult) {
				let ageDiff = moment(new Date()).diff(moment(traveler.dob), "years");

				/* if (traveler.title == null || traveler.title == "")
					throw new BadRequestException(
						`Title is missing for traveler ${traveler.firstName}`
					); */
				if ((traveler.email == null || traveler.email == "") && ageDiff >= 12)
					throw new BadRequestException(
						`Email is missing for traveler ${traveler.firstName}`
					);
				if (
					(traveler.countryCode == null || traveler.countryCode == "") &&
					ageDiff >= 12
				)
					throw new BadRequestException(
						`Country code is missing for traveler ${traveler.firstName}`
					);
				if (
					(traveler.phoneNo == null || traveler.phoneNo == "") &&
					ageDiff >= 12
				)
					throw new BadRequestException(
						`Phone number is missing for traveler ${traveler.firstName}`
					);
				if (traveler.gender == null || traveler.gender == "")
					throw new BadRequestException(
						`Gender is missing for traveler ${traveler.firstName}`
					);
				if (traveler.dob == null || traveler.dob == "")
					throw new BadRequestException(
						`Dob is missing for traveler ${traveler.firstName}`
					);
				if (
					ageDiff > 2 &&
					isPassportRequired &&
					(traveler.passportNumber == null || traveler.passportNumber == "")
				)
					throw new BadRequestException(
						`Passport Number is missing for traveler ${traveler.firstName}`
					);
				if (
					ageDiff > 2 &&
					isPassportRequired &&
					(traveler.passportExpiry == null || traveler.passportExpiry == "")
				)
					throw new BadRequestException(
						`Passport Expiry is missing for traveler ${traveler.firstName}`
					);
				if (
					ageDiff > 2 &&
					isPassportRequired &&
					(traveler.passportExpiry && moment(moment()).isAfter(traveler.passportExpiry))
				)
					throw new BadRequestException(
						`Passport Expiry date is expired for traveler ${traveler.firstName}`
					);
				if (
					traveler.country == null ||
					(typeof traveler.country.iso2 !== "undefined" &&
						traveler.country.iso2 == "")
				)
					throw new BadRequestException(
						`Country code is missing for traveler ${traveler.firstName}`
					);

				traveler.title = GenderTilte[traveler.title];
				if (ageDiff < 2) {
					traveleDetails.infants.push(traveler);
				} else if (ageDiff >= 2 && ageDiff < 12) {
					traveleDetails.children.push(traveler);
				} else if (ageDiff >= 12) {
					traveleDetails.adults.push(traveler);
				}
			}
			return traveleDetails;
		} else {
			throw new BadRequestException(`Please enter valid traveler(s) id`);
		}
	}

	async sendBookingEmail(bookingId) {
		const bookingData = await this.bookingRepository.bookingDetail(bookingId);
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
				EmailSubject = "Flight Booking Confirmation"
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


	async applyPreductionMarkup(netValue) {

		let query = getManager()
			.createQueryBuilder(PredictionFactorMarkup, "markup")
			.select([
				"markup.maxRatePercentage",
				"markup.minRatePercentage"
			])
		const result = await query.getOne();
		const minimumMarkupValue = (result.minRatePercentage / 100) * netValue
		const maxMarkupValue = (result.maxRatePercentage / 100) * netValue
		return {
			minPrice: netValue + minimumMarkupValue,
			maxPrice: netValue + maxMarkupValue
		}
	}

	async updateBooking(bookingId: string) {

		let tripDetails: any = await this.tripDetails(bookingId);
		if (tripDetails.booking_status == 'Not Booked') {
			// void card & update booking status in DB & send email to customer
		}

		if (tripDetails.booking_status == "") {

			if (tripDetails.ticket_status == 'Ticketed') {
				await getConnection()
					.createQueryBuilder()
					.update(Booking)
					.set({ isTicketd: true, supplierStatus: 1 })
					.where("supplier_booking_id = :id", { id: bookingId })
					.execute();
			}
		}

		if (tripDetails.booking_status == 'Booked') {

			let ticketDetails: any = await this.ticketFlight(bookingId);
			//return ticketDetails; 
			let newTripDetails: any = await this.tripDetails(bookingId);
			if (newTripDetails.ticket_status == 'Ticketed') {
				await getConnection()
					.createQueryBuilder()
					.update(Booking)
					.set({ isTicketd: true, supplierStatus: 1 })
					.where("supplier_booking_id = :id", { id: bookingId })
					.execute();
			}

			//if TicketStatus = TktInProgress call it again
		}

		/* if(tripDetails.booking_status=='Pending'){
	
			
		} */
	}
	async getValueWithPreductionPercentage(netValue) {
		let query = getManager()
			.createQueryBuilder(PredictionFactorMarkup, "markup")
			.select([
				"markup.markupPercentage"
			])
		const result = await query.getOne();
		return (netValue * result.markupPercentage) / 100;
	}

	async manullyBooking(bookingId: string, manullyBooking: ManullyBookingDto) {
		const { supplier_booking_id } = manullyBooking
		const mystifly = new Strategy(new Mystifly({}));
		let ticketDetails: any = await mystifly.tripDetails(supplier_booking_id)

		let query = getManager()
			.createQueryBuilder(Booking, "booking")
			.where(`laytrip_booking_id = '${bookingId}'`)
		const booking = await query.getOne();
		if (!booking) {
			throw new NotFoundException(`Given booking id not found`)
		}

		var moduleInfo = booking.moduleInfo[0]
		const currencyCode = ticketDetails.data["a:itineraryinfo"][0]["a:itinerarypricing"][0]["a:totalfare"][0]["a:currencycode"][0]
		let currencyDetails = await getManager()
			.createQueryBuilder(Currency, "currency")
			.where(`"currency"."code"=:currencyCode `, {
				currencyCode,
			})
			.getOne();

		moduleInfo['net_rate'] = ticketDetails.data["a:itineraryinfo"][0]["a:itinerarypricing"][0]["a:totalfare"][0]["a:amount"][0];


		var depatureIndex = 0
		var arrivalIndex = 0
		moduleInfo.routes[0].stops = [];
		moduleInfo.routes[1].stops = [];
		for await (const reservation of ticketDetails.data["a:itineraryinfo"][0]["a:reservationitems"][0]['a:reservationitem']) {

			if (reservation != null) {

				var data = {
					"departure_code": reservation["a:departureairportlocationcode"][0],
					"departure_date": await (await this.getDataTimefromString(reservation["a:departuredatetime"][0])).date,
					"departure_time": await (await this.getDataTimefromString(reservation["a:departuredatetime"][0])).time,
					"departure_date_time": reservation["a:departuredatetime"][0],
					"departure_info": airports[reservation["a:departureairportlocationcode"][0]],
					"arrival_code": reservation["a:arrivalairportlocationcode"][0],
					"arrival_date": await (await this.getDataTimefromString(reservation["a:arrivaldatetime"][0])).date,
					"arrival_time": await (await this.getDataTimefromString(reservation["a:arrivaldatetime"][0])).time,
					"arrival_date_time": reservation['a:arrivaldatetime'][0],
					"arrival_info": airports[reservation["a:arrivalairportlocationcode"][0]],
					"eticket": true,
					"flight_number": reservation["a:flightnumber"][0],
					"cabin_class": reservation["a:cabinclasstext"][0],
					"duration": "",
					"airline": reservation["a:marketingairlinecode"][0],
					"remaining_seat": 0,
					"below_minimum_seat": false,
					"is_layover": false,
					"airline_name": "",
					"airline_logo": `http://d2q1prebf1m2s9.cloudfront.net/assets/images/airline/108x92/${reservation["a:marketingairlinecode"][0]}.png`
				}
				if (reservation['a:isreturn'][0] == 'true') {


					moduleInfo.routes[1].stops.push(data)

				} else {

					moduleInfo.routes[0].stops.push(data)

				}
			}

		}



		const i = moduleInfo.routes[0].stops.length
		const depatureData = moduleInfo.routes[0].stops[0]

		const arrivalData = moduleInfo.routes[0].stops[i - 1]

		moduleInfo.departure_date = depatureData.departure_date
		moduleInfo.departure_time = depatureData.departure_time
		moduleInfo.departure_code = depatureData.departure_code
		moduleInfo.departure_info = depatureData.departure_info
		moduleInfo.airline = depatureData.airline
		moduleInfo.stop_count = i
		moduleInfo.airline_name = ''
		moduleInfo.airline_logo = depatureData.airline_logo


		moduleInfo.arrival_date = arrivalData.arrival_date
		moduleInfo.arrival_time = arrivalData.arrival_time
		moduleInfo.arrival_code = arrivalData.arrival_code
		moduleInfo.arrival_info = arrivalData.arrival_info
		moduleInfo['ismanully'] = true

		booking.netRate = ticketDetails.data["a:itineraryinfo"][0]["a:itinerarypricing"][0]["a:totalfare"][0]["a:amount"][0]
		booking.moduleInfo = [moduleInfo]
		booking.supplierBookingId = supplier_booking_id;

		await booking.save();
		return this.bookingRepository.getBookingDetails(booking.laytripBookingId)

	}

	async getDataTimefromString(dateTime) {
		var data = dateTime.split('T')
		var date = data[0].split('-')

		var time = data[1].split(':')

		var amPm = 'AM'
		if (time[0] > 12) {
			amPm = 'PM'
			time[0] = time[0] - 12;
		}
		return {
			date: `${date[2]}/${date[1]}/${date[0]}`,
			time: `${time[0]}:${time[1]} ${amPm}`
		}
	}

	async cancelBooking(tripId: string, headers) {
		const mystifly = new Strategy(new Mystifly(headers));
		return mystifly.cancelBooking(tripId);
	}

	async bookPartialBooking(bookingId, Headers) {
		const bookingData = await this.bookingRepository.getBookingDetails(bookingId)

		let flights: any = null;
		if (new Date(await this.changeDateFormat(bookingData.moduleInfo[0].departure_date)) > new Date()) {
			var bookingType = bookingData.locationInfo['journey_type']

			let travelers = [];

			for await (const traveler of bookingData.travelers) {
				travelers.push({
					traveler_id: traveler.userId
				})
			}

			// Headers['currency'] = bookingData.currency2.code
			// Headers['language'] = 'en'
			if (bookingType == 'oneway') {

				let dto = {
					"source_location": bookingData.moduleInfo[0].departure_code,
					"destination_location": bookingData.moduleInfo[0].arrival_code,
					"departure_date": await this.changeDateFormat(bookingData.moduleInfo[0].departure_date),
					"flight_class": bookingData.moduleInfo[0].routes[0].stops[0].cabin_class,
					"adult_count": bookingData.moduleInfo[0].adult_count ? bookingData.moduleInfo[0].adult_count : 0,
					"child_count": bookingData.moduleInfo[0].child_count ? bookingData.moduleInfo[0].child_count : 0,
					"infant_count": bookingData.moduleInfo[0].infant_count ? bookingData.moduleInfo[0].infant_count : 0
				}
				console.log('oneway dto', dto)
				flights = await this.searchOneWayFlight(dto, Headers, bookingData.user);

			}
			else {

				let dto = {
					"source_location": bookingData.moduleInfo[0].departure_code,
					"destination_location": bookingData.moduleInfo[0].arrival_code,
					"departure_date": await this.changeDateFormat(bookingData.moduleInfo[0].departure_date),
					"flight_class": bookingData.moduleInfo[0].routes[0].stops[0].cabin_class,
					"adult_count": bookingData.moduleInfo[0].adult_count ? bookingData.moduleInfo[0].adult_count : 0,
					"child_count": bookingData.moduleInfo[0].child_count ? bookingData.moduleInfo[0].child_count : 0,
					"infant_count": bookingData.moduleInfo[0].infant_count ? bookingData.moduleInfo[0].infant_count : 0,
					"arrival_date": await this.changeDateFormat(bookingData.moduleInfo[0].arrival_code)
				}
				console.log('two dto', dto)
				flights = await this.searchOneWayFlight(dto, Headers, bookingData.user);
			}
			console.log(flights);
			console.log(bookingData.moduleInfo[0].unique_code);

			var match = 0;
			for await (const flight of flights.items) {
				if (flight.unique_code == bookingData.moduleInfo[0].unique_code) {
					match = match + 1
					//const markups = await this.applyPreductionMarkup(bookingData.totalAmount)

					//const savedDate = new Date(bookingData.predectedBookingDate);
					// var predictedDate = savedDate.toISOString();
					// predictedDate = predictedDate
					// 	.replace(/T/, " ") // replace T with a space
					// 	.replace(/\..+/, "");

					const bookingDto = new BookFlightDto
					bookingDto.travelers = travelers
					bookingDto.payment_type = `${bookingData.bookingType}`;
					bookingDto.instalment_type = `${bookingData.bookingType}`
					bookingDto.route_code = flight.route_code;
					bookingDto.additional_amount = 0
					bookingDto.laycredit_points = 0

					const user = bookingData.user

					const bookingId = bookingData.laytripBookingId;

					console.log(`step - 1 find booking`);

					const query = await this.partiallyBookFlight(bookingDto, Headers, user, bookingId)

					this.sendFlightUpdateMail(bookingData.laytripBookingId, user.email, user.cityName)

				}
			}

			if (match == 0) {
				throw new NotFoundException(`Given flight not available`)
			}

		}
	}

	async changeDateFormat(dateTime) {
		var date = dateTime.split('/')

		return `${date[2]}-${date[1]}-${date[0]}`

	}

	async sendFlightUpdateMail(bookingId, email, userName) {
		this.mailerService
			.sendMail({
				to: email,
				from: mailConfig.from,
				cc: mailConfig.BCC,
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
