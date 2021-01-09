import { HttpService, InternalServerErrorException, BadRequestException } from "@nestjs/common";
import { throws } from "assert";
import Axios from "axios";
import { collect } from "collect.js";
import { catchError, map } from "rxjs/operators";
import { errorMessage } from "src/config/common.config";
import { AvailabilityDto } from "src/hotel/dto/availability-req.dto";
import { DetailReqDto } from "src/hotel/dto/detail-req.dto";
import { RoomsReqDto } from "src/hotel/dto/rooms-req.dto";
import { SearchReqDto } from "src/hotel/dto/search-req.dto";
import { Generic } from "src/hotel/helpers/generic.helper";
import { HotelInterface } from "../hotel.interface";
import { BookDto, BookDto as PPNBookDto } from "./dto/book.dto";
import { CommonHelper } from "./helpers/common.helper";
import { AutoComplete } from "./modules/auto-complete";
import { Availability } from "./modules/availability";
import { Book } from "./modules/book";
import { Detail } from "./modules/detail";
import { Rooms } from "./modules/rooms";
import { Search } from "./modules/search";

export class Priceline implements HotelInterface{

    private httpsService: HttpService;
    private data: any;
    constructor() {
        this.httpsService = new HttpService();
    }

    async autoComplete(term: string){
        
        let parameters = {
            string: term,
            get_airports:true,
            get_cities:true,
            get_regions:true,
            get_hotels:true,
            get_pois:true,
        };
        
        let url = CommonHelper.generateUrl('getAutoSuggestV2', parameters);

        let locations = await this.httpsService.get(url).pipe(
            map(res => new AutoComplete().processSearchLocationResult(res)),
            catchError(err => {
                throw new BadRequestException(err + " &&&term&&&" + errorMessage);
            })
        ).toPromise();

        return locations;
    }
    
    async search(searchReqDto: SearchReqDto) {
        
        let { latitude, longitude, check_in, check_out } = searchReqDto;

        let occupancies = collect(searchReqDto.occupancies);
        
        let rooms = occupancies.count();

        let adults = occupancies.sum('adults');
        
        let children = occupancies.flatMap((value) => value['children']).count();
        
        let parameters = {
            latitude,
            longitude,
            check_in,
            check_out,
            rooms,
            adults,
            children,
        }

        let url = CommonHelper.generateUrl('getExpress.Results', parameters);
        // return url;
        let res = await this.httpsService.get(url).pipe(
            map(res => new Search().processSearchResult(res, parameters)),
            catchError(err => {
                throw new BadRequestException(err +" &&&search&&&" + errorMessage);
            })
        ).toPromise();
        
        return res;

    }

    async detail(detailReqDto: DetailReqDto) {

        let parameters = {
            hotel_id : detailReqDto.hotel_id,
            photos : true,
            image_size: 'large',
            reviews: true
        };

        let url = CommonHelper.generateUrl('getHotelDetails', parameters);
        
        let res = await this.httpsService.get(url).pipe(
            map(res => new Detail().processDetailResult(res, parameters)),
            catchError(err => {
                throw new BadRequestException(err +" &&&detail&&&" + errorMessage);
            })
        ).toPromise();
        
        return res;
    }

    async rooms(roomsReqDto: RoomsReqDto) {

        let parameters = {
            ppn_bundle : roomsReqDto.bundle,
        };

        let url = CommonHelper.generateUrl('getExpress.MultiContract', parameters);
        
        let res = await this.httpsService.get(url).pipe(
            map(res => new Rooms().processRoomsResult(res, roomsReqDto)),
            catchError(err => {
                throw new BadRequestException(err +" &&&rooms&&&" + errorMessage);
            })
        ).toPromise();
        
        return res;
    }
    
    async availability(availabilityDto: AvailabilityDto) {
        
        let parameters = {
            ppn_bundle: availabilityDto.bundle
        };
    
        let url = CommonHelper.generateUrl('getExpress.Contract', parameters);
        
        let res = await this.httpsService.get(url).pipe(
            map(res => new Availability().processAvailabilityResult(res, availabilityDto)),
            catchError(err => {
                throw new BadRequestException(err +" &&&availability&&&" + errorMessage);
            })
        ).toPromise();
        
        return res;
        
    }

    async book(bookDto: BookDto) {
    
        let url = CommonHelper.generateUrl('getExpress.Book');
        
        let parameters = Generic.httpBuildQuery(bookDto);
        
        let res = await this.httpsService.post(url, parameters).pipe(
            map(res => new Book().processBookResult(res)),
            catchError(err => {
                throw new BadRequestException(err +" &&&book&&&" + errorMessage);
            })
        ).toPromise();

        return res;

    }
}