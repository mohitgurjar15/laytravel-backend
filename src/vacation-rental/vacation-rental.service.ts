import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import Axios from "axios";
import { LocationInfo } from './model/location.model';
import { getManager } from 'typeorm';
import { AvailabilityDto } from './dto/availability.dto';
import { AvailabilityDetailsDto } from './dto/availabilty_details.dto';
import { VerifyAvailabilityDto } from './dto/verify_availability.dto';
import { BookingDto } from './dto/booking.dto';
import { MonakerStrategy } from './strategy/strategy';
import { Monaker } from './strategy/monaker';
import { HotelView } from 'src/entity/hotel-view.entity';


@Injectable()
export class VacationRentalService {

	async getSearchLocation(searchLocation) {

		try {
			const hotels = await getManager()
				.createQueryBuilder(HotelView, "hotel_view")
				.distinctOn(["hotel_id"])
				.select([
					'hotel_view.hotelId',
					"hotel_view.id",
					"hotel_view.hotelName",
					"hotel_view.city",
					"hotel_view.country"
				])
				.where("hotel_view.hotel_name ILIKE :name", { name: `%${searchLocation}%` })
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
				location.id = hotels[i]["id"],
					location.type = "hotel",
					location.display_name = hotels[i]["hotelName"],
					location.city = hotels[i]["city"],
					location.country = hotels[i]["country"]

				result.push(location);
			}

			for (let j = 0; j < city.length; j++) {
				location = new LocationInfo();
				location.id = city[j]["id"]
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
		const monaker = new MonakerStrategy(new Monaker(headers));
		const result = new Promise((resolve) => resolve(monaker.checkAllavaiability(availability, user)));
		return result;

	}

	async unitTypeListAvailability(availabilityDetailsDto: AvailabilityDetailsDto, headers,user) {
		await this.validateCurrency(headers);
		const monaker = new MonakerStrategy(new Monaker(headers));
		const result = new Promise((resolve) => resolve(monaker.unitTypeListAvailability(availabilityDetailsDto,user)));

		return result;

	}

	async verifyUnitAvailability(verifyAvailabilitydto: VerifyAvailabilityDto, headers,user) {
		await this.validateCurrency(headers);
		const monaker = new MonakerStrategy(new Monaker(headers));
		const result = new Promise((resolve) => resolve(monaker.verifyUnitTypeAvailability(verifyAvailabilitydto,user)));

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
		if (typeof headers.currency == "undefined" || headers.currency == "") {
			throw new BadRequestException(`Please enter currency code&&&currency`);
		}
		
		let currency = headers.currency.toLowerCase();

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