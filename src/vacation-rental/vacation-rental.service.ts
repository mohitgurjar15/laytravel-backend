import { Injectable } from '@nestjs/common';
import { resolve } from 'path';
import { Strategy } from 'src/flight/strategy/strategy';
import { AvailabilityDto } from './dto/availability.dto';
import { SearchLocation } from './dto/search.dto';
import { Monaker } from './strategy/monaker';
import { MonakerStrategy } from './strategy/strategy';

@Injectable()
export class VacationRentalService {

    async searchLocation(searchLocation: SearchLocation) {
        const { search_name } = searchLocation;


    }

    async vacationRentalAvailability(availabilityDto: AvailabilityDto, headers) {

        const monaker = new MonakerStrategy(new Monaker({ headers }));
        const result = new Promise((resolve) => monaker.availabilityVacationRental(availabilityDto));

        return result;

    }
}
