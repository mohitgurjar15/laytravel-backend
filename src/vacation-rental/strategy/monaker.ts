import { getManager } from "typeorm";
import { AvailabilityDto } from "../dto/availability.dto";
import { Availability } from "../model/availability.model";
import { StrategyVacationRental } from "./strategy.interface";
import Axios from "axios";
import { AvailabilityDetailsDto } from "../dto/availabilty_details.dto";
import { HotelDetails, Images, Room } from "../model/room_details.model";
import { VerifyAvailabilityDto } from "../dto/verify_availability.dto";
import { BookingDto } from "../dto/booking.dto";
import { InternalServerErrorException, NotAcceptableException, NotFoundException } from "@nestjs/common";
import { Instalment } from "src/utility/instalment.utility";
import { Module } from "src/entity/module.entity";
import * as moment from 'moment';
import { errorMessage } from "src/config/common.config";
import { PriceMarkup } from "src/utility/markup.utility";

export class Monaker implements StrategyVacationRental {

    private headers;
    constructor(
        headers
    ) {
        this.headers = headers;
    }

    async getMarkupDetails(check_in_date, booking_date, user, module) {
        let isInstalmentAvaible = Instalment.instalmentAvailbility(check_in_date, booking_date);
        console.log("Istalment---",isInstalmentAvaible)

        let markUpDetails;
        let secondaryMarkUpDetails;

        if (!user.roleId || user.roleId == 7) {
            markUpDetails = await PriceMarkup.getMarkup(module.id, user.roleId, 'no-instalment');
        } else if (isInstalmentAvaible && (user.roleId == 5 || user.roleId == 6)) {

            markUpDetails = await PriceMarkup.getMarkup(module.id, user.roleId, 'instalment');
            secondaryMarkUpDetails = await PriceMarkup.getMarkup(module.id, user.roleId, 'no-instalment');
        }
        else {
            markUpDetails = await PriceMarkup.getMarkup(module.id, user.roleId, 'no-instalment');
        }

        if (!markUpDetails) {
            throw new InternalServerErrorException(`Markup is not configured for home-rental&&&module&&&${errorMessage}`);
        }else {
            return {
                markUpDetails,
                secondaryMarkUpDetails
            }
        }
    }

    async checkAllavaiability(availability: AvailabilityDto,user) {

        const { id, type, check_in_date, check_out_date, adult_count } = availability;
        let hotelIds;
        let city;
        let module = await getManager()
            .createQueryBuilder(Module, "module")
            .where("module.name = :name", { name: 'home rental' })
            .getOne();
        let bookingDate = moment(new Date()).format("YYYY-MM-DD");
        
        if (!module) {
            throw new InternalServerErrorException(`home rental module is not configured in database&&&module&&&${errorMessage}`);
        }
        if (type == "hotel") {
            hotelIds = await getManager().query(`
				SELECT DISTINCT hotel_id FROM "hotel" WHERE id = ${id}
             `);

            if (hotelIds.length == 0) {
                throw new NotFoundException(`No found hotel`)
            }
        } else {
            city = await getManager().query(`
			  SELECT city FROM "hotel" WHERE id = ${id}
            `)
            if (city.length == 0) {
                throw new NotFoundException(`No found city`)
            }
            hotelIds = await getManager().query(`
                SELECT DISTINCT hotel_id FROM "hotel" WHERE city = '${city[0]["city"]}'
            `)
        }

        let markup = await this.getMarkupDetails(bookingDate,check_in_date,user,module);
        let markUpDetails;
        let secondaryMarkUpDetails;

        console.log("mark up ====>",markup)
        let availabilityVR: Availability[] = [];


        for (let j = 0; j < (Math.ceil(hotelIds.length) / 50); j++) {
            let start = (j * 2 * 25);
            let end = start + 50;
            let l = hotelIds.slice(start, end);

            let Ids = ``;
            for (let i = 0; i < l.length; i++) {
                if (i !== l.length - 1) {
                    Ids += `Ids=${l[i]["hotel_id"]}&`
                } else {
                    Ids += `Ids=${l[i]["hotel_id"]}`
                }
            }

            try {
                let res = await Axios({
                    method: "GET",
                    url: `https://sandbox-api.nexttrip.com/api/v1/product/property-availabilities/availability?${Ids}&CheckInDate=${check_in_date}&CheckOutDate=${check_out_date}&NumberOfAdults=${adult_count}&Currency=${this.headers.currency}`,
                    headers: {
                        "Postman-Token": "32421909-c494-4f6b-a377-4a82a1c4c9a7",
                        "cache-control": "no-cache",
                        "Ocp-Apim-Subscription-Key": "415dfbf10992442db4ab3f3a5f6bdf2e",
                    },
                });
                const result = res.data;


                for (let i = 0; i < result.length; i++) {
                    const availability = new Availability();
                    const data = await getManager().query(`
					SELECT DISTINCT hotel_name,city,country,hotel_id,latitude,longitude,images FROM "hotel" WHERE hotel_id = ${result[i]["propertyId"]}
				`)
                    availability.property_id = result[i]["propertyId"];
                    availability.property_name = data[0]["hotel_name"];

                    availability.city = data[0]["city"];
                    availability.country = data[0]["country"];
                    availability.net_price = result[i]["totalPrice"];
                    availability.selling_price = 0.0;
                    availability.start_price = 0.0;
                    availability.display_image = `https://sandbox-images.nexttrip.com${data[0]["images"].split(',')[0]}`;
                    availability.latitude = data[0]["latitude"];
                    availability.longintude = data[0]["longitude"];

                    availabilityVR.push(availability);
                }
            } catch (e) {
                console.log("Err==", e)
            }
        }
        if (availabilityVR.length == 0) {
            throw new NotFoundException(`Not available any vacation rental`)
        }
        return availabilityVR;
    }

    async unitTypeListAvailability(hotelId, availabilityDetailsDto: AvailabilityDetailsDto) {
        const { check_in_date, check_out_date, adult_count } = availabilityDetailsDto;
        try {
            let res = await Axios({
                method: "GET",
                url: `https://sandbox-api.nexttrip.com/api/v1/product/property-availabilities/${hotelId}/availability?CheckInDate=${check_in_date}&CheckOutDate=${check_out_date}&NumberOfAdults=${adult_count}&Currency=${this.headers.currency}`,
                headers: {
                    "Postman-Token": "32421909-c494-4f6b-a377-4a82a1c4c9a7",
                    "cache-control": "no-cache",
                    "Ocp-Apim-Subscription-Key": "415dfbf10992442db4ab3f3a5f6bdf2e",
                },
            });

            // console.log("RES", res.data["unitStays"]);
            const result = res.data["unitStays"];

            let hotel_details = await Axios({
                method: "GET",
                url: `https://sandbox-api.nexttrip.com/api/v1/content/properties/${hotelId}`,
                headers: {
                    "Postman-Token": "32421909-c494-4f6b-a377-4a82a1c4c9a7",
                    "cache-control": "no-cache",
                    "Ocp-Apim-Subscription-Key": "415dfbf10992442db4ab3f3a5f6bdf2e",
                },
            })

            const hotel = hotel_details.data;

            let rooms: Room[] = [];
            let room: Room;

            for (let i = 0; i < result.length; i++) {
                room = new Room();
                room.id = result[i]["id"]
                room.net_rate = result[i]["prices"][0]["amountBeforeTax"];
                room.rate_plan_code = result[i]["prices"][0]["ratePlanCode"];
                room.selling_price = 0.0;
                room.start_price = 0.0;
                room.name = result[i]["prices"][0]["ratePlanDescription"]
                rooms.push(room);
            }
            const hotelDetails = new HotelDetails();
            hotelDetails.property_id = hotelId;
            hotelDetails.property_name = hotel["propertyName"];
            hotelDetails.description = hotel["descriptions"][0]["description"];
            let images: Images[] = [];
            let image: Images;
            for (let j = 0; j < hotel["images"].length; j++) {
                image = new Images();
                image.url = `https://sandbox-images.nexttrip.com${hotel["images"][j]["url"]}`;
                images.push(image);
            }
            hotelDetails.images = images;
            hotelDetails.amenities = hotel["propertyAmenities"]
            hotelDetails.rooms = rooms;
            return hotelDetails;
        } catch (e) {
            console.log("ERR", e)
            throw new NotFoundException(`Not fount any property available`)
        }
    }


    async verifyUnitTypeAvailability(unitTypeId, verifyAvailabilitydto: VerifyAvailabilityDto) {
        const { rate_plan_code, check_in_date, check_out_date, adult_count } = verifyAvailabilitydto;

        try {
            let res = await Axios({
                method: "GET",
                url: `https://sandbox-api.nexttrip.com/api/v1/product/unit-availabilities/${unitTypeId}/verify-availability?RatePlanCode=${rate_plan_code}&CheckInDate=${check_in_date}&CheckOutDate=${check_out_date}&NumberOfAdults=${adult_count}&Currency=${this.headers.currency}`,
                headers: {
                    "Postman-Token": "32421909-c494-4f6b-a377-4a82a1c4c9a7",
                    "cache-control": "no-cache",
                    "Ocp-Apim-Subscription-Key": "415dfbf10992442db4ab3f3a5f6bdf2e",
                },
            })

            const response = res.data;
            console.log("response", response);
            const result = {
                "available_status": response["available"],
                "booking_code": response["quoteHandle"],
                "net_rate": response["available"] == true ? response["totalPrice"]["amountBeforeTax"] : null,
                "selling_rate": 0.0
            }

            // console.log("RESULT===>", response)
            return result;
        } catch (e) {
            console.log("Err===>", e)
        }
    }

    async booking(bookingDto: BookingDto) {
        const { room_id, rate_plan_code, check_in_date, check_out_date, adult_count } = bookingDto;

        let verifyResponse = await Axios({
            method: "GET",
            url: `https://sandbox-api.nexttrip.com/api/v1/product/unit-availabilities/${room_id}/verify-availability?RatePlanCode=${rate_plan_code}&CheckInDate=${check_in_date}&CheckOutDate=${check_out_date}&NumberOfAdults=${adult_count}&Currency=${this.headers.currency}`,
            headers: {
                "Postman-Token": "32421909-c494-4f6b-a377-4a82a1c4c9a7",
                "cache-control": "no-cache",
                "Ocp-Apim-Subscription-Key": "415dfbf10992442db4ab3f3a5f6bdf2e",
            },
        })

        const response = verifyResponse.data;

        // const result = {
        // 	"available_status": response["available"],
        // 	"booking_code": response["quoteHandle"],
        // 	"net_rate": response["available"] == true ? response["totalPrice"]["amountBeforeTax"] : null,
        // 	"selling_rate": 0.0
        // }

        try {
            let booking = await Axios({
                method: "POST",
                url: `https://sandbox-api.nexttrip.com/api/v1/transaction/reservations?Language=${this.headers.language}`,
                data: {
                    "id": room_id,
                    "currency": this.headers.currency,
                    "price": response["available"] == true ? response["totalPrice"]["amountBeforeTax"] : null,
                    "quoteHandle": response["quoteHandle"],
                    "ratePlanCode": rate_plan_code,
                    "checkInDate": check_in_date,
                    "checkOutDate": check_out_date,
                    "numberOfAdults": adult_count,
                    "customer": {
                        "firstName": "chintan",
                        "lastName": "patel",
                        "address": "Anindra",
                        "city": "Surendranagar",
                        "stateOrTerritory": "Gujarat",
                        "zip": "363110",
                        "country": "IN",
                        "phoneNumber": "9537580306",
                        "email": "vasoyachintan@gmail.com",
                        "salutation": "Mr",
                        "dateOfBirth": "2001-01-15",
                        "gender": "Male"
                    },
                    // "guests": [
                    // 	{
                    // 		"firstName": "string",
                    // 		"lastName": "string",
                    // 		"address": "string",
                    // 		"city": "string",
                    // 		"stateOrTerritory": "string",
                    // 		"zip": "string",
                    // 		"country": "string",
                    // 		"email": "string",
                    // 		"phoneNumber": "string",
                    // 		"dateOfBirth": "2020-11-27",
                    // 		"gender": "string"
                    // 	}
                    // ],
                },
                headers: {
                    "Postman-Token": "32421909-c494-4f6b-a377-4a82a1c4c9a7",
                    "cache-control": "no-cache",
                    'content-type': 'application/json',
                    "Ocp-Apim-Subscription-Key": "415dfbf10992442db4ab3f3a5f6bdf2e",
                },
            })
            return booking.data;
        } catch (e) {
            console.log("Err--->", e);
            throw new NotAcceptableException(`Something went wrong`)
        }
    }

    async deleteBooking(reservationId) {

        try {
            let res = await Axios({
                method: "DELETE",
                url: `https://sandbox-api.nexttrip.com/api/v1/transaction/reservations/${reservationId}`,
                headers: {
                    "Postman-Token": "32421909-c494-4f6b-a377-4a82a1c4c9a7",
                    "cache-control": "no-cache",
                    "Ocp-Apim-Subscription-Key": "415dfbf10992442db4ab3f3a5f6bdf2e",
                },
            })

            // console.log("delete booking",res.data)
            return res.data
        } catch (e) {
            throw new NotAcceptableException(`Something went wrong`)
        }
    }

}