import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Locations } from './dto/search-location/location.dto';
import { HotelSearchLocationDto } from './dto/search-location/search-location.dto';
import { HotelService } from './hotel.service';

@ApiTags('Hotel')
@Controller('hotel')
export class HotelController {
    private hotelService;
    constructor( ) {
        this.hotelService = new HotelService();
    }

    @Post('/search-location')
    @ApiOperation({ summary: "Search Airpot by airport name, airport code and city name" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    suggestion(
        @Body() searchLocationDto: HotelSearchLocationDto
    ): Locations {
        let res = this.hotelService.autoComplete(searchLocationDto);
        // console.log(c);
        return res;
    }
}
