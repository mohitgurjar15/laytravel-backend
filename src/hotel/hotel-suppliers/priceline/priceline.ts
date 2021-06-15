import {
    HttpService,
    InternalServerErrorException,
    BadRequestException,
} from "@nestjs/common";
import { throws } from "assert";
import Axios from "axios";
import { collect } from "collect.js";
import { catchError, map } from "rxjs/operators";
import { errorMessage } from "src/config/common.config";
import { AvailabilityDto } from "src/hotel/dto/availability-req.dto";
import { DetailReqDto } from "src/hotel/dto/detail-req.dto";
import { RoomsReqDto } from "src/hotel/dto/rooms-req.dto";
import { SearchReqDto } from "src/hotel/dto/search-req.dto";
import { GenericHotel } from "src/hotel/helpers/generic.helper";
import { HotelInterface } from "../hotel.interface";
import { BookDto, BookDto as PPNBookDto } from "./dto/book.dto";
import { CommonHelper } from "./helpers/common.helper";
import { AutoComplete } from "./modules/auto-complete";
import { Availability } from "./modules/availability";
import { Book } from "./modules/book";
import { Detail } from "./modules/detail";
import { Rooms } from "./modules/rooms";
import { Search } from "./modules/search";
import { HttpRequest } from "src/utility/http.utility";
import { Activity } from "src/utility/activity.utility";

export class Priceline implements HotelInterface {
    private httpsService: HttpService;
    private data: any;
    constructor() {
        this.httpsService = new HttpService();
    }

    async autoComplete(term: string) {
        let parameters = {
            string: term,
            get_airports: false,
            get_cities: true,
            get_regions: false,
            get_hotels: false,
            get_pois: false,
            max_results: 100,
            order: "asc",
            sort: "name",
            spellcheck: false,
        };

        let url = await CommonHelper.generateUrl(
            "getAutoSuggestV2",
            parameters
        );

        let responce: any = {};

        let locations = await this.httpsService
            .get(url)
            .pipe(
                map((res) =>
                    new AutoComplete().processSearchLocationResult(res, term)
                ),
                catchError((err) => {
                    throw new BadRequestException(
                        err + " &&&term&&&" + errorMessage
                    );
                })
            )
            .toPromise();
        let fileName = "";
        let logData = {};
        logData["url"] = url;
        logData["method"] = "post";
        logData["requestBody"] = parameters;
        logData["responce"] = responce;
        //logData["generated_responce"] = res;
        fileName = `hotel-priceline-auto_complete-${new Date().getTime()}`;
        // if (user_id) {
        //     fileName += "_" + user_id;
        // }
        //Activity.createlogFile(fileName, logData, "hotel");
        return locations;
    }

    async search(searchReqDto: SearchReqDto) {
        let {
            latitude,
            longitude,
            check_in,
            check_out,
            hotel_id,
            rooms,
            adults,
            children,
            city_id,
        } = searchReqDto;

        let parameters = {
            check_in,
            check_out,
            rooms,
            adults,
            children,
            field_blacklist:
                "hotel_description,neighborhood,hotel_zone,id_t,zone_rank,rate_tracking_id,rate_tracking_id,city,review_score_data,cancellation_details,cancel_policy_description,program_types,promo_data,rate_amenity_data,room_sq_footage",
            rate_limit: 1,
        };
        if (city_id) {
            parameters["city_id"] = city_id;
        }
        let extra: any = {};

        if (hotel_id) {
            extra = {
                hotel_ids: hotel_id,
            };
        } else {
            extra = {
                latitude,
                longitude,
            };
        }

        parameters = {
            ...parameters,
            ...extra,
        };

        let url = await CommonHelper.generateUrl(
            "getExpress.Results",
            parameters
        );
        let responce: any = {};
        let res = await this.httpsService
            .get(url)
            .pipe(
                map((res) => {
                    responce = res?.data;
                    // console.log(responce);

                    return new Search().processSearchResult(res, parameters);
                }),
                catchError((err) => {
                    //console.log("Error", err);
                    throw new BadRequestException(
                        err + " &&&search&&&" + errorMessage
                    );
                })
            )
            .toPromise();

        let fileName = "";
        let logData = {};
        logData["url"] = url;
        logData["method"] = "post";
        logData["requestBody"] = parameters;
        logData["responce"] = responce;
        logData["generated_responce"] = res;
        fileName = `hotel-priceline-search-${new Date().getTime()}`;
        // if (user_id) {
        //     fileName += "_" + user_id;
        // }
        //Activity.createlogFile(fileName, logData, "hotel");

        return res;
    }

    async detail(detailReqDto: DetailReqDto) {
        let parameters = {
            hotel_id: detailReqDto.hotel_id,
            photos: true,
            image_size: "large",
            reviews: true,
        };

        let url = await CommonHelper.generateUrl(
            "getHotelDetails",
            parameters,
            detailReqDto.hotel_id
        );
        let responce: any = {};
        let res = await this.httpsService
            .get(url)
            .pipe(
                map((res) => {
                    responce = res?.data;
                    return new Detail().processDetailResult(res, parameters);
                }),
                catchError((err) => {
                    let fileName = "";
                    let logData = {};
                    logData["url"] = url;
                    logData["method"] = "post";
                    logData["requestBody"] = parameters;
                    logData["responce"] = err;
                    //logData["generated_responce"] = JSON.stringify(res);
                    fileName = `Failed-hotel-priceline-detail-${new Date().getTime()}`;
                    // if (user_id) {
                    //     fileName += "_" + user_id;
                    // }
                    Activity.createlogFile(fileName, logData, "hotel");
                    throw new BadRequestException(
                        err + " &&&detail&&&" + errorMessage
                    );
                })
            )
            .toPromise();
        console.log(responce);

        let fileName = "";
        let logData = {};
        logData["url"] = url;
        logData["method"] = "post";
        logData["requestBody"] = parameters;
        logData["responce"] = JSON.stringify(responce);
        logData["generated_responce"] = JSON.stringify(res);
        fileName = `hotel-priceline-detail-${new Date().getTime()}`;
        // if (user_id) {
        //     fileName += "_" + user_id;
        // }
        //Activity.createlogFile(fileName, logData, "hotel");

        return res;
    }

    async rooms(roomsReqDto: RoomsReqDto, user_id) {
        let parameters = {
            ppn_bundle: roomsReqDto.bundle,
            room_grouping: 1,
        };

        let url = await CommonHelper.generateUrl(
            "getExpress.MultiContract",
            parameters
        );
        let responce = {};
        let res = await this.httpsService
            .get(url)
            .pipe(
                map((res) => {
                    responce = res?.data;
                    return new Rooms().processRoomsResult(res, roomsReqDto);
                }),
                catchError((err) => {
                    let fileName = "";
                    let logData = {};
                    logData["url"] = url;
                    logData["method"] = "post";
                    logData["requestBody"] = parameters;
                    logData["responce"] = responce;
                    logData["err"] = err;
                    fileName = `Failed-hotel-priceline-rooms-${new Date().getTime()}`;
                    if (user_id) {
                        fileName += "_" + user_id;
                    }
                    Activity.createlogFile(fileName, logData, "hotel");

                    throw new BadRequestException(
                        err + " &&&rooms&&&" + errorMessage
                    );
                })
            )
            .toPromise();
        let fileName = "";
        let logData = {};
        logData["url"] = url;
        logData["method"] = "post";
        logData["requestBody"] = parameters;
        logData["responce"] = responce;
        logData["generated_responce"] = res;
        fileName = `hotel-priceline-room-${new Date().getTime()}`;
        if (user_id) {
            fileName += "_" + user_id;
        }
        Activity.createlogFile(fileName, logData, "hotel");
        return res;
    }

    async availability(availabilityDto: AvailabilityDto, user_id) {
        let parameters = {
            ppn_bundle: availabilityDto.room_ppn,
        };

        let url = await CommonHelper.generateUrl(
            "getExpress.Contract",
            parameters
        );
        // console.log(url);
        let responce = {};
        let fileName = "";
        let res:any = await this.httpsService
            .get(url)
            .pipe(
                map((res) => {
                    responce = res?.data;
                    //  console.log(res?.data);

                    return new Availability().processAvailabilityResult(
                        res,
                        availabilityDto
                    );
                }),
                catchError((err) => {
                    console.log(err);

                    
                    let logData = {};
                    logData["url"] = url;
                    logData["method"] = "post";
                    logData["requestBody"] = parameters;
                    logData["responce"] = responce;
                    logData["err"] = err;
                    fileName = `Failed-hotel-priceline-availiblity-${new Date().getTime()}`;
                    if (user_id) {
                        fileName += "_" + user_id;
                    }
                    Activity.createlogFile(fileName, logData, "hotel");
                    throw new BadRequestException(
                        err + " &&&availability&&&" + errorMessage
                    );
                })
            )

            .toPromise();
        
        let logData = {};
        logData["url"] = url;
        logData["method"] = "post";
        logData["requestBody"] = parameters;
        logData["responce"] = responce;
        logData["generated_responce"] = res;
        fileName = `hotel-priceline-availiblity-${new Date().getTime()}`;
        if (user_id) {
            fileName += "_" + user_id;
        }
        Activity.createlogFile(fileName, logData, "hotel");
        res['fileName'] = fileName
        return res;
    }

    async book(bookDto: BookDto, user_id) {
        let url = await CommonHelper.generateUrl("getExpress.Book");

        let parameters = GenericHotel.httpBuildQuery(bookDto);
        let responce = {};
        let fileName = "";
        let res = await this.httpsService
            .post(url, parameters)
            .pipe(
                map((res) => {
                    responce = res?.data;
                    return new Book().processBookResult(res);
                }),
                catchError((err) => {
                    
                    let logData = {};
                    logData["url"] = url;
                    logData["method"] = "post";
                    logData["requestBody"] = parameters;
                    logData["err"] = err;
                    logData["responce"] = responce;
                    fileName = `Failed-hotel-priceline-book-${new Date().getTime()}`;
                    if (user_id) {
                        fileName += user_id;
                    }
                    Activity.createlogFile(fileName, logData, "hotel");
                    throw new BadRequestException(
                        err + " &&&book&&&" + errorMessage
                    );
                })
            )
            .toPromise();

        
        let logData = {};
        logData["url"] = url;
        logData["method"] = "post";
        logData["requestBody"] = parameters;
        logData["responce"] = responce;
        logData["generated_responce"] = res;
        fileName = `hotel-priceline-book-${new Date().getTime()}`;
        if (user_id) {
            fileName += user_id;
        }
        Activity.createlogFile(fileName, logData, "hotel");

        // let op = await HttpRequest.PricelineRequest(
        //     url,
        //     "get",
        //     parameters,
        //     "availiblity"
        // );
        res['fileName'] = fileName
        return res;
    }
}
