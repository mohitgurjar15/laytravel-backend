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
            max_results:100,
            order:'asc',
            sort: 'name'
        };

        let url = await CommonHelper.generateUrl(
            "getAutoSuggestV2",
            parameters
        );

        let locations = await this.httpsService
            .get(url)
            .pipe(
                map((res) =>
                    new AutoComplete().processSearchLocationResult(res,term)
                ),
                catchError((err) => {
                    throw new BadRequestException(
                        err + " &&&term&&&" + errorMessage
                    );
                })
            )
            .toPromise();

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
            children
        } = searchReqDto;

        let parameters = {
            check_in,
            check_out,
            rooms,
            adults,
            children,
            field_blacklist : 'hotel_description,neighborhood,hotel_zone,id_t,zone_rank,rate_tracking_id,rate_tracking_id,city,review_score_data,cancellation_details,cancel_policy_description,program_types,promo_data,rate_amenity_data,room_sq_footage',
            rate_limit : 1
        };
        let extra:any = {
            
        };

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

        let res = await this.httpsService
            .get(url)
            .pipe(
                map((res) => new Search().processSearchResult(res, parameters)),
                catchError((err) => {
                    //console.log("Error", err);
                    throw new BadRequestException(
                        err + " &&&search&&&" + errorMessage
                    );
                })
            )
            .toPromise();
        
            
        return res;
    }

    async detail(detailReqDto: DetailReqDto) {
        let parameters = {
            hotel_id: detailReqDto.hotel_id,
            photos: true,
            image_size: "large",
            reviews: true,
        };

        let url = await CommonHelper.generateUrl("getHotelDetails", parameters);

        let res = await this.httpsService
            .get(url)
            .pipe(
                map((res) => new Detail().processDetailResult(res, parameters)),
                catchError((err) => {
                    throw new BadRequestException(
                        err + " &&&detail&&&" + errorMessage
                    );
                })
            )
            .toPromise();

        return res;
    }

    async rooms(roomsReqDto: RoomsReqDto) {
        let parameters = {
            ppn_bundle: roomsReqDto.bundle,
        };

        let url = await CommonHelper.generateUrl(
            "getExpress.MultiContract",
            parameters
        );

        let res = await this.httpsService
            .get(url)
            .pipe(
                map((res) => new Rooms().processRoomsResult(res, roomsReqDto)),
                catchError((err) => {
                    throw new BadRequestException(
                        err + " &&&rooms&&&" + errorMessage
                    );
                })
            )
            .toPromise();

        return res;
    }

    async availability(availabilityDto: AvailabilityDto) {
        let parameters = {
            ppn_bundle: availabilityDto.room_ppn,
        };

        let url = await CommonHelper.generateUrl(
            "getExpress.Contract",
            parameters
        );
        console.log(url);
        
        // let res = await this.httpsService.get(url).pipe(
        //     map(res => new Availability().processAvailabilityResult(res, availabilityDto)),
        //     catchError(err => {
        //         throw new BadRequestException(err +" &&&availability&&&" + errorMessage);
        //     })
        // ).toPromise();
        try {
            let res = await HttpRequest.PricelineRequest(
                url,
                "get",
                "",
                "availiblity"
            );
            console.log("call 1");
            
            if (res) {
                const response = await Availability.processAvailabilityResult(
                    res,
                    availabilityDto
                );
               return  response
            }
        } catch (error) {
            throw new BadRequestException(
                error?.message + " &&&availability&&&" + error?.message
            );
        }
    }

    async book(bookDto: BookDto) {
        let url = await CommonHelper.generateUrl("getExpress.Book");

        let parameters = GenericHotel.httpBuildQuery(bookDto);

        let res = await this.httpsService
            .post(url, parameters)
            .pipe(
                map((res) => new Book().processBookResult(res)),
                catchError((err) => {
                    throw new BadRequestException(
                        err + " &&&book&&&" + errorMessage
                    );
                })
            )
            .toPromise();

        return res;
    }
}
