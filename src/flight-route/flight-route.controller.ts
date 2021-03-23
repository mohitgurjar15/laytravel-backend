import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FlightRouteService } from './flight-route.service';

@ApiTags("Flight Route")
@Controller("flight-route")
export class FlightRouteController {
    constructor(private flightRouteService: FlightRouteService) {}
}
