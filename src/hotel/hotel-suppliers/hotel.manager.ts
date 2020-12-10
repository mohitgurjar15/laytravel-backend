import { DetailReqDto } from "../dto/detail/detail-req.dto";
import { RoomsReqDto } from "../dto/rooms/rooms-req.dto";
import { Location } from "../dto/search-location/location.dto";
import { SearchReqDto } from "../dto/search/search-req.dto";
import { HotelInterface } from "./hotel.interface";

export class Hotel{
    
    private hotel: HotelInterface;

    constructor(hotel: HotelInterface) {
        this.hotel = hotel;
    }

    autoComplete(term: string) {
        return this.hotel.autoComplete(term);
    }
    
    search(searchReqDto: SearchReqDto) {
        return this.hotel.search(searchReqDto);
    }

    detail(detailReqDto: DetailReqDto) {
        return this.hotel.detail(detailReqDto);
    }

    rooms(roomsReqDto: RoomsReqDto) {
        return this.hotel.rooms(roomsReqDto);
    }
}