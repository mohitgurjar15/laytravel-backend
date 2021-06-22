import {
  Controller,
  UseGuards,
  Get,
  Param,
  Post,
  Body,
  HttpCode,
  Req,
  BadRequestException,
  Put,
  Delete,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
  ApiHeader,
} from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { FlightService } from "./flight.service";
import { OneWaySearchFlightDto } from "./dto/oneway-flight.dto";
import { MinCharPipe } from "./pipes/min-char.pipes";
import { RouteIdsDto } from "./dto/routeids.dto";
import { RoundtripSearchFlightDto } from "./dto/roundtrip-flight.dto";
import { GetUser, LogInUser } from "src/auth/get-user.dacorator";
import { BookFlightDto } from "./dto/book-flight.dto";
import { RolesGuard } from "src/guards/role.guard";
import { Roles } from "src/guards/role.decorator";
import { Role } from "src/enum/role.enum";
import { PreductBookingDateDto } from "./dto/preduct-booking-date.dto";
import { FullCalenderRateDto } from "./dto/full-calender-date-rate.dto";
import { NetRateDto } from "./dto/net-rate.dto";
import * as moment from "moment";
import { ManullyBookingDto } from "./dto/manully-update-flight.dto";
import { User } from "src/entity/user.entity";
import { query } from "express";
import { SearchRouteDto } from "./dto/search-flight-route.dto";
import { UserIpAddress } from "src/decorator/ip-address.decorator";
import { GetReferralId } from "src/decorator/referral.decorator";

@ApiTags("Flight")
@Controller("flight")
@ApiHeader({
    name: "referral_id",
    description: "landing page id",
    example: ""
      
  })
@ApiBearerAuth()
export class FlightController {
  constructor(private flightService: FlightService) {}

  @Get("/search-airport/:name")
  @ApiOperation({
    summary: "Search Airpot by airport name, airport code and city name",
  })
  @ApiResponse({ status: 200, description: "Api success" })
  @ApiResponse({ status: 422, description: "Bad Request or API error message" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 500, description: "Internal server error!" })
  async searchAirport(@Param("name", MinCharPipe) name: String) {
    return await this.flightService.searchAirport(name, "web");
    //return await this.flightService.mapChildParentAirport(name);
  }

  @Get("/mobile/search-airport/:name")
  @ApiOperation({
    summary: "Search Airpot by airport name, airport code and city name",
  })
  @ApiResponse({ status: 200, description: "Api success" })
  @ApiResponse({ status: 422, description: "Bad Request or API error message" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 500, description: "Internal server error!" })
  async searchMobileAirport(@Param("name", MinCharPipe) name: String) {
    return await this.flightService.searchAirport(name, "mobile");
    //return await this.flightService.mapChildParentAirport(name);
  }

  @Post("/search-oneway-flight")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Search One Way flight" })
  @ApiResponse({ status: 200, description: "Api success" })
  @ApiResponse({ status: 422, description: "Bad Request or API error message" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 500, description: "Internal server error!" })
  @HttpCode(200)
  @ApiHeader({
    name: "currency",
    description: "Enter currency code(ex. USD)",
    example: "USD",
  })
  @ApiHeader({
    name: "language",
    description: "Enter language code(ex. en)",
  })
  async searchOneWayFlight(
    @Body() searchFlightDto: OneWaySearchFlightDto,
    @Req() req,
    @LogInUser() user,
    @UserIpAddress() userIp : string,
    @GetReferralId() referralId: string
  ) {
    if (
      moment(searchFlightDto.departure_date).isBefore(
        moment().format("YYYY-MM-DD")
      )
    )
      throw new BadRequestException(
        `Please enter departure date today or future date.&&&departure_date`
      );

    if (
      moment(searchFlightDto.departure_date).isAfter(
        moment()
          .add(365, "days")
          .format("YYYY-MM-DD")
      )
    )
      throw new BadRequestException(
        `Please enter departure date less then year.&&&departure_date`
      );

    return await this.flightService.searchOneWayFlight(
      searchFlightDto,
      req.headers,
      user,
      userIp,
      referralId
    );
  }

  @Post("/search-roundtrip-flight")
  @ApiOperation({ summary: "Round trip flight search" })
  @ApiResponse({ status: 200, description: "Api success" })
  @ApiResponse({ status: 422, description: "Bad Request or API error message" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 500, description: "Internal server error!" })
  @ApiHeader({
    name: "currency",
    description: "Enter currency code(ex. USD)",
    example: "USD",
  })
  @ApiHeader({
    name: "language",
    description: "Enter language code(ex. en)",
  })
  @HttpCode(200)
  async searchRoundTrip(
    @Body() searchFlightDto: RoundtripSearchFlightDto,
    @Req() req,
    @LogInUser() user,
    @UserIpAddress() userIp : string,
    @GetReferralId() referralId: string
  ) {
    if (
      moment(searchFlightDto.departure_date).isBefore(
        moment().format("YYYY-MM-DD")
      )
    )
      throw new BadRequestException(
        `Please enter departure date today or future date.&&&departure_date`
      );

    if (
      moment(searchFlightDto.departure_date).isAfter(
        moment()
          .add(365, "days")
          .format("YYYY-MM-DD")
      )
    )
      throw new BadRequestException(
        `Please enter departure date less then year.&&&departure_date`
      );
    return await this.flightService.searchRoundTripFlight(
      searchFlightDto,
      req.headers,
      user,
      userIp,
      referralId
    );
  }

  @Post("/baggage-details")
  @ApiOperation({ summary: "Flight baggage details" })
  @ApiResponse({ status: 200, description: "Api success" })
  @ApiResponse({ status: 422, description: "Bad Request or API error message" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @HttpCode(200)
  async baggageDetails(@Body() routeIdDto: RouteIdsDto) {
    //console.log(baggageDetailsDto)
    return await this.flightService.baggageDetails(routeIdDto);
  }

  @Post("/cancellation-policy")
  @ApiOperation({ summary: "Flight cancellation policy" })
  @ApiResponse({ status: 200, description: "Api success" })
  @ApiResponse({ status: 422, description: "Bad Request or API error message" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @HttpCode(200)
  async cancellationPolicy(@Body() routeIdsDto: RouteIdsDto) {
    return await this.flightService.cancellationPolicy(routeIdsDto);
  }

  @Post("/air-revalidate")
  @ApiHeader({
    name: "currency",
    description: "Enter currency code(ex. USD)",
    example: "USD",
  })
  @ApiHeader({
    name: "language",
    description: "Enter language code(ex. en)",
  })
  @ApiOperation({
    summary: "AirRevalidate to get availability and updated price",
  })
  @ApiResponse({ status: 200, description: "Api success" })
  @ApiResponse({ status: 422, description: "Bad Request or API error message" })
  @ApiResponse({ status: 404, description: "Flight is not available now" })
  @HttpCode(200)
  async airRevalidate(
    @Body() routeIdDto: RouteIdsDto,
    @Req() req,
    @LogInUser() user,
    @GetReferralId() referralId: string
  ) {
    return await this.flightService.airRevalidate(
      routeIdDto,
      req.headers,
      user,
      referralId
    );
  }

  @Post("/book")
  @ApiHeader({
    name: "currency",
    description: "Enter currency code(ex. USD)",
    example: "USD",
  })
  @ApiHeader({
    name: "language",
    description: "Enter language code(ex. en)",
  })
  @ApiOperation({ summary: "Book Flight" })
  @ApiResponse({ status: 200, description: "Api success" })
  @ApiResponse({ status: 422, description: "Bad Request or API error message" })
  @ApiResponse({ status: 404, description: "Flight is not available now" })
  @HttpCode(200)
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(
    Role.SUPER_ADMIN,
    Role.ADMIN,
    Role.PAID_USER,
    Role.FREE_USER,
    Role.GUEST_USER
  )
  async bookFlight(
    @Body() bookFlightDto: BookFlightDto,
    @Req() req,
    @LogInUser() user
  ) {
    return await this.flightService.bookFlight(
      bookFlightDto,
      req.headers,
      user
    );
  }

  @Get("/ticket/:id")
  @ApiOperation({ summary: "Ticket flight booking" })
  @ApiResponse({ status: 200, description: "Api success" })
  @ApiResponse({ status: 422, description: "Bad Request or API error message" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 500, description: "Internal server error!" })
  async ticketFlight(@Param("id") id: String) {
    return await this.flightService.ticketFlight(id);
  }

  @Get("/trip-details/:id")
  @ApiOperation({ summary: "Trip details" })
  @ApiResponse({ status: 200, description: "Api success" })
  @ApiResponse({ status: 422, description: "Bad Request or API error message" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 500, description: "Internal server error!" })
  async tripDetails(@Param("id") id: String) {
    return await this.flightService.tripDetails(id);
  }

  @Post("/search-oneway-zip-flight")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Search One Way flight" })
  @ApiResponse({ status: 200, description: "Api success" })
  @ApiResponse({ status: 422, description: "Bad Request or API error message" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 500, description: "Internal server error!" })
  @HttpCode(200)
  @ApiHeader({
    name: "currency",
    description: "Enter currency code(ex. USD)",
    example: "USD",
  })
  @ApiHeader({
    name: "language",
    description: "Enter language code(ex. en)",
  })
  async searchOneWayFlightZip(
    @Body() searchFlightDto: OneWaySearchFlightDto,
    @Req() req,
    @LogInUser() user
  ) {
    return await this.flightService.searchOneWayZipFlight(
      searchFlightDto,
      req.headers,
      user
    );
  }

  @Post("/search-roundtrip-zip-flight")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Search roundTrip flight" })
  @ApiResponse({ status: 200, description: "Api success" })
  @ApiResponse({ status: 422, description: "Bad Request or API error message" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 500, description: "Internal server error!" })
  @HttpCode(200)
  @ApiHeader({
    name: "currency",
    description: "Enter currency code(ex. USD)",
    example: "USD",
  })
  @ApiHeader({
    name: "language",
    description: "Enter language code(ex. en)",
  })
  async searchRoundTripZip(
    @Body() searchFlightDto: RoundtripSearchFlightDto,
    @Req() req,
    @LogInUser() user
  ) {
    return await this.flightService.searchRoundTripZipFlight(
      searchFlightDto,
      req.headers,
      user
    );
  }

  @Post("/predicted-booking-date")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "It preduct a date for this day system have done a booking  ",
  })
  @ApiResponse({ status: 200, description: "Api success" })
  @ApiResponse({ status: 422, description: "Bad Request or API error message" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 500, description: "Internal server error!" })
  @HttpCode(200)
  @ApiHeader({
    name: "currency",
    description: "Enter currency code(ex. USD)",
    example: "USD",
  })
  @ApiHeader({
    name: "language",
    description: "Enter language code(ex. en)",
  })
  async predictedBookingDate(
    @Body() searchFlightDto: PreductBookingDateDto,
    @Req() req,
    @LogInUser() user
  ) {
    return await this.flightService.preductBookingDate(
      searchFlightDto,
      req.headers,
      user
    );
  }

  @Post("/flexible-day-rate")
  @ApiBearerAuth()
  @ApiOperation({ summary: "It a return flight rate for flexible day" })
  @ApiResponse({ status: 200, description: "Api success" })
  @ApiResponse({ status: 422, description: "Bad Request or API error message" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 500, description: "Internal server error!" })
  @HttpCode(200)
  @ApiHeader({
    name: "currency",
    description: "Enter currency code(ex. USD)",
    example: "USD",
  })
  @ApiHeader({
    name: "language",
    description: "Enter language code(ex. en)",
  })
  async flexibleDayRate(
    @Body() searchFlightDto: OneWaySearchFlightDto,
    @Req() req,
    @LogInUser() user
  ) {
    return await this.flightService.flexibleDateRate(
      searchFlightDto,
      req.headers,
      user
    );
  }

  @Post("/flexible-day-rate-for-round-trip")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "It a return flight rate for flexible day for round trip",
  })
  @ApiResponse({ status: 200, description: "Api success" })
  @ApiResponse({ status: 422, description: "Bad Request or API error message" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 500, description: "Internal server error!" })
  @HttpCode(200)
  @ApiHeader({
    name: "currency",
    description: "Enter currency code(ex. USD)",
    example: "USD",
  })
  @ApiHeader({
    name: "language",
    description: "Enter language code(ex. en)",
  })
  async flexibleDayRateForRoundtrip(
    @Body() searchFlightDto: RoundtripSearchFlightDto,
    @Req() req,
    @LogInUser() user
  ) {
    return await this.flightService.flexibleDateRateForRoundTrip(
      searchFlightDto,
      req.headers,
      user
    );
  }

  @Post("/calender-day-rate")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "It a return flight rate between given start date to end date",
  })
  @ApiResponse({ status: 200, description: "Api success" })
  @ApiResponse({ status: 422, description: "Bad Request or API error message" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 500, description: "Internal server error!" })
  @HttpCode(200)
  @ApiHeader({
    name: "currency",
    description: "Enter currency code(ex. USD)",
    example: "USD",
  })
  @ApiHeader({
    name: "language",
    description: "Enter language code(ex. en)",
  })
  async callenderDayRates(
    @Body() searchFlightDto: FullCalenderRateDto,
    @Req() req,
    @LogInUser() user
  ) {
    return await this.flightService.fullcalenderRate(
      searchFlightDto,
      req.headers,
      user
    );
  }

  @Post("/selling-price")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get Selling price" })
  @ApiResponse({ status: 200, description: "Api success" })
  @ApiResponse({ status: 422, description: "Bad Request or API error message" })
  @ApiResponse({ status: 500, description: "Internal server error!" })
  @HttpCode(200)
  async getSellingPrice(@Body() netRateDto: NetRateDto, @LogInUser() user) {
    return await this.flightService.getSellingPrice(netRateDto, user);
  }

  @Post("/manully-update/:booking_id")
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @UseGuards(AuthGuard(), RolesGuard)
  @ApiOperation({ summary: "manully update booking" })
  @ApiResponse({ status: 200, description: "Api success" })
  @ApiResponse({ status: 422, description: "Bad Request or API error message" })
  @ApiResponse({ status: 500, description: "Internal server error!" })
  @HttpCode(200)
  async manullyBookingUpdate(
    @Body() manullybooking: ManullyBookingDto,
    @Param("booking_id") booking_id: string
  ) {
    return await this.flightService.bookingUpdateFromSupplierside(
      booking_id,
      manullybooking
    );
  }

  @Delete("/cancel-booking/:booking_id")
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @UseGuards(AuthGuard(), RolesGuard)
  @ApiOperation({ summary: "cancel booking" })
  @ApiResponse({ status: 200, description: "Api success" })
  @ApiResponse({ status: 422, description: "Bad Request or API error message" })
  @ApiResponse({ status: 500, description: "Internal server error!" })
  @HttpCode(200)
  async cancelBooking(
    @Param("booking_id") booking_id: string,
    @GetUser() user: User
  ) {
    return await this.flightService.cancelBooking(booking_id, user.userId);
  }

  @Put("/book-partially-booking/:booking_id")
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
  @ApiBearerAuth()
  @UseGuards(AuthGuard(), RolesGuard)
  @ApiOperation({ summary: "book parially booking by the admin" })
  @ApiResponse({ status: 200, description: "Api success" })
  @ApiResponse({ status: 422, description: "Bad Request or API error message" })
  @ApiResponse({ status: 500, description: "Internal server error!" })
  @HttpCode(200)
  @ApiHeader({
    name: "currency",
    description: "Enter currency code(ex. USD)",
    example: "USD",
  })
  @ApiHeader({
    name: "language",
    description: "Enter language code(ex. en)",
  })
  async bookPartiallyBooking(
    @Param("booking_id") booking_id: string,
    @Req() req
  ) {
    return await this.flightService.bookPartialBooking(booking_id, req.headers);
  }

  

  

  

  @Get('/route/search')
    @ApiOperation({ summary: "Search flight route" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async searchFlightRoute(
        @Query() searchRouteDto: SearchRouteDto
    ) {
        return await this.flightService.serchRoute(searchRouteDto);
    }

    @Get('/route/:type')
    @ApiOperation({ summary: "Search flight route" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async flightRoute(
        @Param('type') type: String
    ) {
        return await this.flightService.flightRoute(type);
    }

    

    @Post('/import-category')
    @ApiOperation({ summary: "Import category" })
    @ApiResponse({ status: 200, description: 'Api success' })
    
    async importCategory(
    ) {
        return await this.flightService.importCategory();
        //return await this.flightService.mapChildParentAirport(name);
    }
}
