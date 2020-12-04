import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBearerAuth, ApiProperty } from "@nestjs/swagger";
import { AvailabilityDto } from './dto/availability.dto';
import { VacationRentalService } from './vacation-rental.service';
import { AvailabilityDetailsDto } from './dto/availabilty_details.dto';
import { VerifyAvailabilityDto } from './dto/verify_availability.dto';
import { BookingDto } from './dto/booking.dto';
import { LogInUser } from 'src/auth/get-user.dacorator';
import { MinCharPipe } from 'src/flight/pipes/min-char.pipes';
import * as moment from 'moment';

@Controller('vacation-rental')
@ApiTags("Vacation-Rental")
export class VacationRentalController {

    constructor(private vacationRentalService: VacationRentalService) { }

    @Get('/search-location')
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @ApiOperation({ summary: "Search hotel and vacation rental" })
    async getData(
        @Query('search_name', MinCharPipe,) searchLocation: string
    ) {

        return this.vacationRentalService.getSearchLocation(searchLocation)
    }

    @Post('/availability')
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @ApiOperation({ summary: "Check list of all available property" })
    @HttpCode(200)
    @ApiHeader({
        name: 'currency',
        description: 'Enter currency code(ex. USD)',
        example: 'USD'
    })
    async hotelAvailability(
        @Req() req,
        @Body() availability: AvailabilityDto,
        @LogInUser() user
    ): Promise<any> {
        if (moment(availability.check_in_date).isBefore(moment().format("YYYY-MM-DD")))
            throw new BadRequestException(`Please enter check in date today or future date.&&&departure_date`)

        if (!moment(availability.check_out_date).isAfter(availability.check_in_date))
            throw new BadRequestException(`Please enter valid checkout date`)
        return await this.vacationRentalService.availabilityHotel(availability, user, req.headers);
    }

    @Post("availability/:id")
    @ApiBearerAuth()
    @ApiOperation({ summary: "List of unit types in property" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    @ApiHeader({
        name: 'currency',
        description: 'Enter currency code(ex. USD)',
        example: 'USD'
    })
    async hotelAvailabilityId(
        @Req() req,
        @Body() availabilityDetailsDto: AvailabilityDetailsDto,
        @LogInUser() user
    ) {
        if (moment(availabilityDetailsDto.check_in_date).isBefore(moment().format("YYYY-MM-DD")))
            throw new BadRequestException(`Please enter check in date today or future date.&&&departure_date`)

        if (!moment(availabilityDetailsDto.check_out_date).isAfter(availabilityDetailsDto.check_in_date))
            throw new BadRequestException(`Please enter valid checkout date`)
        return await this.vacationRentalService.unitTypeListAvailability(availabilityDetailsDto, req.headers,user);
    }

    @Post('verify-availability/:UTid')
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @ApiOperation({ summary: "Verify unit type price and availability" })
    @HttpCode(200)
    @ApiHeader({
        name: 'currency',
        description: 'Enter currency code(ex. USD)',
        example: 'USD'
    })
    async verifyAvailability(
        @Req() req,
        @Body() verifyAvailabilityDetailsDto: VerifyAvailabilityDto,
        @LogInUser() user
    ) {
        if (moment(verifyAvailabilityDetailsDto.check_in_date).isBefore(moment().format("YYYY-MM-DD")))
            throw new BadRequestException(`Please enter check in date today or future date.&&&departure_date`)

        if (!moment(verifyAvailabilityDetailsDto.check_out_date).isAfter(verifyAvailabilityDetailsDto.check_in_date))
            throw new BadRequestException(`Please enter valid checkout date`)
        return await this.vacationRentalService.verifyUnitAvailability(verifyAvailabilityDetailsDto, req.headers,user);
    }

    @Post('/booking')
    @ApiOperation({ summary: "Booking the property" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    @ApiHeader({
        name: 'currency',
        description: 'Enter currency code(ex. USD)',
        example: 'USD'
    })
    @ApiHeader({
        name: 'language',
        description: 'Enter language code(ex. en)',
        example: 'en'
    })
    async bookingProperty(
        @Req() req,
        @Body() bookingDto: BookingDto
    ) {
        if (moment(bookingDto.check_in_date).isBefore(moment().format("YYYY-MM-DD")))
            throw new BadRequestException(`Please enter check in date today or future date.&&&departure_date`)

        if (!moment(bookingDto.check_out_date).isAfter(bookingDto.check_in_date))
            throw new BadRequestException(`Please enter valid checkout date`)
        return await this.vacationRentalService.booking(bookingDto, req.headers)
    }

    @Delete(":reservationId")
    @ApiOperation({ summary: "Delete booking reservation" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({ status: 422, description: "Bad Request or API error message" })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Admin not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async deleteBooking(
        @Param('reservationId') reservationId: string
    ) {
        return await this.vacationRentalService.deleteBooking(reservationId);
    }
}
