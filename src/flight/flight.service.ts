import { Injectable } from '@nestjs/common';
import { Search } from './search/search';
import { Static } from './search/static';
import { SearchFlightDto } from './dto/search-flight.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FlightRepository } from './flight.repository';

@Injectable()
export class FlightService {

    constructor(
        @InjectRepository(FlightRepository)
        private flightRepository:FlightRepository
    ){}

    async searchFlight(searchFlightDto:SearchFlightDto){

        const local = new Search(new Static(this.flightRepository));
        const promise1 = new Promise((resolve) => resolve(local.oneWaySearch(searchFlightDto)));
    }
}
