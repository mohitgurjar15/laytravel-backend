import { AvailabilityDto } from "../dto/availability.dto";
import { StrategyVacationRental } from "./strategy.interface";

export class Monaker implements StrategyVacationRental {

    private headers;
    constructor(
        headers
    ) {
        this.headers = headers;
    }

    vacationRentalAvaiability(avaiabilityDto: AvailabilityDto) {
        const { id, type, checkInDate, checkOutDate, adultCount } = avaiabilityDto;
    }

}