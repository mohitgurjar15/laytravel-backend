import { Locations } from "../dto/search-location/location.dto";
import { SearchReqDto } from "../dto/search/search-req.dto";
import { HotelInterface } from "./hotel.interface";

export class Hotel{
    private hotel: HotelInterface;

    constructor(hotel: HotelInterface) {
        this.hotel = hotel;
    }

    autoComplete(term: string): Locations {
        return this.hotel.autoComplete(term);
    }
    
    search(searchReqDto: SearchReqDto) {
        return this.hotel.search(searchReqDto);
    }
}