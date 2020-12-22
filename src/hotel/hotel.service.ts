import { CACHE_MANAGER, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { HotelSearchLocationDto } from './dto/search-location.dto';
import { SearchReqDto } from './dto/search-req.dto';
import { Hotel } from './hotel-suppliers/hotel.manager';
import { Priceline } from './hotel-suppliers/priceline/priceline';
import { Cache } from 'cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { DetailReqDto } from './dto/detail-req.dto';
import { RoomsReqDto } from './dto/rooms-req.dto';
import { collect } from 'collect.js';
import { FilterHelper } from './helpers/filter.helper';
import { FilterReqDto } from './dto/filter-req.dto';
import { RateHelper } from './helpers/rate.helper';
import { AvailabilityDto } from './dto/availability-req.dto';
import { Generic } from './helpers/generic.helper';
import { BookDto } from './dto/book-req.dto';

@Injectable()
export class HotelService{
    
    private hotel: Hotel;

    private ttl: number = 3000;
    
    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private genericHelper: Generic,
        private rateHelper: RateHelper,
        // private userService: UserService
    ) {
        this.hotel = new Hotel(new Priceline());
    }

    async autoComplete(searchLocationDto: HotelSearchLocationDto) {
        
        let locations = await this.hotel.autoComplete(searchLocationDto.term);
        
        // locations = plainToClass(Location, locations, );
        
        return {
            data: locations,
            message: locations.length ? 'Result found' : 'No result Found'
        };
    }
    
    async search(searchReqDto: SearchReqDto) {
        
        /* This should return pure hotel response (Directly from supplier's and as per our decided structure) */
        let hotels = await this.hotel.search(searchReqDto);
        // return hotels;
        
        /* Add any type of Business logic for hotel object's */
        hotels = this.rateHelper.generateInstalments(hotels, searchReqDto.check_in);

        let token = uuidv4();

        searchReqDto['token'] = token;
        searchReqDto['total'] = hotels.count();

        let toCache = {
            details: searchReqDto,
            hotels
        };

        if (searchReqDto.filter) {
            
            let filterObjects = await FilterHelper.generateFilterObjects(toCache);

            toCache['filter_objects'] = filterObjects;

        }
        
        await this.cacheManager.set(token, toCache, { ttl: this.ttl });

        let response = {
            data: toCache,
            message: searchReqDto['total'] ? 'Result found' : 'No result Found'
        };
        
        return response;
    }

    async detail(detailReqDto: DetailReqDto) {
        
        let cached = await this.cacheManager.get(detailReqDto.token);

        let detail = await this.hotel.detail(detailReqDto);
        
        let details = cached.details;

        return {
            data: {
                hotel: detail,
                details
            },
            message: "Detail found for " + detailReqDto.hotel_id
        };

    }

    async rooms(roomsReqDto: RoomsReqDto) {

        let cached = await this.cacheManager.get(roomsReqDto.token);
        
        if (!cached.hotels) {
            throw new InternalServerErrorException("No record found for Hotel ID: "+roomsReqDto.hotel_id);
        }
        
        let hotel = collect(cached.hotels).where('id', roomsReqDto.hotel_id).first();
        
        if (!hotel) {
            throw new InternalServerErrorException("No record found for Hotel ID: "+roomsReqDto.hotel_id);
        }

        let details = cached.details;

        roomsReqDto.bundle = hotel['bundle'];
        roomsReqDto.rooms = details.occupancies.length;

        let rooms = await this.hotel.rooms(roomsReqDto);
        // return rooms;
        
        /* Add any type of Business logic for hotel object's */
        rooms = this.rateHelper.generateInstalments(rooms, details.check_in);

        if (this.genericHelper.isset(cached['rooms'])) {
            rooms = collect(cached['rooms']).union(rooms.values().toArray());
        }

        cached['rooms'] = rooms;

        await this.cacheManager.set(roomsReqDto.token, cached, { ttl: this.ttl });

        let response = {
            data: rooms,
            message: rooms.count() ? 'Rooms found' : 'No Room Found'
        };

        return response;

    }

    async filterObjects(filterReqDto: FilterReqDto) {
        
        let cached = await this.cacheManager.get(filterReqDto.token);

        let filterObjects = await FilterHelper.generateFilterObjects(cached);

        cached['filter_objects'] = filterObjects;

        await this.cacheManager.set(filterReqDto.token, cached, { ttl: this.ttl });

        return {
            data: filterObjects,
            message: "Filter object found"
        }
    }

    async availability(availabilityDto: AvailabilityDto) {

        let cached = await this.cacheManager.get(availabilityDto.token);

        if (!cached.rooms) {
            throw new InternalServerErrorException("No record found for Room ID: "+availabilityDto.room_id);
        }
        
        let room = collect(cached.rooms).where('room_id', availabilityDto.room_id).first();
        
        if (!room) {
            throw new InternalServerErrorException("No record found for Room ID: "+availabilityDto.room_id);
        }

        let details = cached.details;
        
        availabilityDto.bundle = room['bundle'];
        availabilityDto.rooms = details.occupancies.length;

        let availability = await this.hotel.availability(availabilityDto);
        // return availability;

        /* Add any type of Business logic for Room object's */
        availability = this.rateHelper.generateInstalments(availability, details.check_in);

        availability = availability.map((item) => {

            item['price_change'] = (item.selling.total != room['selling']['total']);

            return item;
        });


        let response = {
            data: availability,
            message: availability.count() ? 'Room\'s are available' : 'Room\'s are not available'
        };

        return response;

    }

    async book(bookDto: BookDto) {
        // return await this.userService.getUserData(userId,siteUrl);
    }
}
