import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import Axios from "axios";
import { HotelRoom } from 'src/entity/hotel-room.entity';
import { Hotel } from 'src/entity/hotel.entity';
import { LocationInfo } from './model/location.model';
import { getManager } from 'typeorm';
import { SearchLocation } from './dto/search_location.dto';
import { AvailabilityDto } from './dto/availability.dto';
import { parse, resolve } from 'path';
import { Availability } from './model/availability.model';
import { validate } from 'class-validator';
import { AvailabilityDetailsDto } from './dto/availabilty_details.dto';
import { HotelDetails, Images, Room } from './model/room_details.model';
import * as fs from "fs";
import { VerifyAvailabilityDto } from './dto/verify_availability.dto';
import { url } from 'inspector';
import { BookingDto } from './dto/booking.dto';
import { MonakerStrategy } from './strategy/strategy';
import { Monaker } from './strategy/monaker';


@Injectable()
export class VacationRentalService {

	async getSearchLocation(searchLocation: SearchLocation) {

		const { search_name } = searchLocation;
		try {
			const hotel = await getManager().query(`
						SELECT DISTINCT hotel_id,hotel_name,city,country from "hotel" WHERE hotel_name ILIKE '%${search_name}%'
					`);
			const city = await getManager().query(`
						SELECT city,country,count(*) from "hotel"  WHERE city ILIKE '%${search_name}%' GROUP BY city,country
					`);

			let location: LocationInfo;
			let result = [];

			for (let i = 0; i < hotel.length; i++) {
				const id = await getManager().query(`
						SELECT id from "hotel"  WHERE hotel_id = '${hotel[i]["hotel_id"]}'
					`);
				location = new LocationInfo();

					location.id = id[0]["id"],
					location.type = "hotel",
					location.display_name = hotel[i]["hotel_name"],
					location.city = hotel[i]["city"],
					location.country = hotel[i]["country"]

				result.push(location);
			}

			for (let j = 0; j < city.length; j++) {
				const id = await getManager().query(`
		SELECT id from "hotel"  WHERE city = '${city[j]["city"]}'
	`);

				location = new LocationInfo();
				location.id = id[0]["id"]
				location.type = "city",
					location.display_name = city[j]["city"] + "," + city[j]["country"],
					location.city = city[j]["city"],
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

	async availabilityHotel(
		availability: AvailabilityDto,
		user,
		headers
	) {
		await this.validateCurrency(headers);
		console.log("USER=========>",user)
		const monaker = new MonakerStrategy(new Monaker(headers));
		const result = new Promise((resolve) => resolve(monaker.checkAllavaiability(availability,user)));
		return result;

	}

	async unitTypeListAvailability(hotelId, availabilityDetailsDto: AvailabilityDetailsDto, headers) {
		await this.validateCurrency(headers);
		const monaker = new MonakerStrategy(new Monaker(headers));
		const result = new Promise((resolve) => resolve(monaker.unitTypeListAvailability(hotelId, availabilityDetailsDto)));

		return result;

	}

	async verifyUnitAvailability(unitTypeId, verifyAvailabilitydto: VerifyAvailabilityDto, headers) {
		await this.validateCurrency(headers);
		const monaker = new MonakerStrategy(new Monaker(headers));
		const result = new Promise((resolve) => resolve(monaker.verifyUnitTypeAvailability(unitTypeId, verifyAvailabilitydto)));

		return result;

	}

	async booking(bookingDto: BookingDto, headers) {
		await this.validateCurrency(headers);

		const monaker = new MonakerStrategy(new Monaker(headers));
		const result = new Promise((resolve) => resolve(monaker.booking(bookingDto)));

		return result;
		// console.log("RESULT===>", response)

	}

	async deleteBooking(reservationId) {
		const monakar = new MonakerStrategy(new Monaker({}));
		const result = new Promise((resolve) => resolve(monakar.deleteBooking(reservationId)));
		return result;
	}

	async validateCurrency(headers) {
		let currency = headers.currency.toLowerCase();
		if (typeof currency == "undefined" || currency == "") {
			throw new BadRequestException(`Please enter currency code&&&currency`);
		}

		let res = await Axios({
			url: "https://sandbox-api.nexttrip.com/api/v1/dictionary/currencies",
			method: "GET",
			headers: {
				"Ocp-Apim-Subscription-Key": "415dfbf10992442db4ab3f3a5f6bdf2e",
			},
		})

		const result = res.data;
		let flag = false;
		result.map((i) => {
			if (i["code"].includes(currency)) {
				flag = true;
			}
		})

		if (flag == false) {
			throw new BadRequestException(`Invalid currency code sent!`);
		}
	}

}


// let convertHotelId = hotelId.map((i) => Number(i["hotel_id"]))

		// let ids = new Array();
		// for (let i = 0; i < convertHotelId.length; i++) {
		// 	ids.push(convertHotelId[i])
		// }

		// result.forEach((data, index) => {
			// 	if (result[index]["hotel_id"].includes(hotel[i]["hotel_id"])) {
			// 		flag = 0;
			// 	}
			// });

			// if (flag == 1) {
			// }