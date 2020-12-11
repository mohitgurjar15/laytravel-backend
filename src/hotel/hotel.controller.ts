import { Body, CacheModule, CACHE_MANAGER, Controller, Get, Headers, HttpCode, Inject, Param, Post, Res, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DetailReqDto } from './dto/detail/detail-req.dto';
import { FilterReqDto } from './dto/filter/filter-req.dto';
import { HotelHeaderDto } from './dto/header.dto';
import { RoomsReqDto } from './dto/rooms/rooms-req.dto';
import { HotelSearchLocationDto } from './dto/search-location/search-location.dto';
import { SearchReqDto } from './dto/search/search-req.dto';
import { HotelService } from './hotel.service';


@ApiTags('Hotel')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('hotel')
export class HotelController {
    constructor(private readonly hotelService: HotelService) {
    }

    @Post('/search-location')
    @HttpCode(200)
    @ApiOperation({ summary: "Search locations", description:"Search locations for Hotel" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    suggestion(
        @Body() searchLocationDto: HotelSearchLocationDto
    ) {
        
        return this.hotelService.autoComplete(searchLocationDto);
        
    }

    @Post('search')
    @HttpCode(200)
    search(
        @Body() searchReqDto: SearchReqDto
    ) {
        return this.hotelService.search(searchReqDto);
    }

    @Post('detail')
    @HttpCode(200)
    detail(
        @Body() detailReqDto: DetailReqDto
    ) {

        return this.hotelService.detail(detailReqDto);
    }
    
    @Post('rooms')
    @HttpCode(200)
    rooms(
        @Body() roomsReqDto: RoomsReqDto
    ) {
        return this.hotelService.rooms(roomsReqDto);
    }

    @Post('filter-objects')
    @HttpCode(200)
    filterObjects(
        @Body() filterReqDto: FilterReqDto
    ) {

        return this.hotelService.filterObjects(filterReqDto);
    }
}
