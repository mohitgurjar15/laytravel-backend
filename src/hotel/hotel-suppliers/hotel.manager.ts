import { Locations } from "../dto/search-location/location.dto";
import { HotelInterface } from "./hotel.interface";

export class Hotel{
    private hotel: HotelInterface;

    constructor(hotel: HotelInterface) {
        this.hotel = hotel;
    }

    autoComplete(term: string): Locations {
        return this.hotel.autoComplete(term);
    }
}