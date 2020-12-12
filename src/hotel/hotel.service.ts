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
import { FilterHelper } from './helpers/filter.helper';
import { FilterReqDto } from './dto/filter/filter-req.dto';
import { RateHelper } from './helpers/rate.helper';

@Injectable()
export class HotelService{
    
    private hotel: Hotel;

    constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {
        this.hotel = new Hotel(new Priceline());
    }

    async autoComplete(searchLocationDto: HotelSearchLocationDto) {
        
        let locations = await this.hotel.autoComplete(searchLocationDto.term);
        
        locations = JSON.parse(JSON.stringify(locations).replace(/\:null/gi, "\:\"\""));
        
        return {
            data: locations,
            message: locations.length ? 'Result found' : 'No result Found'
        };
    }
    
    async search(searchReqDto: SearchReqDto) {
        
        /* This should return pure hotel response (Directly from supplier's and as per our decided structure) */
        let hotels = await this.hotel.search(searchReqDto);
        
        /* Add any type of Business logic for hotel object's */
        hotels = collect(hotels).map((item: any) => {

            let instalment = RateHelper.getInstalmentBreakup(item.selling.total, searchReqDto.check_in);

            item.instalment_details = instalment.detail;
            item.start_price = instalment.start_price;
            item.secondary_start_price = instalment.secondary_start_price;

            return item;

        });

        let token = uuidv4();

        searchReqDto['token'] = token;
        searchReqDto['total'] = hotels.count();

        let toCache = {
            details: searchReqDto,
            hotels
        };
        
        await this.cacheManager.set(token, toCache, { ttl: 300 });

        if (searchReqDto.filter) {
            
            let filterObjects = await FilterHelper.generateFilterObjects(toCache);

            toCache['filter_objects'] = filterObjects;

            await this.cacheManager.set(token, toCache, { ttl: 300 });

        }

        let response = {
            data: toCache,
            message: searchReqDto['total'] ? 'Result found' : 'No result Found'
        };
        
        return response;
    }

    async detail(detailReqDto: DetailReqDto) {
        
        let detail = await this.hotel.detail(detailReqDto);

        return {
            data: detail,
            message: "Detail found for " + detailReqDto.hotel_id
        };

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

    async filterObjects(filterReqDto: FilterReqDto) {
        
        let cached = await this.cacheManager.get(filterReqDto.token);

        let filterObjects = await FilterHelper.generateFilterObjects(cached);

        cached['filter_objects'] = filterObjects;

        await this.cacheManager.set(filterReqDto.token, cached, { ttl: 300 });

        return {
            data: filterObjects,
            message: "Filter object found"
        }
    }
}
