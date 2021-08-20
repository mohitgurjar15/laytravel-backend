import { getManager } from "typeorm";
import { AvailabilityVacationDto } from "../dto/availability.dto";
import { HotelDetail, HotelSearchResult, NearDistance, PriceRange } from "../model/availability.model";
import { StrategyVacationRental } from "./strategy.interface";
import { AvailabilityVacationDetailsDto } from "../dto/availabilty_details.dto";
import { AdditionalDescription, AdditionalDetail, CancellationPolicy, DocumentDetails, HotelDetails, Images, Room } from "../model/room_details.model";
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
import collect from "collect.js";
import { vacationCategoty } from "../vacation-rental.const";
import { SearchFullTextDto } from "../dto/search-full-text.dto";
import { HomeRentalRevalidate } from "../model/homeRevalidate.model";
import { off } from "process";

export class Monaker implements StrategyVacationRental {

    private headers;
    constructor(
        headers
    ) {
        this.headers = headers;
    }

    private default_amenities = {
        "AirConditioning": "ac",
        "InternetServices": "wifi",
        "HighSpeedWireless": "wifi",
        "ComplimentaryWirelessInternet": "wifi",
        "NonSmokingRooms": "no_smoking",
        "CoffeeTea": "coffe_tea"
    };

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
            item["amenities"].map((e) => {
                if (!amenities.includes(e)) {
                    amenities.push(e);
                }
            })
        });
        return amenities;
    }

    sortItems(hotels) {
        let data = hotels.sort(this.compare);
        return data;
    }

    compare(a, b) {
        return (a.selling_price - b.selling_price);

    }

    async searchFullText(searchFullText: SearchFullTextDto, user, validFlag) {
        const { name, type, check_in_date, check_out_date, adult_count, number_and_children_ages = [] } = searchFullText;
        let childrensAges = ``;

        if (adult_count > 4) {
            throw new NotAcceptableException(`please select 4 or below adult count`);
        } else if (number_and_children_ages.length != 0) {
            if (number_and_children_ages.length > 4) {
                throw new NotAcceptableException(`please select 4 or below children count`);
            }
        }

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

        let markup = await this.getMarkupDetails(check_in_date, bookingDate, user, module);
        let markUpDetails = markup.markUpDetails;
        let secondaryMarkUpDetails = markup.secondaryMarkUpDetails;

        let location_name = name;
        if (type == "city") {
            location_name = name.split(",")[0];
        }

        let queryParams = ``;
        queryParams += `Q=${location_name}`;
        queryParams += `&CheckInDate=${check_in_date}`;
        queryParams += `&CheckOutDate=${check_out_date}`;
        queryParams += `&NumberOfAdults=${adult_count}`;
        if (number_and_children_ages.length != 0) {
            queryParams += `&${childrensAges}`;
        }
        queryParams += `&Currency=${this.headers.currency}`;
        queryParams += `&Per_page=10`;
        let page = 1;
        let flag = 0;
        let url;
        let response;
        let link;
        let hotelDetails: HotelDetail[] = [];

        for (let i = 0; i == flag;) {
            if (flag == 0) {
                url = `https://sandbox-api.nexttrip.com/api/v2/search/search-properties/fulltext?${queryParams}&Page=${page}`;
                response = await HttpRequest.monakerRequest(url, "GET", {}, monakerCredential["key"], validFlag);
                if (response == false) {
                    return { message: "hotel not found" }
                }
                if (response.data.length > 0) {
                    let result = response.data;
                    for (let i = 0; i < result.length; i++) {
                        const hotelDetail = new HotelDetail();
                        let element = result[i];
                        hotelDetail.property_id = element["propertyId"]
                        hotelDetail.property_name = element["propertyName"];
                        hotelDetail.amenities = element["propertyAmenities"];
                        hotelDetail.net_price = element["totalPrice"];
                        hotelDetail.selling_price = Generic.formatPriceDecimal(PriceMarkup.applyMarkup(hotelDetail.net_price, markUpDetails));
                        let instalmentDetails = Instalment.weeklyInstalment(hotelDetail.selling_price, check_in_date, bookingDate, 0,0,0,0,false,0,true,[]);
                        if (instalmentDetails.instalment_available) {
                            hotelDetail.start_price = instalmentDetails.instalment_date[0].instalment_amount;
                            hotelDetail.secondary_start_price = instalmentDetails.instalment_date[1].instalment_amount;
                        }
                        else {
                            hotelDetail.start_price = 0;
                            hotelDetail.secondary_start_price = 0;
                        }
                        if (typeof secondaryMarkUpDetails != 'undefined' && Object.keys(secondaryMarkUpDetails).length) {
                            hotelDetail.secondary_selling_price = Generic.formatPriceDecimal(PriceMarkup.applyMarkup(hotelDetail.net_price, secondaryMarkUpDetails))
                        }
                        else {
                            hotelDetail.secondary_selling_price = 0;
                        }
                        hotelDetail.instalment_details = instalmentDetails;

                        let addAmenities: any = [];
                        for (let i = 0; i < element["propertyAmenities"].length; i++) {
                            addAmenities.push(element["propertyAmenities"][i]);
                        }
                        hotelDetail.amenities = addAmenities;

                        let collection = collect(hotelDetail.amenities);
                        let combined = collection.combine(hotelDetail.amenities);
                        let sorted_amenities: any = collect(this.default_amenities).intersectByKeys(combined).values().unique().toArray();
                        hotelDetail.fixed_amenities = sorted_amenities;
                        hotelDetail.check_in_date = check_in_date
                        hotelDetail.check_out_date = check_out_date
                        hotelDetail.display_image = `https://sandbox-images.nexttrip.com${element["imageUrl"]}`;
                        hotelDetail.latitude = element["address"]["position"]["latitude"];
                        hotelDetail.longintude = element["address"]["position"]["longitude"];
                        hotelDetail.city = element["address"]["city"];
                        hotelDetail.country = element["address"]["country"];
                        let near_location: NearDistance[] = [];
                        for (let j = 0; j < element["distances"].length; j++) {
                            let near_distance = new NearDistance();
                            near_distance.ditance = element["distances"][j]["distance"];
                            near_distance.near_by = element["distances"][j]["code"];
                            near_distance.location = element["distances"][j]["description"];
                            near_location.push(near_distance);
                        }
                        hotelDetail.near_distance = near_location;
                        hotelDetails.push(hotelDetail);
                    }
                    link = response.headers.link.split(",")[0].split(";")[0].replace("<", "").replace(">", "");
                    // console.log("LINK", link);
                    flag++;
                    i++;
                } else {
                    flag = -1;
                }
            } else {
                url = `https://sandbox-api.nexttrip.com/${link}`;
                response = await HttpRequest.monakerRequest(url, "GET", {}, monakerCredential["key"]);
                if (response == false) {
                    return { message: "hotel not found" }
                }
                if (response.data.length > 0) {
                    let result = response.data;
                    for (let i = 0; i < result.length; i++) {
                        const hotelDetail = new HotelDetail();
                        let element = result[i];
                        hotelDetail.property_id = element["propertyId"]
                        hotelDetail.property_name = element["propertyName"];
                        hotelDetail.amenities = element["propertyAmenities"];
                        hotelDetail.net_price = element["totalPrice"];
                        hotelDetail.selling_price = Generic.formatPriceDecimal(PriceMarkup.applyMarkup(hotelDetail.net_price, markUpDetails));
                        let instalmentDetails = Instalment.weeklyInstalment(hotelDetail.selling_price, check_in_date, bookingDate, 0, 0, 0, 0, false, 0, true, []);
                        if (instalmentDetails.instalment_available) {
                            hotelDetail.start_price = instalmentDetails.instalment_date[0].instalment_amount;
                            hotelDetail.secondary_start_price = instalmentDetails.instalment_date[1].instalment_amount;
                        }
                        else {
                            hotelDetail.start_price = 0;
                            hotelDetail.secondary_start_price = 0;
                        }
                        if (typeof secondaryMarkUpDetails != 'undefined' && Object.keys(secondaryMarkUpDetails).length) {
                            hotelDetail.secondary_selling_price = Generic.formatPriceDecimal(PriceMarkup.applyMarkup(hotelDetail.net_price, secondaryMarkUpDetails))
                        }
                        else {
                            hotelDetail.secondary_selling_price = 0;
                        }
                        hotelDetail.instalment_details = instalmentDetails;

                        let addAmenities: any = [];
                        for (let i = 0; i < element["propertyAmenities"].length; i++) {
                            addAmenities.push(element["propertyAmenities"][i]);
                        }
                        hotelDetail.amenities = addAmenities;

                        let collection = collect(hotelDetail.amenities);
                        let combined = collection.combine(hotelDetail.amenities);
                        let sorted_amenities: any = collect(this.default_amenities).intersectByKeys(combined).values().unique().toArray();
                        hotelDetail.fixed_amenities = sorted_amenities;
                        hotelDetail.check_in_date = check_in_date
                        hotelDetail.check_out_date = check_out_date
                        hotelDetail.display_image = `https://sandbox-images.nexttrip.com${element["imageUrl"]}`;
                        hotelDetail.latitude = element["address"]["position"]["latitude"];
                        hotelDetail.longintude = element["address"]["position"]["longitude"];
                        let near_location: NearDistance[] = [];
                        for (let j = 0; j < element["distances"].length; j++) {
                            let near_distance = new NearDistance();
                            near_distance.ditance = element["distances"][j]["distance"];
                            near_distance.near_by = element["distances"][j]["code"];
                            near_distance.location = element["distances"][j]["description"];
                            near_location.push(near_distance);
                        }
                        hotelDetail.near_distance = near_location;
                        hotelDetails.push(hotelDetail);
                    }
                    link = response.headers.link.split(",")[0].split(";")[0].replace("<", "").replace(">", "");
                    console.log("LINK", link);
                    flag++;
                    i++;
                } else {
                    flag = -1;
                }
            }

        }

        if (hotelDetails.length == 0) {
            if (validFlag) {
                return { message: "hotel not found" }
            } else {
                throw new NotFoundException('No found any vacation rentnal')
            }

        }

        let hotels = new HotelSearchResult();

        hotels.items = this.sortItems(hotelDetails);

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

    // async checkAllavaiability(availability: AvailabilityVacationDto, user, flag) {

    //     const { id, type, check_in_date, check_out_date, adult_count, number_and_children_ages = [] } = availability;
    //     let hotelIds;
    //     let city;
    //     let childrensAges = ``;

    //     if (adult_count > 4) {
    //         throw new NotAcceptableException(`please select 4 or below adult count`);
    //     } else if (number_and_children_ages.length != 0) {
    //         if (number_and_children_ages.length > 4) {
    //             throw new NotAcceptableException(`please select 4 or below children count`);
    //         }
    //     }

    //     if (number_and_children_ages.length != 0) {
    //         let check_age = number_and_children_ages.every((age) => {
    //             return age <= 17;
    //         })

    //         if (!check_age) {
    //             throw new NotAcceptableException(`Children age must be 17 year or below`)
    //         }

    //         for (let k = 0; k < number_and_children_ages.length; k++) {
    //             if (k != number_and_children_ages.length - 1) {
    //                 childrensAges += `NumberAndAgeOfChildren=${number_and_children_ages[k]}&`
    //             } else {
    //                 childrensAges += `NumberAndAgeOfChildren=${number_and_children_ages[k]}`
    //             }
    //         }
    //     }

    //     let module = await getManager()
    //         .createQueryBuilder(Module, "module")
    //         .where("module.name = :name", { name: 'home rental' })
    //         .getOne();
    //     let bookingDate = moment(new Date()).format("YYYY-MM-DD");
    //     let monakerCredential = await this.getMonakerCredential();

    //     if (!module) {
    //         throw new InternalServerErrorException(`home rental module is not configured in database&&&module&&&${errorMessage}`);
    //     }

    //     if (type == "hotel") {
    //         hotelIds = await getManager()
    //             .createQueryBuilder(HotelView, "hotel_view")
    //             .distinctOn(["hotel_id"])
    //             .select([
    //                 "hotel_view.hotelId"
    //             ])
    //             .where("hotel_view.id = :id", { id: id })
    //             .getMany();

    //         if (hotelIds.length == 0) {
    //             throw new NotFoundException(`No found hotel`)
    //         }
    //     } else {
    //         city = await getManager()
    //             .createQueryBuilder(HotelView, "hotel_view")
    //             .select([
    //                 "hotel_view.city"
    //             ])
    //             .where("hotel_view.id = :id", { id: id })
    //             .getMany();

    //         if (city.length == 0) {
    //             throw new NotFoundException(`No found city`)
    //         }

    //         hotelIds = await getManager()
    //             .createQueryBuilder(HotelView, "hotelView")
    //             .distinctOn(["hotel_id"])
    //             .select([
    //                 "hotelView.hotelId"
    //             ])
    //             .where("hotelView.city = :city AND hotelView.hotel_category IN(:...category)", { city: city[0]["city"], category: vacationCategoty })
    //             .getMany();

    //         if (hotelIds.length == 0) {
    //             throw new NotFoundException(`No found hotel`)
    //         }

    //     }

    //     // console.log("hotel ids", hotelIds);

    //     let markup = await this.getMarkupDetails(bookingDate, check_in_date, user, module);
    //     let markUpDetails = markup.markUpDetails;
    //     let secondaryMarkUpDetails = markup.secondaryMarkUpDetails;

    //     let hotelDetails: HotelDetail[] = [];

    //     for (let j = 0; j < (Math.ceil(hotelIds.length) / 50); j++) {
    //         let start = (j * 2 * 25);
    //         let end = start + 50;
    //         let l = hotelIds.slice(start, end);

    //         let Ids = ``;
    //         for (let i = 0; i < l.length; i++) {
    //             if (i !== l.length - 1) {
    //                 Ids += `Ids=${l[i]["hotelId"]}&`
    //             } else {
    //                 Ids += `Ids=${l[i]["hotelId"]}`
    //             }
    //         }

    //         let queryParams = ``;
    //         queryParams += Ids;
    //         queryParams += `&CheckInDate=${check_in_date}`;
    //         queryParams += `&CheckOutDate=${check_out_date}`;
    //         queryParams += `&NumberOfAdults=${adult_count}`;
    //         if (number_and_children_ages.length != 0) {
    //             queryParams += `&${childrensAges}`
    //         }
    //         queryParams += `&Currency=${this.headers.currency}`


    //         let url = `${monakerCredential["url"]}/product/property-availabilities/availability?${queryParams}`
    //         let availabilityResult = await HttpRequest.monakerRequest(url, "GET", {}, monakerCredential["key"])

    //         let result = availabilityResult.data;

    //         if (result.length != 0) {
    //             let hotelId = result.map((hotel) => {
    //                 console.log("hotelID", hotel["propertyId"])
    //                 return hotel["propertyId"];
    //             })

    //             let data = await getManager()
    //                 .createQueryBuilder(Hotel, "hotel")
    //                 // .distinctOn(["hotel_name"])
    //                 .select([
    //                     "hotel.id",
    //                     "hotel.hotelId",
    //                     "hotel.hotelName",
    //                     "hotel.city",
    //                     "hotel.country",
    //                     "hotel.latitude",
    //                     "hotel.longitude",
    //                     "hotel.images",
    //                     "hotel.amenties"
    //                 ])
    //                 .where("hotel.hotel_id IN(:...hotel_id)", { hotel_id: hotelId })
    //                 .getMany();


    //             for (let i = 0; i < result.length; i++) {
    //                 const hotel = new HotelDetail();
    //                 const hotel_details = data.find((data) => data["hotelId"] == result[i]["propertyId"]);
    //                 // console.log("hotel details=====>",hotel_details["hotelId"]);
    //                 hotel.property_id = hotel_details["hotelId"];
    //                 hotel.property_name = hotel_details["hotelName"];
    //                 hotel.city = hotel_details["city"];
    //                 hotel.country = hotel_details["country"];
    //                 hotel.net_price = result[i]["totalPrice"];
    //                 hotel.selling_price = Generic.formatPriceDecimal(PriceMarkup.applyMarkup(hotel.net_price, markUpDetails));
    //                 let instalmentDetails = Instalment.weeklyInstalment(hotel.selling_price, check_in_date, bookingDate, 0);
    //                 if (instalmentDetails.instalment_available) {
    //                     hotel.start_price = instalmentDetails.instalment_date[0].instalment_amount;
    //                     hotel.secondary_start_price = instalmentDetails.instalment_date[1].instalment_amount;
    //                 }
    //                 else {
    //                     hotel.start_price = 0;
    //                     hotel.secondary_start_price = 0;
    //                 }
    //                 if (typeof secondaryMarkUpDetails != 'undefined' && Object.keys(secondaryMarkUpDetails).length) {
    //                     hotel.secondary_selling_price = Generic.formatPriceDecimal(PriceMarkup.applyMarkup(hotel.net_price, secondaryMarkUpDetails))
    //                 }
    //                 else {
    //                     hotel.secondary_selling_price = 0;
    //                 }
    //                 hotel.instalment_details = instalmentDetails;
    //                 // let amenities = (hotel_details["amenties"]).replace("{", "").replace("}", "").split(",");
    //                 let amenities = (hotel_details["amenties"]).split(",");

    //                 let addAmenities: any = [];
    //                 for (let i = 0; i < amenities.length; i++) {
    //                     addAmenities.push(amenities[i]);
    //                 }
    //                 hotel.amenities = addAmenities;

    //                 let amenities1 = collect(hotel.amenities);
    //                 let combined = amenities1.combine(hotel.amenities);
    //                 let sorted_amenities: any = collect(this.default_amenities).intersectByKeys(combined).values().unique().toArray();
    //                 hotel.fixed_amenities = sorted_amenities;
    //                 hotel.check_in_date = check_in_date
    //                 hotel.check_out_date = check_out_date
    //                 hotel.display_image = `https://sandbox-images.nexttrip.com${hotel_details["images"].split(',')[0]}`;
    //                 hotel.latitude = hotel_details["latitude"];
    //                 hotel.longintude = hotel_details["longitude"];
    //                 hotelDetails.push(hotel);
    //             }
    //         }
    //     }

    //     if (hotelDetails.length == 0) {
    //         if (flag == true) {
    //             return { message: "hotel not found" }
    //         } else {
    //             throw new NotFoundException(`Not found any home rental`)

    //         }
    //     }

    //     let hotels = new HotelSearchResult();

    //     hotels.items = this.sortItems(hotelDetails);

    //     let priceRange = new PriceRange();
    //     let priceType = 'selling_price';
    //     priceRange.min_price = this.getMinPrice(hotelDetails, priceType);
    //     priceRange.max_price = this.getMaxPrice(hotelDetails, priceType);
    //     hotels.price_range = priceRange;

    //     let partialPaymentPriceRange = new PriceRange();
    //     priceType = 'secondary_start_price';
    //     partialPaymentPriceRange.min_price = this.getMinPrice(hotelDetails, priceType);
    //     partialPaymentPriceRange.max_price = this.getMaxPrice(hotelDetails, priceType);
    //     hotels.partial_payment_price_range = partialPaymentPriceRange;

    //     hotels.amenties = this.getAminities(hotelDetails);

    //     return hotels;
    // }

    async unitTypeListAvailability(availabilityDetailsDto: AvailabilityVacationDetailsDto, user) {
        // console.log("------------",availabilityDetailsDto);
        const { id, check_in_date, check_out_date, adult_count, number_and_children_ages = [] } = availabilityDetailsDto;

        if (adult_count > 4) {
            throw new NotAcceptableException(`please select 4 or below adult count`);
        } else if (number_and_children_ages.length != 0) {
            if (number_and_children_ages.length > 4) {
                throw new NotAcceptableException(`please select 4 or below children count`);
            }
        }

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

        let markup = await this.getMarkupDetails(check_in_date, bookingDate, user, module);
        let markUpDetails = markup.markUpDetails;
        let secondaryMarkUpDetails = markup.secondaryMarkUpDetails;

        queryParams += `CheckInDate=${check_in_date}`;
        queryParams += `&CheckOutDate=${check_out_date}`;
        queryParams += `&NumberOfAdults=${adult_count}`;
        if (number_and_children_ages.length != 0) {
            queryParams += `&${childrensAges}`;
        }
        queryParams += `&Currency=${this.headers.currency}`;


        let unitTypeurl = `${monakerCredential["url"]}/product/property-availabilities/${id}/availability?${queryParams}`;
        let unitTypeListResponse = await HttpRequest.monakerRequest(unitTypeurl, "GET", {}, monakerCredential["key"])

        let unitTypeResult = unitTypeListResponse.data["unitStays"]

        let contentUrl2 = `${monakerCredential["url"]}/content/properties/${id}`;
        let contentResponse = await HttpRequest.monakerRequest(contentUrl2, "GET", {}, monakerCredential["key"]);

        const contentResult = contentResponse.data;

        let documentUrl = `${monakerCredential["url"]}/content/properties/${id}/documents`;
        let documentResponse = await HttpRequest.monakerRequest(documentUrl, "GET", {}, monakerCredential["key"]);

        const documentResult = documentResponse.data

        let rooms: Room[] = [];
        let room: Room;
        let feesType: FeesType;
        let additional_descriptions: AdditionalDescription[] = []
        let additional_description: AdditionalDescription;
        let document_detail: DocumentDetails;
        let document_details: DocumentDetails[] = [];
        let additional_detail: AdditionalDetail;
        let additional_details: AdditionalDetail[] = [];


        let fees;

        for (let i = 0; i < unitTypeResult.length; i++) {
            room = new Room();
            room.id = unitTypeResult[i]["id"]
            room.rate_plan_code = unitTypeResult[i]["prices"][0]["ratePlanCode"];
            room.net_price = unitTypeResult[i]["prices"][0]["amountAfterTax"];
            room.selling_price = Generic.formatPriceDecimal(PriceMarkup.applyMarkup(room.net_price, markUpDetails));
            let instalmentDetails = Instalment.weeklyInstalment(room.selling_price, check_in_date, bookingDate, 0, 0, 0, 0, false, 0, true, []);

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
            let policy;
            let off_unit_multiplier;
            for (let k = 0; k < unitTypeResult[i]["policyInfo"]["cancelPolicies"].length; k++) {
                let totalAmount = unitTypeResult[i]["prices"][0]["amountAfterTax"];
                let data = unitTypeResult[i]["policyInfo"]["cancelPolicies"][k];
                let refundableAmount = data["amountPercent"]["percent"] != null ? (totalAmount - ((data["amountPercent"]["percent"] * 100) * totalAmount) / 100) : (totalAmount - data["amountPercent"]["amount"]);

                off_set_drop_time = data["deadline"]["offsetDropTime"] != null ? data["deadline"]["offsetDropTime"] : '';
                off_set_time_unit = data["deadline"]["offsetTimeUnit"] != null ? data["deadline"]["offsetTimeUnit"] : '';
                off_unit_multiplier = data["deadline"]["offsetUnitMultiplier"] != null ? data["deadline"]["offsetUnitMultiplier"] : '';
                let offset = `${off_unit_multiplier} ${off_set_time_unit} ${off_set_drop_time}`;
                if (data["deadline"]["absoluteDeadline"] != null) {
                    if (refundableAmount == totalAmount) {
                        policy = `Up to ${data["deadline"]["absoluteDeadline"]} the reservation is refundable in full`;
                    } else {
                        policy = `Up to ${data["deadline"]["absoluteDeadline"]} the reservation has a ${data["amountPercent"]["amount"]} USD fee. Must be refunded ${refundableAmount} USD`;
                    }
                } else if (data["amountPercent"]["amount"] != null) {
                    if (refundableAmount == totalAmount) {
                        policy = `Refundable in full up to ${offset}: Expected refund: ${refundableAmount} USD`;
                    } else if (refundableAmount == 0) {
                        policy = `Non-refundable ${offset}`
                    } else {
                        policy = `Charge ${data["amountPercent"]["amount"]} USD up to ${offset}. Expected refund ${refundableAmount} USD`;
                    }
                } else {
                    if (refundableAmount == totalAmount) {
                        policy = `Refundable in full up to ${offset}. Expected refund: ${refundableAmount} USD`;
                    } else if (refundableAmount == 0) {
                        policy = `Non-refundable ${offset}. Expected refund ${refundableAmount} USD.`
                    } else {
                        policy = `Charge ${data["amountPercent"]["percent"]*100}% up to ${offset}. Expected refund ${refundableAmount} USD`;
                    }
                }

                policy_info.push(policy);


                // cancelPolicies.is_refundable = unitTypeResult[i]["policyInfo"]["cancelPolicies"][k]["nonRefundable"] == true ? false : true;
                // if (!cancelPolicies.is_refundable) {
                //     policy_info.push(`This is not refundable`)
                // }
                // if (data["deadline"] != null) {
                //     if (data["deadline"]["absoluteDeadline"] != null) {
                //         let absoluteDeadline = ` ${amount_percent} cancellation fee up to 23:59 on ${data["deadline"]["absoluteDeadline"]} `;
                //         policy = absoluteDeadline;
                //     }
                //     else {
                // off_set_drop_time = data["deadline"]["offsetDropTime"] != null ? data["deadline"]["offsetDropTime"] : '';
                // off_set_time_unit = data["deadline"]["offsetTimeUnit"] != null ? data["deadline"]["offsetTimeUnit"] : '';
                // off_unit_multiplier = data["deadline"]["offsetUnitMultiplier"] != null ? data["deadline"]["offsetUnitMultiplier"] : '';
                //         policy = `${amount_percent} cancellation fee ${off_unit_multiplier} ${off_set_time_unit} ${off_set_drop_time}`;
                //     }
                //     policy_info.push(policy);
                // }
                cancelPolicies.penalty_info = policy_info;
                room.cancellation_policy = cancelPolicies;
                room.deposite_policy = unitTypeResult[i]["policyInfo"]["depositPayments"].length != 0 ? unitTypeResult[i]["policyInfo"]["depositPayments"][0]["amountPercent"]["amount"] + " " + unitTypeResult[i]["policyInfo"]["depositPayments"][0]["currency"] + " " + "payable at check in" : '';
            }

            feesType = new FeesType();
            for (let j = 0; j < unitTypeResult[i]["fees"].length; j++) {
                let response = unitTypeResult[i];

                if (response["fees"][j]["mandatoryInd"] == true) {
                    if (response["fees"][j]["deadline"]["offsetDropTime"] == "AfterConfirmation" || response["fees"][j]["deadline"]["offsetDropTime"] == "AfterBooking") {
                        let fees = new Fees();
                        fees.message = response["fees"][j]["description"];
                        feesType.mandatory_fee_already_paid.push(fees);
                    } else {
                        let fees = new Fees();
                        fees.message = response["fees"][j]["description"];
                        feesType.mandatory_fee_due_at_check_in.push(fees);
                    }
                } else {
                    let fees = new Fees();
                    fees.message = response["fees"][j]["description"];
                    feesType.optional_fee.push(fees);
                }

                room.feesType = feesType;
            }

            for (let j = 0; j < contentResult["unitTypes"].length; j++) {
                let unitType = contentResult["unitTypes"][j];
                if (unitType["unitTypeCode"] == unitTypeResult[i]["unitTypeCode"]) {
                    room.badroom = unitType["nbrOfBedrooms"];
                    room.bathroom = unitType["nbrOfBathrooms"];
                }
            }

            rooms.push(room);
        }

        const hotelDetails = new HotelDetails();

        hotelDetails.property_id = id;
        hotelDetails.property_name = contentResult["propertyName"];
        hotelDetails.description = contentResult["descriptions"][0]["description"];
        let images: Images[] = [];
        let image: Images;
        for (let j = 0; j < contentResult["images"].length; j++) {
            image = new Images();
            if (contentResult["images"][j]["imageSize"] == 'Medium') {
                image.url = `https://sandbox-images.nexttrip.com${contentResult["images"][j]["url"]}`;
                images.push(image);
            }
        }
        hotelDetails.images = images;
        hotelDetails.amenities = contentResult["propertyAmenities"]
        hotelDetails.city = contentResult["address"]["city"]
        hotelDetails.country = contentResult["address"]["country"]

        for (let i = 0; i < contentResult["descriptions"].length; i++) {
            if (contentResult["descriptions"][i]["code"] != "Description" && contentResult["descriptions"][i]["code"] != "ShortDescription") {
                additional_description = new AdditionalDescription();
                additional_description.type = contentResult["descriptions"][i]["code"];
                additional_description.details = contentResult["descriptions"][i]["description"]

                additional_descriptions.push(additional_description);
            }

        }

        hotelDetails.additional_description = additional_descriptions;

        for (let i = 0; i < contentResult["additionalDetails"].length; i++) {
            additional_detail = new AdditionalDetail();
            additional_detail.type = contentResult["additionalDetails"][i]["code"];
            additional_detail.details = contentResult["additionalDetails"][i]["description"];
            additional_details.push(additional_detail);
        }

        hotelDetails.additional_details = additional_details;

        for (let i = 0; i < documentResult.length; i++) {
            document_detail = new DocumentDetails();
            document_detail.type = documentResult[i]["type"];
            document_detail.path = documentResult[i]["path"];
            document_details.push(document_detail);
        }

        hotelDetails.documents = document_details;

        hotelDetails.rooms = rooms;
        return hotelDetails;

    }


    async verifyUnitTypeAvailability(verifyAvailabilitydto: VerifyAvailabilityDto, user, flag) {

        const { property_id, room_id, original_price, rate_plan_code, check_in_date, check_out_date, adult_count, number_and_children_ages = [] } = verifyAvailabilitydto;
        let monakerCredential = await this.getMonakerCredential();
        let bookingDate = moment(new Date()).format("YYYY-MM-DD");

        if (adult_count > 4) {
            throw new NotAcceptableException(`please select 4 or below adult count`);
        } else if (number_and_children_ages.length != 0) {
            if (number_and_children_ages.length > 4) {
                throw new NotAcceptableException(`please select 4 or below children count`);
            }
        }

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

        let markup = await this.getMarkupDetails(check_in_date, bookingDate, user, module);
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

        let dto = {
            "id": property_id,
            "check_in_date": check_in_date,
            "check_out_date": check_out_date,
            "adult_count": adult_count,
            "number_and_children_ages": number_and_children_ages
        };

        let propertyResult = await this.unitTypeListAvailability(dto, user);

        const response = verifyResult.data;

        // console.log("DATA", response);

        if (response["available"] == false) {
            throw new NotAcceptableException(`The selected property is no longer available. Please search other properties.`)
        }

        if (flag == true) {
            if (response["totalPrice"]["amountAfterTax"] != original_price) {
                throw new NotAcceptableException(`The unit type price does not match`)
            }
        }

        const verifyAvailability = new VerifyAvailability();

        let feesType: FeesType;
        let fees;
        verifyAvailability.property_name = propertyResult["property_name"];
        verifyAvailability.property_id = property_id;
        verifyAvailability.room_id = room_id;
        verifyAvailability.rate_plan_code = rate_plan_code;
        verifyAvailability.available_status = response["available"];
        verifyAvailability.booking_code = response["quoteHandle"];
        verifyAvailability.net_price = response["totalPrice"]["amountAfterTax"];

        verifyAvailability.selling_price = Generic.formatPriceDecimal(PriceMarkup.applyMarkup(verifyAvailability.net_price, markUpDetails));
        let instalmentDetails = Instalment.weeklyInstalment(verifyAvailability.selling_price, check_in_date, bookingDate, 0, 0, 0, 0, false, 0, true, []);

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

        feesType = new FeesType();

        for (let i = 0; i < response["fees"].length; i++) {
            if (response["fees"][i]["mandatoryInd"] == true) {
                if (response["fees"][i]["deadline"]["offsetDropTime"] == "AfterConfirmation" || response["fees"][i]["deadline"]["offsetDropTime"] == "AfterBooking") {
                    let fees = new Fees();
                    fees.message = response["fees"][i]["description"];
                    feesType.mandatory_fee_already_paid.push(fees);
                } else {
                    let fees = new Fees();
                    fees.message = response["fees"][i]["description"];
                    feesType.mandatory_fee_due_at_check_in.push(fees);
                }
            } else {
                let fees = new Fees();
                fees.message = response["fees"][i]["description"];
                feesType.optional_fee.push(fees);
            }
        }

        verifyAvailability.feesType = feesType;
        let roomDetails = propertyResult.rooms.find((data) => data.rate_plan_code == rate_plan_code);
        verifyAvailability.cancellation_policy = roomDetails.cancellation_policy;
        verifyAvailability.room_name = roomDetails.name;
        verifyAvailability.city = propertyResult["city"];
        verifyAvailability.country = propertyResult["country"];
        verifyAvailability.adult = adult_count;
        verifyAvailability.number_and_chidren_age = number_and_children_ages;
        return verifyAvailability;
    }


    async booking(bookingDto: BookingDto, travelers, booking_code, net_price) {
        const { room_id, rate_plan_code, check_in_date, check_out_date, adult_count, number_and_children_ages = [] } = bookingDto;
        let monakerCredential = await this.getMonakerCredential();

        // console.log("travelers customer", travelers.customer)
        // console.log("travelers guest", travelers.guest)

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
            "guests": travelers.guest
        }

        let bookingResult = await HttpRequest.monakerRequest(url2, "POST", requestBody, monakerCredential["key"])
        let bookingResponse;

        if (bookingResult == false) {
            bookingResponse = {
                booking_status: 'failed',
                supplier_booking_id: '',
                success_message: ``,
                error_message: `Booking failed`
            }
        }
        else if (bookingResult.data.bookingStatus == "Confirmed") {
            bookingResponse = {
                booking_status: 'success',
                supplier_status: '',
                supplier_booking_id: bookingResult.data['reservationId'],
                success_message: `Booking is successfully done!`,
                error_message: ''
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

    async homeRentalRevalidate(reValidateDto, user) {
        const { property_id, room_id, rate_plan_code, check_in_date, check_out_date, adult_count, number_and_children_ages = [] } = reValidateDto;
        console.log(reValidateDto);
        let monakerCredential = await this.getMonakerCredential();
        let bookingDate = moment(new Date()).format("YYYY-MM-DD");

        if (adult_count > 4) {
            throw new NotAcceptableException(`please select 4 or below adult count`);
        } else if (number_and_children_ages.length != 0) {
            if (number_and_children_ages.length > 4) {
                throw new NotAcceptableException(`please select 4 or below children count`);
            }
        }

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

        let markup = await this.getMarkupDetails(check_in_date, bookingDate, user, module);
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

        let dto = {
            "id": property_id,
            "check_in_date": check_in_date,
            "check_out_date": check_out_date,
            "adult_count": adult_count,
            "number_and_children_ages": number_and_children_ages
        };


        const response = verifyResult.data;

        if (response["available"] == false) {
            throw new NotAcceptableException(`The selected property is no longer available. Please search other properties.`)
        }

        let propertyResult = await this.unitTypeListAvailability(dto, user);

        const verifyAvailability = new HomeRentalRevalidate();

        let feesType: FeesType;
        let fees;
        verifyAvailability.property_name = propertyResult["property_name"];
        verifyAvailability.property_id = property_id;
        verifyAvailability.room_id = room_id;
        verifyAvailability.rate_plan_code = rate_plan_code;
        verifyAvailability.available_status = response["available"];
        verifyAvailability.booking_code = response["quoteHandle"];
        verifyAvailability.net_price = response["totalPrice"]["amountAfterTax"];
        verifyAvailability.check_in_date = check_in_date;
        verifyAvailability.check_out_date = check_out_date;
        verifyAvailability.selling_price = Generic.formatPriceDecimal(PriceMarkup.applyMarkup(verifyAvailability.net_price, markUpDetails));
        let instalmentDetails = Instalment.weeklyInstalment(verifyAvailability.selling_price, check_in_date, bookingDate, 0, 0, 0, 0, false, 0, true, []);

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

                    feesType.mandatory_fee_due_at_check_in.push(fees);
                }
            }
        } else {
            feesType = new FeesType();
            for (let i = 0; i < response["fees"].length; i++) {
                let fees = new Fees();
                if (response["fees"][i]["mandatoryInd"] == true) {
                    fees.message = response["fees"][i]["description"];
                    feesType.mandatory_fee_already_paid.push(fees);
                }
                if (response["fees"][i]["mandatoryInd"] == false) {
                    fees.message = response["fees"][i]["description"];
                    feesType.optional_fee.push(fees);
                }
            }
        }

        verifyAvailability.feesType = feesType;
        let roomDetails = propertyResult.rooms.find((data) => data.rate_plan_code == rate_plan_code);
        verifyAvailability.cancellation_policy = roomDetails.cancellation_policy;
        verifyAvailability.room_name = roomDetails.name;
        verifyAvailability.city = propertyResult["city"];
        verifyAvailability.country = propertyResult["country"];
        verifyAvailability.adult = adult_count;
        verifyAvailability.number_and_chidren_age = number_and_children_ages;
        return [verifyAvailability];

    }
}

// [{"number_and_chidren_age":[10,12,15],"property_name":"Splendid Apartment in Barcelona (4 guests)","property_id":42945378320383,"room_id":42945378189361,"rate_plan_code":"ThisReservationWillFailOnBooking","available_status":true,"booking_code":"270bab68e303e13892e6c918c84aad17b56ce652c1eda4d5925141b215a7ac4c","net_price":170.32,"selling_price":209.49,"start_price":41.9,"secondary_start_price":15.24,"secondary_selling_price":0,"instalment_details":{"instalment_available":true,"instalment_date":[{"instalment_date":"2020-12-30","instalment_amount":41.9},{"instalment_date":"2021-01-06","instalment_amount":15.24},{"instalment_date":"2021-01-13","instalment_amount":15.24},{"instalment_date":"2021-01-20","instalment_amount":15.24},{"instalment_date":"2021-01-27","instalment_amount":15.24},{"instalment_date":"2021-02-03","instalment_amount":15.24},{"instalment_date":"2021-02-10","instalment_amount":15.24},{"instalment_date":"2021-02-17","instalment_amount":15.24},{"instalment_date":"2021-02-24","instalment_amount":15.24},{"instalment_date":"2021-03-03","instalment_amount":15.24},{"instalment_date":"2021-03-10","instalment_amount":15.24},{"instalment_date":"2021-03-17","instalment_amount":15.235454545454502}],"percentage":20,"down_payment":[41.9,62.85,83.8]},"feesType":{"mandtory_fee_already_paid":[{"message":"Local tax (18+)"},{"message":"Laundry (bed linen and towels)"},{"message":"Final cleaning"}],"mandtory_fee_due_at_check_in":[],"optional_fee":[{"message":"Pet (max. 1 pet)"},{"message":"Laundry (initial supply of bed linen and towels)"},{"message":"Cot (up to 2 years)"}]},"cancellation_policy":{"is_refundable":true,"penalty_info":["209.49 cancellation fee 0 Days BeforeArrival","167.592 cancellation fee 1 Days BeforeArrival","104.745 cancellation fee 28 Days BeforeArrival","20.949 cancellation fee 42 Days BeforeArrival"]},"room_name":"Twin-bed apartment, ocean view","city":"Barcelona","country":"Spain","adult":2}]