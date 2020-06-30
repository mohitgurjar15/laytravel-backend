import { Controller, UseGuards, Get, Param, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FlightService } from './flight.service';
import { SearchFlightDto } from './dto/search-flight.dto';
import { MinCharPipe } from './pipes/min-char.pipes';
import { Http } from '@sentry/node/dist/integrations';

@ApiTags('Flight')
@Controller('flight')
export class FlightController {

    constructor(
        private flightService: FlightService
    ) { }
    
    @Get('/search-airport/:name')
    @ApiOperation({ summary: "Search Airpot by airport name, airport code and city name" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    async searchAirport(
       @Param('name', MinCharPipe) name:String
    ){
        return await this.flightService.searchAirport(name);
    }


    @Post('/search-flight')
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @HttpCode(200)
    async searchFlight(
       @Body() searchFlightDto:SearchFlightDto
    ){
        return await this.flightService.searchFlight(searchFlightDto);
    }
    
}
