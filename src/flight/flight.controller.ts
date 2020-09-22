import { Controller, UseGuards, Get, Param, Post, Body, HttpCode, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FlightService } from './flight.service';
import { OneWaySearchFlightDto } from './dto/oneway-flight.dto';
import { MinCharPipe } from './pipes/min-char.pipes';
import { RouteIdsDto } from './dto/routeids.dto';
import { RoundtripSearchFlightDto } from './dto/roundtrip-flight.dto';
import { LogInUser } from 'src/auth/get-user.dacorator';
import { BookFlightDto } from './dto/book-flight.dto';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles } from 'src/guards/role.decorator';
import { Role } from 'src/enum/role.enum';

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
        //return await this.flightService.mapChildParentAirport(name);
    }
        
        
    @Post('/search-oneway-flight')
    @ApiBearerAuth()
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
       @LogInUser() user
    ){
        return await this.flightService.searchOneWayFlight(searchFlightDto,req.headers,user);
    }

    @Post('/search-roundtrip-flight')
    @ApiOperation({ summary: "Round trip flight search" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @ApiHeader({
        name: 'currency',
        description: 'Enter currency code(ex. USD)',
        example : 'USD'
      })
    @ApiHeader({
        name: 'language',
        description: 'Enter language code(ex. en)',
    })
    @HttpCode(200)
    async searchRoundTrip(
       @Body() searchFlightDto:RoundtripSearchFlightDto,
       @Req() req,
       @LogInUser() user,
    ){
        return await this.flightService.searchRoundTripFlight(searchFlightDto,req.headers,user);
    }

    @Post('/baggage-details')
    @ApiOperation({ summary: "Flight baggage details" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @HttpCode(200)
    async baggageDetails(
       @Body() routeIdDto:RouteIdsDto,
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
       @Req() req,
       @LogInUser() user,
    ){
        return await this.flightService.airRevalidate(routeIdDto,req.headers,user);
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
    @ApiOperation({ summary: "Book Flight" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Flight is not available now' })
    @HttpCode(200)
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.SUPER_ADMIN,Role.ADMIN,Role.PAID_USER,Role.FREE_USER,Role.GUEST_USER)
    async bookFlight(
       @Body() bookFlightDto:BookFlightDto,
       @Req() req,
       @LogInUser() user
    ){
        console.log(bookFlightDto)
        return await this.flightService.bookFlight(bookFlightDto,req.headers,user);
    }

    @Get('/ticket/:id')
    @ApiOperation({ summary: "Ticket flight booking" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async ticketFlight(
    @Param('id') id:String
    ){
        return await this.flightService.ticketFlight(id);
        //return await this.flightService.mapChildParentAirport(name);
    }
}
