import { Body, CacheModule, CACHE_MANAGER, Controller, Get, Inject, Param, Post, Res, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DetailReqDto } from './dto/detail/detail-req.dto';
import { RoomsReqDto } from './dto/rooms/rooms-req.dto';
import { HotelSearchLocationDto } from './dto/search-location/search-location.dto';
import { SearchReqDto } from './dto/search/search-req.dto';
import { HotelService } from './hotel.service';


@ApiTags('Hotel')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('hotel')
export class HotelController {
    // private hotelService: HotelService;
    constructor(private readonly hotelService: HotelService ) {
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
        return this.hotelService.search(searchReqDto);
    }

    @Post('detail')
    detail(
        @Body() detailReqDto: DetailReqDto
    ) {

        return this.hotelService.detail(detailReqDto);
    }
    
    @Post('rooms')
    rooms(
        @Body() roomsReqDto: RoomsReqDto
    ) {

        return this.hotelService.rooms(roomsReqDto);
    }
}
