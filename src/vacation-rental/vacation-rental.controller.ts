import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBearerAuth, ApiProperty } from "@nestjs/swagger";
import { AvailabilityDto } from './dto/availability.dto';
import { VacationRentalService } from './vacation-rental.service';
import { AvailabilityDetailsDto } from './dto/availabilty_details.dto';
import { VerifyAvailabilityDto } from './dto/verify_availability.dto';
import { BookingDto } from './dto/booking.dto';
import { GetUser, LogInUser } from 'src/auth/get-user.dacorator';
import { MinCharPipe } from 'src/flight/pipes/min-char.pipes';
import * as moment from 'moment';
import { Roles } from 'src/guards/role.decorator';
import { Role } from 'src/enum/role.enum';
import { HomeRentalCalendarDto } from './dto/home-rental-calendar.dto';
import { User } from 'src/entity/user.entity';
import { RolesGuard } from 'src/guards/role.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('vacation-rental')
@ApiTags("Vacation-Rental")
@ApiBearerAuth()
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
        name: 'language',
        description: 'Enter language code(ex. en)',
        example: 'en'
    })
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

    @Post("/details")
    @ApiBearerAuth()
    @ApiOperation({ summary: "List of unit types in property" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    @ApiHeader({
        name: 'language',
        description: 'Enter language code(ex. en)',
        example: 'en'
    })
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

    @Post('verify-availability')
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @ApiOperation({ summary: "Verify unit type price and availability" })
    @HttpCode(200)
    @ApiHeader({
        name: 'language',
        description: 'Enter language code(ex. en)',
        example: 'en'
    })  
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
    @ApiBearerAuth()
    @ApiOperation({ summary: "Booking the property" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    // @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PAID_USER, Role.FREE_USER, Role.GUEST_USER)
    @HttpCode(200)
    @ApiHeader({
        name: 'language',
        description: 'Enter language code(ex. en)',
        example: 'en'
    })
    @ApiHeader({
        name: 'currency',
        description: 'Enter currency code(ex. USD)',
        example: 'USD'
    })
    async bookingProperty(
        @Req() req,
        @Body() bookingDto: BookingDto,
        @LogInUser() user
        ) {
        if (moment(bookingDto.check_in_date).isBefore(moment().format("YYYY-MM-DD")))
            throw new BadRequestException(`Please enter check in date today or future date.&&&departure_date`)

        if (!moment(bookingDto.check_out_date).isAfter(bookingDto.check_in_date))
            throw new BadRequestException(`Please enter valid checkout date`)
        return await this.vacationRentalService.booking(bookingDto, req.headers,user)
    }

    @Delete('/cancel-booking/:booking_id')
    @Roles(Role.SUPER_ADMIN, Role.ADMIN,Role.FREE_USER)
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @ApiOperation({ summary: "cancel booking" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async cancelBooking(
        @Param('booking_id') booking_id: string,
        @LogInUser() user,
    ) {
        return await this.vacationRentalService.deleteBooking(booking_id, user.user_id);
    }


    @Post('/calender-day-rate')
    @ApiBearerAuth()
    @ApiOperation({ summary: "It a return home rental rate between given start date to end date" })
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
    })
    async callenderDayRates(
        @Body() searchHomeRental: HomeRentalCalendarDto,
        @Req() req,
        @LogInUser() user
    ) {
        return await this.vacationRentalService.fullcalenderRate(searchHomeRental, req.headers, user);
    }
}
