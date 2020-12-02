import { Body, CacheModule, CACHE_MANAGER, Controller, Get, Inject, Param, Post, Res, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HotelSearchLocationDto } from './dto/search-location/search-location.dto';
import { SearchReqDto } from './dto/search/search-req.dto';
import { HotelService } from './hotel.service';
import { Cache } from 'cache-manager';

@ApiTags('Hotel')
@Controller('hotel')
export class HotelController {
    private hotelService;
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
        this.hotelService = new HotelService();
    }

    @Post('/search-location')
    @ApiOperation({ summary: "Search Airpot by airport name, airport code and city name" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    suggestion(
        @Body() searchLocationDto: HotelSearchLocationDto,
        @Res() res: any
    ) {

        this.hotelService.autoComplete(searchLocationDto).subscribe((data) => {
            res.send({
                data,
                message: data.length ? 'Result found' : 'No result Found'
            });
        });
        
    }

    @Post('search')
    search(
        @Body() searchReqDto: SearchReqDto
    ) {
        return this.hotelService.search(searchReqDto)
            // .subscribe((data) => {
            //     console.log(data);
            // });
    }
}
