import { Controller, UseGuards, Get, Param, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FlightService } from './flight.service';
import { OneWaySearchFlightDto } from './dto/oneway-flight.dto';
import { MinCharPipe } from './pipes/min-char.pipes';
import { RouteIdsDto } from './dto/routeids.dto';
import { RoundtripSearchFlightDto } from './dto/roundtrip-flight.dto';


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
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
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
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async searchFlight(
       @Body() searchFlightDto:OneWaySearchFlightDto
    ){
        return await this.flightService.searchOneWayFlight(searchFlightDto);
    }

    @Post('/baggage-details')
    @ApiOperation({ summary: "Flight baggage details" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @HttpCode(200)
    async baggageDetails(
       @Body() routeIdsDto:RouteIdsDto
    ){
        //console.log(baggageDetailsDto)
        return await this.flightService.baggageDetails(routeIdsDto);
    }

    @Post('/cancellation-policy')
    @ApiOperation({ summary: "Flight cancellation policy" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @HttpCode(200)
    async cancellationPolicy(
       @Body() routeIdsDto:RouteIdsDto
    ){
        return await this.flightService.cancellationPolicy(routeIdsDto);
    }

    //@Post('/search-roundtrip-flight')
    @ApiOperation({ summary: "Round trip flight search" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async searchRoundTrip(
       @Body() searchFlightDto:RoundtripSearchFlightDto
    ){
        return await this.flightService.searchRoundTripFlight(searchFlightDto);
    }
}
