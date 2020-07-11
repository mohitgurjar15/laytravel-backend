import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Strategy } from './strategy/strategy';
import { Static } from './strategy/static';
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

            if (typeof error.response!=='undefined' && error.response.statusCode == 404) {
                throw new NotFoundException(`No Airport Found.`)
            }
            throw new InternalServerErrorException(error.message)
        }
    }

    async searchFlight(searchFlightDto:SearchFlightDto){

        const local = new Strategy(new Static(this.flightRepository));
        const result = new Promise((resolve) => resolve(local.oneWaySearch(searchFlightDto)));
        return result;
    }
}
