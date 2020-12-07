import { HttpService, InternalServerErrorException } from "@nestjs/common";
import { collect } from "collect.js";
import { map } from "rxjs/operators";
import { DetailReqDto } from "src/hotel/dto/detail/detail-req.dto";
import { RoomsReqDto } from "src/hotel/dto/rooms/rooms-req.dto";
import { SearchReqDto } from "src/hotel/dto/search/search-req.dto";
import { HotelInterface } from "../hotel.interface";
import { CommonHelper } from "./helpers/common.helper";
import { AutoComplete } from "./modules/auto-complete";
import { Detail } from "./modules/detail";
import { Rooms } from "./modules/rooms";
import { Search } from "./modules/search";

export class Priceline implements HotelInterface{

    private httpsService: HttpService;
    private data: any;
    constructor() {
        this.httpsService = new HttpService();
    }

    autoComplete(term: string){
        
        let parameters = {
            string: term,
            get_airports:true,
            get_cities:true,
            get_regions:true,
            get_hotels:true,
            get_pois:true,
        };
        
        let url = CommonHelper.generateUrl('getAutoSuggestV2', parameters);

        return this.httpsService.get(url).pipe(map(res => new AutoComplete().processSearchLocationResult(res)));

        // console.log(res);
        // return Object.assign(new Location(), []);
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
        
        let res = await this.httpsService.get(url).pipe(map(res => new Search().processSearchResult(res, parameters))).toPromise();
        
        return res;

    }

    async detail(detailReqDto: DetailReqDto) {

        let parameters = {
            hotel_id : detailReqDto.hotel_id,
            photos : true,
            image_size : 'large',
        };

        let url = CommonHelper.generateUrl('getHotelDetails', parameters);
        
        let res = await this.httpsService.get(url).pipe(map(res => new Detail().processDetailResult(res, parameters))).toPromise();
        
        return res;
    }

    async rooms(roomsReqDto: RoomsReqDto) {

        let parameters = {
            ppn_bundle : roomsReqDto.ppn_bundle,
        };

        let url = CommonHelper.generateUrl('getExpress.MultiContract', parameters);
        
        let res = await this.httpsService.get(url).pipe(map(res => new Rooms().processRoomsResult(res, parameters))).toPromise();
        
        return res;
    }
}