import { Controller, UseGuards, Get, Param, Post, Body, HttpCode, Req, Res, Session } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FlightService } from './flight.service';
import { OneWaySearchFlightDto } from './dto/oneway-flight.dto';
import { MinCharPipe } from './pipes/min-char.pipes';
import { RouteIdsDto } from './dto/routeids.dto';
import { RoundtripSearchFlightDto } from './dto/roundtrip-flight.dto';
import { GetUser } from 'src/auth/get-user.dacorator';
import { User } from '@sentry/node';
import { BookFlightDto } from './dto/book-flight.dto';

@ApiTags('Flight')
@Controller('flight')
@ApiBearerAuth()
export class FlightController {

    constructor(
        private flightService: FlightService
    ) { }
    
    @Get('/search-airport/:name')
    @ApiOperation({ summary: "Search Airpot by airport name, airport code and city name" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async searchAirport(
        @Param('name', MinCharPipe) name:String
        ){
            return await this.flightService.searchAirport(name);
        }
        
        
    @Post('/search-oneway-flight')
    @ApiOperation({ summary: "Search One Way flight" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    @ApiHeader({
        name: 'currency',
        description: 'Enter currency code(ex. USD)',
        example : 'USD'
      })
    @ApiHeader({
    name: 'language',
    description: 'Enter language code(ex. en)',
    })
    async searchOneWayFlight(
       @Body() searchFlightDto:OneWaySearchFlightDto,
       @Req() req,
       @GetUser() user:User
    ){
        console.log("user",user)
        return await this.flightService.searchOneWayFlight(searchFlightDto,req.headers);

    }

    @Post('/search-roundtrip-flight')
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

    @Post('/baggage-details')
    @ApiOperation({ summary: "Flight baggage details" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @HttpCode(200)
    async baggageDetails(
       @Body() routeIdDto:RouteIdsDto
    ){
        //console.log(baggageDetailsDto)
        return await this.flightService.baggageDetails(routeIdDto);
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

    

    @Post('/air-revalidate')
    @ApiHeader({
        name: 'currency',
        description: 'Enter currency code(ex. USD)',
        example : 'USD'
      })
    @ApiHeader({
    name: 'language',
    description: 'Enter language code(ex. en)',
    })
    @ApiOperation({ summary: "AirRevalidate to get availability and updated price" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Flight is not available now' })
    @HttpCode(200)
    async airRevalidate(
       @Body() routeIdDto:RouteIdsDto,
       @Req() req
    ){
        return await this.flightService.airRevalidate(routeIdDto,req.headers);
    }

    @Post('/book')
    @ApiHeader({
        name: 'currency',
        description: 'Enter currency code(ex. USD)',
        example : 'USD'
      })
    @ApiHeader({
    name: 'language',
    description: 'Enter language code(ex. en)',
    })
    @ApiOperation({ summary: "AirRevalidate to get availability and updated price" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Flight is not available now' })
    @HttpCode(200)
    async bookFlight(
       @Body() bookFlightDto:BookFlightDto,
       @Req() req
    ){
        return await this.flightService.bookFlight(bookFlightDto,req.headers);
    }
}
