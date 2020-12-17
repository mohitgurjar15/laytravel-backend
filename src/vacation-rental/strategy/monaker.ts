import { getManager } from "typeorm";
import { AvailabilityDto } from "../dto/availability.dto";
import { HotelDetail, HotelSearchResult, PriceRange } from "../model/availability.model";
import { StrategyVacationRental } from "./strategy.interface";
import Axios from "axios";
import { AvailabilityDetailsDto } from "../dto/availabilty_details.dto";
import { CancellationPolicy, HotelDetails, Images, Room } from "../model/room_details.model";
import { VerifyAvailabilityDto } from "../dto/verify_availability.dto";
import { BookingDto } from "../dto/booking.dto";
import { InternalServerErrorException, NotAcceptableException, NotFoundException, RequestTimeoutException } from "@nestjs/common";
import { Instalment } from "src/utility/instalment.utility";
import { Module } from "src/entity/module.entity";
import * as moment from 'moment';
import { errorMessage } from "src/config/common.config";
import { PriceMarkup } from "src/utility/markup.utility";
import { HotelView } from "src/entity/hotel-view.entity";
import { Generic } from "src/utility/generic.utility";
import { Hotel } from "src/entity/hotel.entity";
import { HttpRequest } from "src/utility/http.utility";
import { Fees, FeesType, VerifyAvailability } from "../model/verify-availability.model";
import { check } from "prettier";

export class Monaker implements StrategyVacationRental {

    private headers;
    constructor(
        headers
    ) {
        this.headers = headers;
    }

    async getMonakerCredential() {

        const config = await Generic.getCredential('home rental');
        let monakerConfig = JSON.parse(config.testCredential)
        if (config.mode) {
            monakerConfig = JSON.parse(config.liveCredential);
        }
        return monakerConfig;
    }

    async getMarkupDetails(check_in_date, booking_date, user, module) {
        let isInstalmentAvaible = Instalment.instalmentAvailbility(check_in_date, booking_date);

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
        } else {
            return {
                markUpDetails,
                secondaryMarkUpDetails
            }
        }
    }

    getMinPrice(hotels, priceType) {
        return Math.min.apply(null, hotels.map(item => item[priceType]))
    }

    getMaxPrice(hotels, priceType) {
        return Math.max.apply(null, hotels.map(item => item[priceType]))
    }

    getAminities(hotels) {
        let amenities: any = [];
        hotels.forEach((item) => {
            item["amenties"].map((e) => {
                if (!amenities.includes(e)) {
                    amenities.push(e);
                }
            })
        });
        return amenities;
    }

    async checkAllavaiability(availability: AvailabilityDto, user, flag) {

        const { id, type, check_in_date, check_out_date, adult_count, number_and_children_ages = [] } = availability;
        let hotelIds;
        let city;
        let childrensAges = ``;

        if (number_and_children_ages.length != 0) {
            let check_age = number_and_children_ages.every((age) => {
                return age <= 17;
            })

            if (!check_age) {
                throw new NotAcceptableException(`Children age must be 17 year or below`)
            }

            for (let k = 0; k < number_and_children_ages.length; k++) {
                if (k != number_and_children_ages.length - 1) {
                    childrensAges += `NumberAndAgeOfChildren=${number_and_children_ages[k]}&`
                } else {
                    childrensAges += `NumberAndAgeOfChildren=${number_and_children_ages[k]}`
                }
            }
        }

        let module = await getManager()
            .createQueryBuilder(Module, "module")
            .where("module.name = :name", { name: 'home rental' })
            .getOne();
        let bookingDate = moment(new Date()).format("YYYY-MM-DD");
        let monakerCredential = await this.getMonakerCredential();

        if (!module) {
            throw new InternalServerErrorException(`home rental module is not configured in database&&&module&&&${errorMessage}`);
        }

        if (type == "hotel") {
            hotelIds = await getManager()
                .createQueryBuilder(HotelView, "hotel_view")
                .distinctOn(["hotel_id"])
                .select([
                    "hotel_view.hotelId"
                ])
                .where("hotel_view.id = :id", { id: id })
                .getMany();

            if (hotelIds.length == 0) {
                throw new NotFoundException(`No found hotel`)
            }
        } else {
            city = await getManager()
                .createQueryBuilder(HotelView, "hotel_view")
                .select([
                    "hotel_view.city"
                ])
                .where("hotel_view.id = :id", { id: id })
                .getMany();

            if (city.length == 0) {
                throw new NotFoundException(`No found city`)
            }

            hotelIds = await getManager()
                .createQueryBuilder(HotelView, "hotelView")
                .distinctOn(["hotel_id"])
                .select([
                    "hotelView.hotelId"
                ])
                .where("hotelView.city = :city", { city: city[0]["city"] })
                .getMany();

            if (hotelIds.length == 0) {
                throw new NotFoundException(`No found hotel`)
            }

        }

        console.log("hotel ids", hotelIds);

        let markup = await this.getMarkupDetails(bookingDate, check_in_date, user, module);
        let markUpDetails = markup.markUpDetails;
        let secondaryMarkUpDetails = markup.secondaryMarkUpDetails;

        let hotelDetails: HotelDetail[] = [];

        for (let j = 0; j < (Math.ceil(hotelIds.length) / 50); j++) {
            let start = (j * 2 * 25);
            let end = start + 50;
            let l = hotelIds.slice(start, end);

            let Ids = ``;
            for (let i = 0; i < l.length; i++) {
                if (i !== l.length - 1) {
                    Ids += `Ids=${l[i]["hotelId"]}&`
                } else {
                    Ids += `Ids=${l[i]["hotelId"]}`
                }
            }

            let queryParams = ``;
            queryParams += Ids;
            queryParams += `&CheckInDate=${check_in_date}`;
            queryParams += `&CheckOutDate=${check_out_date}`;
            queryParams += `&NumberOfAdults=${adult_count}`;
            if (number_and_children_ages.length != 0) {
                queryParams += `&${childrensAges}`
            }
            queryParams += `&Currency=${this.headers.currency}`


            let url = `${monakerCredential["url"]}/product/property-availabilities/availability?${queryParams}`
            console.log("URL", url)
            let availabilityResult = await HttpRequest.monakerRequest(url, "GET", {}, monakerCredential["key"])

            let result = availabilityResult.data;
            console.log("result", result);

            if (result.length != 0) {
                let hotelId = result.map((hotel) => {
                    return hotel["propertyId"];
                })

                let data = await getManager()
                    .createQueryBuilder(Hotel, "hotel")
                    .distinctOn(["hotel_name"])
                    .select([
                        "hotel.hotelId",
                        "hotel.hotelName",
                        "hotel.city",
                        "hotel.country",
                        "hotel.latitude",
                        "hotel.longitude",
                        "hotel.images",
                        "hotel.amenties"
                    ])
                    .where("hotel.hotel_id IN(:...hotel_id)", { hotel_id: hotelId })
                    .getMany();

                for (let i = 0; i < result.length; i++) {
                    const hotel = new HotelDetail();
                    const hotel_details = data.find((data) => data["hotelId"] == result[i]["propertyId"]);
                    hotel.property_id = hotel_details["hotelId"];
                    hotel.property_name = hotel_details["hotelName"];
                    hotel.city = hotel_details["city"];
                    hotel.country = hotel_details["country"];
                    hotel.net_price = result[i]["totalPrice"];
                    hotel.selling_price = Generic.formatPriceDecimal(PriceMarkup.applyMarkup(hotel.net_price, markUpDetails));
                    let instalmentDetails = Instalment.weeklyInstalment(hotel.selling_price, check_in_date, bookingDate, 0);
                    if (instalmentDetails.instalment_available) {
                        hotel.start_price = instalmentDetails.instalment_date[0].instalment_amount;
                        hotel.secondary_start_price = instalmentDetails.instalment_date[1].instalment_amount;
                    }
                    else {
                        hotel.start_price = 0;
                        hotel.secondary_start_price = 0;
                    }
                    if (typeof secondaryMarkUpDetails != 'undefined' && Object.keys(secondaryMarkUpDetails).length) {
                        hotel.secondary_selling_price = Generic.formatPriceDecimal(PriceMarkup.applyMarkup(hotel.net_price, secondaryMarkUpDetails))
                    }
                    else {
                        hotel.secondary_selling_price = 0;
                    }
                    hotel.instalment_details = instalmentDetails;
                    // let amenities = (hotel_details["amenties"]).replace("{", "").replace("}", "").split(",");
                    let amenities = (hotel_details["amenties"]).split(",");

                    let addAmenities: any = [];
                    for (let i = 0; i < amenities.length; i++) {
                        addAmenities.push(amenities[i]);
                    }
                    hotel.amenties = addAmenities
                    hotel.date = check_out_date
                    hotel.display_image = `https://sandbox-images.nexttrip.com${hotel_details["images"].split(',')[0]}`;
                    hotel.latitude = hotel_details["latitude"];
                    hotel.longintude = hotel_details["longitude"];
                    hotelDetails.push(hotel);
                }
            }
        }

        if (hotelDetails.length == 0) {
            if (flag == true) {
                return { message: "hotel not found" }
            } else {
                throw new NotFoundException(`Not found any home rental`)

            }
        }

        let hotels = new HotelSearchResult();
        hotels.items = hotelDetails;

        let priceRange = new PriceRange();
        let priceType = 'selling_price';
        priceRange.min_price = this.getMinPrice(hotelDetails, priceType);
        priceRange.max_price = this.getMaxPrice(hotelDetails, priceType);
        hotels.price_range = priceRange;

        let partialPaymentPriceRange = new PriceRange();
        priceType = 'secondary_start_price';
        partialPaymentPriceRange.min_price = this.getMinPrice(hotelDetails, priceType);
        partialPaymentPriceRange.max_price = this.getMaxPrice(hotelDetails, priceType);
        hotels.partial_payment_price_range = partialPaymentPriceRange;

        hotels.amenties = this.getAminities(hotelDetails);

        return hotels;
    }

    async unitTypeListAvailability(availabilityDetailsDto: AvailabilityDetailsDto, user) {
        const { id, check_in_date, check_out_date, adult_count, number_and_children_ages = [] } = availabilityDetailsDto;

        let childrensAges = ``;
        let queryParams = ``;

        if (number_and_children_ages.length != 0) {
            let check_age = number_and_children_ages.every((age) => {
                return age <= 17;
            })

            if (!check_age) {
                throw new NotAcceptableException(`Children age must be 17 year or below`)
            }

            for (let k = 0; k < number_and_children_ages.length; k++) {
                if (k != number_and_children_ages.length - 1) {
                    childrensAges += `NumberAndAgeOfChildren=${number_and_children_ages[k]}&`
                } else {
                    childrensAges += `NumberAndAgeOfChildren=${number_and_children_ages[k]}`
                }
            }
        }

        let monakerCredential = await this.getMonakerCredential();
        let bookingDate = moment(new Date()).format("YYYY-MM-DD");
        let module = await getManager()
            .createQueryBuilder(Module, "module")
            .where("module.name = :name", { name: 'home rental' })
            .getOne();

        if (!module) {
            throw new InternalServerErrorException(`home rental module is not configured in database&&&module&&&${errorMessage}`);
        }

        let markup = await this.getMarkupDetails(bookingDate, check_in_date, user, module);
        let markUpDetails = markup.markUpDetails;
        let secondaryMarkUpDetails = markup.secondaryMarkUpDetails;

        queryParams += `CheckInDate=${check_in_date}`;
        queryParams += `&CheckOutDate=${check_out_date}`;
        queryParams += `&NumberOfAdults=${adult_count}`;
        if (number_and_children_ages.length != 0) {
            queryParams += `&${childrensAges}`;
        }
        queryParams += `&Currency=${this.headers.currency}`;


        let url = `${monakerCredential["url"]}/product/property-availabilities/${id}/availability?${queryParams}`;
        let unitTypeListResponse = await HttpRequest.monakerRequest(url, "GET", {}, monakerCredential["key"])

        let unitTypeResult = unitTypeListResponse.data["unitStays"]

        let url2 = `${monakerCredential["url"]}/content/properties/${id}`;
        let hotelDetailResponse = await HttpRequest.monakerRequest(url2, "GET", {}, monakerCredential["key"]);

        const hotelResult = hotelDetailResponse.data;

        let rooms: Room[] = [];
        let room: Room;

        for (let i = 0; i < unitTypeResult.length; i++) {
            room = new Room();
            room.id = unitTypeResult[i]["id"]
            room.rate_plan_code = unitTypeResult[i]["prices"][0]["ratePlanCode"];
            room.net_price = unitTypeResult[i]["prices"][0]["amountAfterTax"];
            room.selling_price = Generic.formatPriceDecimal(PriceMarkup.applyMarkup(room.net_price, markUpDetails));
            let instalmentDetails = Instalment.weeklyInstalment(room.selling_price, check_in_date, bookingDate, 0);

            if (instalmentDetails.instalment_available) {
                room.start_price = instalmentDetails.instalment_date[0].instalment_amount;
                room.secondary_start_price = instalmentDetails.instalment_date[1].instalment_amount;
            }
            else {
                room.start_price = 0;
                room.secondary_start_price = 0;
            }
            if (typeof secondaryMarkUpDetails != 'undefined' && Object.keys(secondaryMarkUpDetails).length) {
                room.secondary_selling_price = Generic.formatPriceDecimal(PriceMarkup.applyMarkup(room.net_price, secondaryMarkUpDetails))
            }
            else {
                room.secondary_selling_price = 0;
            }
            room.instalment_details = instalmentDetails;
            room.name = unitTypeResult[i]["prices"][0]["ratePlanDescription"] != null ? unitTypeResult[i]["prices"][0]["ratePlanDescription"] : ''

            let cancelPolicies = new CancellationPolicy()
            let policy_info: any = [];

            let off_set_drop_time;
            let off_set_time_unit
            let off_unit_multiplier;
            for (let k = 0; k < unitTypeResult[i]["policyInfo"]["cancelPolicies"].length; k++) {
                let data = unitTypeResult[i]["policyInfo"]["cancelPolicies"][k];
                let policy = ``;
                let amount_percent = data["amountPercent"]["percent"] != null ? (data["amountPercent"]["percent"] * room.selling_price) : data["amountPercent"]["amount"];
                cancelPolicies.is_refundable = unitTypeResult[i]["policyInfo"]["cancelPolicies"][k]["nonRefundable"] == true ? false : true;
                if (!cancelPolicies.is_refundable) {
                    policy_info.push(`This is not refundable`)
                }
                if (data["deadline"] != null) {
                    if (data["deadline"]["absoluteDeadline"] != null) {
                        let absoluteDeadline = ` ${amount_percent} cancellation fee up to 23:59 on ${data["deadline"]["absoluteDeadline"]} `;
                        policy = absoluteDeadline;
                    }
                    else {
                        off_set_drop_time = data["deadline"]["offsetDropTime"] != null ? data["deadline"]["offsetDropTime"] : '';
                        off_set_time_unit = data["deadline"]["offsetTimeUnit"] != null ? data["deadline"]["offsetTimeUnit"] : '';
                        off_unit_multiplier = data["deadline"]["offsetUnitMultiplier"] != null ? data["deadline"]["offsetUnitMultiplier"] : '';
                        policy = `${amount_percent} cancellation fee ${off_unit_multiplier} ${off_set_time_unit} ${off_set_drop_time}`;
                    }
                    policy_info.push(policy);
                }
                cancelPolicies.penalty_info = policy_info;
                room.cancellation_policy = cancelPolicies;
            }
            rooms.push(room);
        }
        const hotelDetails = new HotelDetails();
        hotelDetails.property_id = id;
        hotelDetails.property_name = hotelResult["propertyName"];
        hotelDetails.description = hotelResult["descriptions"][0]["description"];
        let images: Images[] = [];
        let image: Images;
        for (let j = 0; j < hotelResult["images"].length; j++) {
            image = new Images();
            if (hotelResult["images"][j]["imageSize"] == 'Medium') {
                image.url = `https://sandbox-images.nexttrip.com${hotelResult["images"][j]["url"]}`;
                images.push(image);
            }
        }
        hotelDetails.images = images;
        hotelDetails.amenities = hotelResult["propertyAmenities"]
        hotelDetails.city = hotelResult["address"]["city"]
        hotelDetails.country = hotelResult["address"]["country"]
        hotelDetails.rooms = rooms;
        return hotelDetails;

    }


    async verifyUnitTypeAvailability(verifyAvailabilitydto: VerifyAvailabilityDto, user) {

        const { room_id, rate_plan_code, check_in_date, check_out_date, adult_count, number_and_children_ages = [] } = verifyAvailabilitydto;
        let monakerCredential = await this.getMonakerCredential();
        let bookingDate = moment(new Date()).format("YYYY-MM-DD");
        let childrensAges = ``;
        let queryParams = ``;

        if (number_and_children_ages.length != 0) {
            let check_age = number_and_children_ages.every((age) => {
                return age <= 17;
            })

            if (!check_age) {
                throw new NotAcceptableException(`Children age must be 17 year or below`)
            }

            for (let k = 0; k < number_and_children_ages.length; k++) {
                if (k != number_and_children_ages.length - 1) {
                    childrensAges += `NumberAndAgeOfChildren=${number_and_children_ages[k]}&`
                } else {
                    childrensAges += `NumberAndAgeOfChildren=${number_and_children_ages[k]}`
                }
            }
        }

        let module = await getManager()
            .createQueryBuilder(Module, "module")
            .where("module.name = :name", { name: 'home rental' })
            .getOne();

        if (!module) {
            throw new InternalServerErrorException(`home rental module is not configured in database&&&module&&&${errorMessage}`);
        }

        let markup = await this.getMarkupDetails(bookingDate, check_in_date, user, module);
        let markUpDetails = markup.markUpDetails;
        let secondaryMarkUpDetails = markup.secondaryMarkUpDetails;

        queryParams += `RatePlanCode=${rate_plan_code}`;
        queryParams += `&CheckInDate=${check_in_date}`;
        queryParams += `&CheckOutDate=${check_out_date}`;
        queryParams += `&NumberOfAdults=${adult_count}`;
        if (number_and_children_ages.length != 0) {
            queryParams += `&${childrensAges}`;
        }
        queryParams += `&Currency=${this.headers.currency}`;

        let url = `${monakerCredential["url"]}/product/unit-availabilities/${room_id}/verify-availability?${queryParams}`

        let verifyResult = await HttpRequest.monakerRequest(url, "GET", {}, monakerCredential["key"]);

        const response = verifyResult.data;

        // console.log("REPONSe", response);

        if (!response["available"]) {
            throw new NotAcceptableException(`Not available vacation rental home`)
        }

        const verifyAvailability = new VerifyAvailability();

        let feesType: FeesType;
        // let fees: Fees[] = [];
        let fees;

        verifyAvailability.available_status = response["available"];
        verifyAvailability.booking_code = response["quoteHandle"];
        verifyAvailability.net_price = response["totalPrice"]["amountAfterTax"];

        verifyAvailability.selling_price = Generic.formatPriceDecimal(PriceMarkup.applyMarkup(verifyAvailability.net_price, markUpDetails));
        let instalmentDetails = Instalment.weeklyInstalment(verifyAvailability.selling_price, check_in_date, bookingDate, 0);

        if (instalmentDetails.instalment_available) {
            verifyAvailability.start_price = instalmentDetails.instalment_date[0].instalment_amount;
            verifyAvailability.secondary_start_price = instalmentDetails.instalment_date[1].instalment_amount;
        }
        else {
            verifyAvailability.start_price = 0;
            verifyAvailability.secondary_start_price = 0;
        }
        if (typeof secondaryMarkUpDetails != 'undefined' && Object.keys(secondaryMarkUpDetails).length) {
            verifyAvailability.secondary_selling_price = Generic.formatPriceDecimal(PriceMarkup.applyMarkup(verifyAvailability.net_price, secondaryMarkUpDetails))
        }
        else {
            verifyAvailability.secondary_selling_price = 0;
        }
        verifyAvailability.instalment_details = instalmentDetails;
        if (response["totalPrice"]["ratePlanCode"] == "ThisUnitTypeHasMandatoryAddonsPaidOnArrival") {
            feesType = new FeesType();
            for (let i = 0; i < response["fees"].length; i++) {
                fees = new Fees();
                if (response["fees"][i]["mandatoryInd"] == true) {
                    fees.message = response["fees"][i]["description"];

                    feesType.mandtory_fee_due_at_check_in.push(fees);
                }
            }
        } else {
            feesType = new FeesType();
            for (let i = 0; i < response["fees"].length; i++) {
                let fees = new Fees();
                if (response["fees"][i]["mandatoryInd"] == true) {
                    fees.message = response["fees"][i]["description"];
                    feesType.mandtory_fee_already_paid.push(fees);
                }
                if (response["fees"][i]["mandatoryInd"] == false) {
                    fees.message = response["fees"][i]["description"];
                    feesType.optiona_fee.push(fees);              
                }
            }
        }

        verifyAvailability.feesType = feesType;

        return verifyAvailability;
    }


    async booking(bookingDto: BookingDto, travelers, booking_code, net_price) {
        const { room_id, rate_plan_code, check_in_date, check_out_date, adult_count, number_and_children_ages = [] } = bookingDto;
        let monakerCredential = await this.getMonakerCredential();

        console.log("travelers customer", travelers.customer)
        console.log("travelers guest", travelers.guest)

        let childrensAges = ``;
        let queryParams = ``;

        if (number_and_children_ages.length != 0) {
            let check_age = number_and_children_ages.every((age) => {
                return age <= 17;
            })

            if (!check_age) {
                throw new NotAcceptableException(`Children age must be 17 year or below`)
            }

            for (let k = 0; k < number_and_children_ages.length; k++) {
                if (k != number_and_children_ages.length - 1) {
                    childrensAges += `NumberAndAgeOfChildren=${number_and_children_ages[k]}&`
                } else {
                    childrensAges += `NumberAndAgeOfChildren=${number_and_children_ages[k]}`
                }
            }
        }

        let url2 = `${monakerCredential["url"]}/transaction/reservations?Language=${this.headers.language}`;
        let requestBody = {
            "id": room_id,
            "currency": this.headers.currency,
            "price": net_price,
            "quoteHandle": booking_code,
            "ratePlanCode": rate_plan_code,
            "checkInDate": check_in_date,
            "checkOutDate": check_out_date,
            "numberOfAdults": adult_count,
            "numberAndAgeOfChildren": number_and_children_ages.length != 0 ? number_and_children_ages : null,
            "customer": travelers.customer,
            "Guests": travelers.guest
        }

        let bookingResult = await HttpRequest.monakerRequest(url2, "POST", requestBody, monakerCredential["key"])

        let bookingResponse;
        if (bookingResult.data.bookingStatus == "Confirmed") {
            bookingResponse = {
                booking_status: 'success',
                supplier_status: '',
                supplier_booking_id: bookingResult.data['reservationId'],
                success_message: `Booking is successfully done!`,
                error_message: ''
            }
        } else {
            bookingResponse = {
                booking_status: 'failed',
                supplier_booking_id: '',
                success_message: ``,
                error_message: `Booking failed`
            }
        }
        return bookingResponse;

    }

    async deleteBooking(reservationId) {
        let monakerCredential = await this.getMonakerCredential();


        let url = `${monakerCredential["url"]}/transaction/reservations/${reservationId}`;

        let deleteReponse = await HttpRequest.monakerRequest(url, "DELETE", {}, monakerCredential["key"]);

        return deleteReponse.data

    }

}