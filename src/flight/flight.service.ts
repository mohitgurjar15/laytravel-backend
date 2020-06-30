import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Search } from './search/search';
import { Static } from './search/static';
import { SearchFlightDto } from './dto/search-flight.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FlightRepository } from './flight.repository';
import { AirportRepository } from './airport.repository';
import { errorMessage } from 'src/config/common.config';
import { SeatAllocationRepository } from './seat-allocation.repository';

@Injectable()
export class FlightService {

    constructor(
        @InjectRepository(FlightRepository)
        private flightRepository:FlightRepository,

        @InjectRepository(AirportRepository)
        private airportRepository:AirportRepository,

        @InjectRepository(SeatAllocationRepository)
        private seatAllocationRepository:SeatAllocationRepository
    ){}
    
    async searchAirport(name:String){

        try{
            let result = await this.airportRepository.find({
                where : `("code" ILIKE '%${name}%' or "name" ILIKE '%${name}%' or "city" ILIKE '%${name}%' or "country" ILIKE '%${name}%') and status=true and is_deleted=false`
            })

            if(!result.length)
                throw new NotFoundException(`No Airport Found.&&&name`)
            
            return result;
        }
        catch(error){

            if (error.response.statusCode == 404) {
                throw new NotFoundException(`No Airport Found.`)
            }
            throw new InternalServerErrorException(error.message)
        }
    }

    async searchFlight(searchFlightDto:SearchFlightDto){

        const local = new Search(new Static(this.flightRepository,this.seatAllocationRepository));
        const result = new Promise((resolve) => resolve(local.oneWaySearch(searchFlightDto)));
        return result;
    }
}
