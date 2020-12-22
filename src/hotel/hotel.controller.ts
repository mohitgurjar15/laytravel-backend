import { Body, CacheModule, CACHE_MANAGER, Controller, Get, Headers, HttpCode, Inject, Param, Post, Res, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/guards/role.decorator';
import { RolesGuard } from 'src/guards/role.guard';
import { Role } from 'src/enum/role.enum';
import { DetailReqDto } from './dto/detail-req.dto';
import { FilterReqDto } from './dto/filter-req.dto';
import { HotelHeaderDto } from './dto/header.dto';
import { RoomsReqDto } from './dto/rooms-req.dto';
import { HotelSearchLocationDto } from './dto/search-location.dto';
import { SearchReqDto } from './dto/search-req.dto';
import { HotelService } from './hotel.service';
import { LogInUser } from 'src/auth/get-user.dacorator';
import { AvailabilityDto } from './dto/availability-req.dto';
import { BookDto } from './dto/book-req.dto';


@ApiTags('Hotel')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('hotel')
@ApiResponse({ status: 422, description: 'Bad Request or API error message' })
@ApiResponse({ status: 404, description: 'Not Found' })
@ApiResponse({ status: 500, description: "Internal server error!" })
@ApiBearerAuth()
export class HotelController {
    constructor(private readonly hotelService: HotelService) {
    }

    @Post('/search-location')
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Api success' })    
    @ApiOperation({ summary: "Search locations", description:"Search locations for Cities, Airports, Hotels, Point of Interest and Region to find a Hotels" })
    suggestion(
        @Body() searchLocationDto: HotelSearchLocationDto
    ) {
        
        return this.hotelService.autoComplete(searchLocationDto);
        
    }

    @Post('search')
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Api success' })    
    @ApiOperation({ summary: "Search Hotels", description: "Search Hotels based on search criteria" })
    // @UseGuards(AuthGuard(), RolesGuard)
    // @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PAID_USER, Role.FREE_USER, Role.GUEST_USER)
    search(
        @Body() searchReqDto: SearchReqDto,
        @LogInUser() user
    ) {
        return this.hotelService.search(searchReqDto);
    }

    @Post('filter-objects')
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Api success' })    
    @ApiOperation({ summary: "Filter Objects", description: "Filter objects for Searched Hotels" })
    // @UseGuards(AuthGuard(), RolesGuard)
    // @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PAID_USER, Role.FREE_USER, Role.GUEST_USER)
    filterObjects(
        @Body() filterReqDto: FilterReqDto
    ) {

        return this.hotelService.filterObjects(filterReqDto);
    }

    @Post('detail')
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Api success' })    
    @ApiOperation({ summary: "Details", description: "Get details of Hotel based on Hotel ID" })
    // @UseGuards(AuthGuard(), RolesGuard)
    // @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PAID_USER, Role.FREE_USER, Role.GUEST_USER)
    detail(
        @Body() detailReqDto: DetailReqDto,
        @Headers() hotelHeaderDto: HotelHeaderDto
    ) {
        
        detailReqDto.token = hotelHeaderDto.token;
        
        return this.hotelService.detail(detailReqDto);
    }
    
    @Post('rooms')
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Api success' })    
    @ApiOperation({ summary: "Rooms", description: "Get all available Rooms for Particular Hotel ID" })
    // @UseGuards(AuthGuard(), RolesGuard)
    // @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PAID_USER, Role.FREE_USER, Role.GUEST_USER)
    rooms(
        @Body() roomsReqDto: RoomsReqDto,
        @Headers() hotelHeaderDto: HotelHeaderDto
    ) {
        roomsReqDto.token = hotelHeaderDto.token;
        
        return this.hotelService.rooms(roomsReqDto);
    }
    
    @Post('availability')
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Api success' })    
    @ApiOperation({ summary: "Room availability", description: "Check for the Room availability based on the selected Room ID" })
    // @UseGuards(AuthGuard(), RolesGuard)
    // @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PAID_USER, Role.FREE_USER, Role.GUEST_USER)
    availability(
        @Body() availabilityDto: AvailabilityDto,
        @Headers() hotelHeaderDto: HotelHeaderDto
    ) {

        availabilityDto.token = hotelHeaderDto.token;

        return this.hotelService.availability(availabilityDto);
    }
    
    
    @Post('book')
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Api success' })    
    @ApiOperation({ summary: "Booking", description: "Hotel booking" })
    // @UseGuards(AuthGuard(), RolesGuard)
    // @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PAID_USER, Role.FREE_USER, Role.GUEST_USER)
    book(
        @Body() bookDto: BookDto,
        @Headers() hotelHeaderDto: HotelHeaderDto
    ) {

        bookDto.token = hotelHeaderDto.token;

        return this.hotelService.book(bookDto);
    }

    
}
