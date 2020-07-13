import { Controller, UseGuards, Get, Param, Post, Body, HttpCode, UseInterceptors, CacheInterceptor, CacheKey } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FlightService } from './flight.service';
import { SearchFlightDto } from './dto/search-flight.dto';
import { MinCharPipe } from './pipes/min-char.pipes';
import { BaggageDetailsDto } from './dto/baggage.dto';


@ApiTags('Flight')
@Controller('flight')
export class FlightController {

    constructor(
        private flightService: FlightService
    ) { }
    
    @Get('/search-airport/:name')
    //@CacheKey('custom_key')
    @ApiOperation({ summary: "Search Airpot by airport name, airport code and city name" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    async searchAirport(
        @Param('name', MinCharPipe) name:String
        ){
            //console.log(custom_key)
            return await this.flightService.searchAirport(name);
        }
        
        
    @Post('/search-oneway-flight')
    @ApiOperation({ summary: "Search One Way flight" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @HttpCode(200)
    async searchFlight(
       @Body() searchFlightDto:SearchFlightDto
    ){
        return await this.flightService.searchFlight(searchFlightDto);
    }

    @Post('/baggage-details')
    @ApiOperation({ summary: "Flight baggage details" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @HttpCode(200)
    async baggageDetails(
       @Body() baggageDetailsDto:BaggageDetailsDto
    ){
        //return await this.flightService.searchFlight(searchFlightDto);
    }

    
}
