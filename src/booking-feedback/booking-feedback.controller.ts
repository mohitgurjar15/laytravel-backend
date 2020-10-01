import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/get-user.dacorator';
import { User } from 'src/entity/user.entity';
import { Role } from 'src/enum/role.enum';
import { Roles } from 'src/guards/role.decorator';
import { BookingFeedbackService } from './booking-feedback.service';
import { AddBookingFeedback } from './dto/add-booking-feedback.dto';
import { listFeedbackForAdminDto } from './dto/list-feedback-admin.dto';
import { listFeedbackForUserDto } from './dto/list-feedback-user.dto';

@ApiTags("Booking Feedback")
@Controller('booking-feedback')
@ApiBearerAuth()
@UseGuards(AuthGuard(),UseGuards)
export class BookingFeedbackController {

    constructor(private bookingFeedbackService: BookingFeedbackService) {}



    @Get('list-feedback-for-admin')
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
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
		@Query() paginationOption: listFeedbackForAdminDto,
		
	) {
		return await this.bookingFeedbackService.listFeedbacksForAdmin(paginationOption);
	}


	@Get('list-feedback-for-user')
	@Roles(Role.GUEST_USER, Role.FREE_USER, Role.PAID_USER)	
	@ApiOperation({ summary: "Booking listing by user" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Booking not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async userBookingList(
		@Query() paginationOption: listFeedbackForUserDto,
	) {
		return await this.bookingFeedbackService.listFeedbacksForUser(paginationOption);
    }
    

    @Post("add-feedback")
	@ApiOperation({ summary: "Add new feedback" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@HttpCode(200)
	async addFeedback(
        @Body() addBookingFeedback: AddBookingFeedback,
        @GetUser() user:User
	) {
		return await this.bookingFeedbackService.addNewFeedback(addBookingFeedback,user)
    }
    
    @Delete(":id")
	@Roles(Role.SUPER_ADMIN,Role.ADMIN)
	@ApiOperation({ summary: "Delete feedback" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async deleteFeedback(@Param("id") id: string) {
		return await this.bookingFeedbackService.deleteFeedback(id);
	}
}
