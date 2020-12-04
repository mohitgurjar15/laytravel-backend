import { HttpService, InternalServerErrorException } from "@nestjs/common";
import { collect } from "collect.js";
import { map } from "rxjs/operators";
import { SearchReqDto } from "src/hotel/dto/search/search-req.dto";
import { HotelInterface } from "../hotel.interface";
import { ApiHelper } from "./helpers/api.helper";
import { AutoComplete } from "./modules/auto-complete";
import { Search } from "./modules/search";

export class Priceline implements HotelInterface{

    private httpsService: HttpService;
    
    constructor() {
        this.httpsService = new HttpService();
    }

    autoComplete(term: string) {
        
        let parameters = {
            string: term,
            get_airports:true,
            get_cities:true,
            get_regions:true,
            get_hotels:true,
            get_pois:true,
        };
        
        let url = ApiHelper.generateUrl('getAutoSuggestV2', parameters);

        return this.httpsService.get(url).pipe(map(res => new AutoComplete().processSearchLocationResults(res)));
    }
    
    search(searchReqDto: SearchReqDto) {
        
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

        let url = ApiHelper.generateUrl('getExpress.Results', parameters);
        
        return this.httpsService.get(url).pipe(map(res => new Search().processSearchResults(res, parameters)));
    }
}