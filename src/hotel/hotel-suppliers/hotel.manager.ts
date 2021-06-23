import { AvailabilityDto } from "../dto/availability-req.dto";
import { DetailReqDto } from "../dto/detail-req.dto";
import { RoomsReqDto } from "../dto/rooms-req.dto";
import { SearchReqDto } from "../dto/search-req.dto";
import { HotelInterface } from "./hotel.interface";
import { BookDto } from "./priceline/dto/book.dto";

export class Hotel {
    private hotel: HotelInterface;

    constructor(hotel: HotelInterface) {
        this.hotel = hotel;
    }

    autoComplete(term: string) {
        return this.hotel.autoComplete(term);
    }

    search(searchReqDto: SearchReqDto, refferal) {
        return this.hotel.search(searchReqDto, refferal);
    }

    detail(detailReqDto: DetailReqDto) {
        return this.hotel.detail(detailReqDto);
    }

    rooms(roomsReqDto: RoomsReqDto, user_id: string, referralId) {
        return this.hotel.rooms(roomsReqDto, user_id, referralId);
    }

    availability(availabilityDto: AvailabilityDto, user_id: string, referralId: string) {
        return this.hotel.availability(availabilityDto, user_id, referralId);
    }

    book(bookDto: BookDto, user_id: string) {
        return this.hotel.book(bookDto, user_id);
    }
}
