import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBearerAuth } from "@nestjs/swagger";
import { DumpPaginationDto } from './dto/list-languge.dto';
import { SearchLocation } from './dto/search_location.dto';
import { AvailabilityDto } from './dto/availability.dto';
import { VacationRentalService } from './vacation-rental.service';
import { AvailabilityDetailsDto } from './dto/availabilty_details.dto';
import { VerifyAvailabilityDto } from './dto/verify_availability.dto';
import { BookingDto } from './dto/booking.dto';
import { LogInUser } from 'src/auth/get-user.dacorator';
import { AuthGuard } from '@nestjs/passport';

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
        @Query() searchLocation: SearchLocation
    ) {
        return this.vacationRentalService.getSearchLocation(searchLocation)
    }

    @Get('/availability')
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @ApiOperation({ summary: "Check list of all available property" })
    @ApiHeader({
        name: 'currency',
        description: 'Enter currency code(ex. USD)',
        example: 'USD'
    })
    @UseGuards(AuthGuard())
    async hotelAvailability(
        @Req() req,
        @Query() availability: AvailabilityDto,
        @LogInUser() user
    ): Promise<any> {
        return await this.vacationRentalService.availabilityHotel(availability,user, req.headers);
    }

    @Get("availability/:id")
    @ApiOperation({ summary: "List of unit types in property" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @ApiHeader({
        name: 'currency',
        description: 'Enter currency code(ex. USD)',
        example: 'USD'
    })
    async hotelAvailabilityId(
        @Req() req,
        @Param("id") hotelId: number,
        @Query() availabilityDetailsDto: AvailabilityDetailsDto
    ) {
        return await this.vacationRentalService.unitTypeListAvailability(hotelId, availabilityDetailsDto, req.headers);
    }

    @Get('verify-availability/:UTid')
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @ApiOperation({ summary: "Verify unit type price and availability" })
    @ApiHeader({
        name: 'currency',
        description: 'Enter currency code(ex. USD)',
        example: 'USD'
    })
    async verifyAvailability(
        @Req() req,
        @Param("UTid") unitTypeId: number,
        @Query() verifyAvailabilityDetailsDto: VerifyAvailabilityDto
    ) {
        return await this.vacationRentalService.verifyUnitAvailability(unitTypeId, verifyAvailabilityDetailsDto, req.headers);
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
            @Param('reservationId') reservationId:string
        ) {
		return await this.vacationRentalService.deleteBooking(reservationId);
	}
}
