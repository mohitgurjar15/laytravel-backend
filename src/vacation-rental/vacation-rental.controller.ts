import { Body, Controller, Get, HttpCode, Query, Req } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AvailabilityDto } from './dto/availability.dto';
import { SearchLocation } from './dto/search.dto';
import { VacationRentalService } from './vacation-rental.service';

@Controller()
@ApiTags('Vacation-Rental')
export class VacationRentalController {

    constructor(
        private vacationService:VacationRentalService
    ){}
    
    @Get('search-location')
    @ApiOperation({ summary: "Vacation-Rent search location" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Vacation rental is not available now' })
    @HttpCode(200)
    async getLocation(
        @Query() searchLocation:SearchLocation
    ){
        return await this.vacationService.searchLocation(searchLocation);
    }

    @Get('/vacation-rental-availability')
    @ApiOperation({ summary: "Check vacation rental availability" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Vacation rental is not available now' })
    @HttpCode(200)
    @ApiHeader({
        name: 'language',
        description: 'Enter language code(ex. en)',
    })
    async vacationRentalAvailability(
        @Req() req,
        @Query() availabilityDto: AvailabilityDto
    ){
        return this.vacationService.vacationRentalAvailability(availabilityDto,req.headers);
    }

}
