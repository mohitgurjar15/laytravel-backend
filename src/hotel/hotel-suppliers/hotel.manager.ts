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

           search(searchReqDto: SearchReqDto) {
               return this.hotel.search(searchReqDto);
           }

           detail(detailReqDto: DetailReqDto) {
               return this.hotel.detail(detailReqDto);
           }

           rooms(roomsReqDto: RoomsReqDto, user_id:string) {
               return this.hotel.rooms(roomsReqDto,user_id);
           }

           availability(availabilityDto: AvailabilityDto) {
               return this.hotel.availability(availabilityDto);
           }

           book(bookDto: BookDto, user_id: string) {
               return this.hotel.book(bookDto, user_id);
           }
       }