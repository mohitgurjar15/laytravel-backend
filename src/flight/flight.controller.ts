import { Controller, UseGuards, Get, Param, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FlightService } from './flight.service';
import { SearchFlightDto } from './dto/search-flight.dto';

@ApiTags('Flight')
@Controller('flight')
export class FlightController {

    constructor(
        private flightService: FlightService
    ) { }


    @Post('/search-flight')
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    async searchFlight(
       @Body() searchFlightDto:SearchFlightDto
    ){
        return await this.flightService.searchFlight(searchFlightDto);
    }
    
}
