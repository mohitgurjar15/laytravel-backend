import { CACHE_MANAGER, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { HotelSearchLocationDto } from './dto/search-location/search-location.dto';
import { SearchReqDto } from './dto/search/search-req.dto';
import { Hotel } from './hotel-suppliers/hotel.manager';
import { Priceline } from './hotel-suppliers/priceline/priceline';
import { Cache } from 'cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { DetailReqDto } from './dto/detail/detail-req.dto';
import { RoomsReqDto } from './dto/rooms/rooms-req.dto';
import { collect } from 'collect.js';

@Injectable()
export class HotelService{
    
    private hotel: Hotel;
    
    private listing: any;

    constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {
        this.hotel = new Hotel(new Priceline());
    }

    autoComplete(searchLocationDto: HotelSearchLocationDto) {
        return this.hotel.autoComplete(searchLocationDto.term);
    }
    
    async search(searchReqDto: SearchReqDto) {
        
        let hotels = await this.hotel.search(searchReqDto);
        
        let token = uuidv4();

        searchReqDto['token'] = token;
        
        let toCache = {
            details: searchReqDto,
            hotels
        };
        
        await this.cacheManager.set(token, toCache, { ttl: 300 });

        let response = {
            data: toCache,
            message: hotels.length ? 'Result found' : 'No result Found'
        };
        
        return response;
    }

    async detail(detailReqDto: DetailReqDto) {
        
        return this.hotel.detail(detailReqDto);

    }

    async rooms(roomsReqDto: RoomsReqDto) {
        
        let cached = await this.cacheManager.get(roomsReqDto.token);
        
        if (!cached.hotels) {
            throw new InternalServerErrorException("No record found for Hotel ID: "+roomsReqDto.hotel_id);
        }
        
        let hotel = collect(cached.hotels).where('id', roomsReqDto.ppn_bundle).first();
        
        if (!hotel) {
            throw new InternalServerErrorException("No record found for Hotel ID: "+roomsReqDto.hotel_id);
        }

        roomsReqDto.ppn_bundle = hotel['bundle'];

        return this.hotel.rooms(roomsReqDto);

    }
}
