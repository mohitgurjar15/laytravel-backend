import { Injectable } from '@nestjs/common';
import { Locations } from './dto/search-location/location.dto';
import { HotelSearchLocationDto } from './dto/search-location/search-location.dto';
import { Agoda } from './hotel-suppliers/agoda';
import { Hotel } from './hotel-suppliers/hotel.manager';
import { Priceline } from './hotel-suppliers/priceline/priceline';

@Injectable()
export class HotelService{
    private hotel: Hotel;

    constructor() {
        this.hotel = new Hotel(new Priceline());
    }

    autoComplete(searchLocationDto: HotelSearchLocationDto): Locations {
        return this.hotel.autoComplete(searchLocationDto.term);
    }
}
