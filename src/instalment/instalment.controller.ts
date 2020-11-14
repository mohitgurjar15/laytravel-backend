import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { InstalmentService } from './instalment.service';
import { InstalmentDto } from './dto/instalment.dto';
import { InstalmentAvailabilityDto } from './dto/instalment-availability.dto';


@ApiTags('Instalment')
@Controller('instalment')
export class InstalmentController {

    constructor(private instalmentService:InstalmentService){}

    @ApiOperation({ summary: "Calculate instalment based on booking date, checkin date, amount & instalment type" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    @Post('calculate-instalment')
    async calculateInstalemnt(
        @Body() instalmentDto:InstalmentDto
    ){
        return await this.instalmentService.calculateInstalemnt(instalmentDto);
    }

    @ApiOperation({ summary: "Check if instament is available" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    @Post('instalment-availability')
    async instalemntAvailablility(
        @Body() instalmentAvailabilityDto:InstalmentAvailabilityDto
    ){
        return await this.instalmentService.instalmentAvailbility(instalmentAvailabilityDto);
    }

}
