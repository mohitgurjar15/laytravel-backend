import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/get-user.dacorator';
import { AddLaytripBookingFeedback } from 'src/booking-feedback/dto/add-laytrip-feedback.dto';
import { User } from 'src/entity/user.entity';
import { Role } from 'src/enum/role.enum';
import { Roles } from 'src/guards/role.decorator';
import { RolesGuard } from 'src/guards/role.guard';
import { ListLaytripFeedbackForAdminDto } from './dto/list-laytrip-feedback-admin.dto';
import { LaytripFeedbackService } from './laytrip-feedback.service';

@ApiTags('Laytrip Feedback')
@Controller('laytrip-feedback')
@UseGuards(AuthGuard())
export class LaytripFeedbackController {

    constructor(
        private laytripFeedbackService:LaytripFeedbackService
    ){}

    @Post('add-laytrip-feedback')
    @ApiBearerAuth()
    @ApiOperation({ summary: "Add laytrip new feedback" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({ status: 422, description: "Bad Request or API error message" })
    @ApiResponse({ status: 404, description: "not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async addLaytripFeedback(
        @Body() addLaytripBookingFeedback: AddLaytripBookingFeedback,
        @GetUser() user: User
    ) {
        return await this.laytripFeedbackService.addLaytripFeedback(addLaytripBookingFeedback, user);
    }

    @Get('list-for-admin')
    @ApiBearerAuth()
	@Roles(Role.SUPER_ADMIN, Role.ADMIN,Role.FREE_USER)
	@ApiOperation({ summary: "Booking feedback listing by admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async listfeedbackAdmin(
		@Query() paginationOption: ListLaytripFeedbackForAdminDto,
		
	) {
		return await this.laytripFeedbackService.listLaytripFeedbacksForAdmin(paginationOption);
	}
}
