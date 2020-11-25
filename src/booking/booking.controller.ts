import { Controller, Get, UseGuards, Param, Query } from "@nestjs/common";
import { BookingService } from "./booking.service";
import { AuthGuard } from "@nestjs/passport";
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { Roles } from "src/guards/role.decorator";
import { Role } from "src/enum/role.enum";
import { ListBookingDto } from "./dto/list-booking.dto";
import { GetUser } from "src/auth/get-user.dacorator";
import { User } from "@sentry/node";
import { ListPaymentDto } from './dto/list-payment.dto'
import { ListPaymentAdminDto } from "src/booking/dto/list-payment-admin.dto";
import { listPredictedBookingData } from "./dto/get-predictive-data.dto";

@ApiTags("Booking")
@ApiBearerAuth()
@UseGuards(AuthGuard())
@Controller("booking")
export class BookingController {
	constructor(private bookingService: BookingService) { }

	@Get("re-sent-booking-email/:id")
	@UseGuards(AuthGuard())
	@ApiOperation({ summary: "re-sent the email of the booking " })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Given booking id not found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async resentEmailId(
		@Param("id") bookingId: string
	): Promise<{ message: any }> {
		return await this.bookingService.resendBookingEmail(bookingId);
	}


	@Get()
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "Booking listing by admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Booking not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async listBooking(
		@Query() paginationOption: ListBookingDto,

	) {
		return await this.bookingService.listBooking(paginationOption);
	}


	@Get('user-booking-list')
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
		@Query() paginationOption: ListBookingDto,
		@GetUser() user: User
	) {
		return await this.bookingService.userBookingList(paginationOption, user.userId);
	}



	@Get('booking-details/:id')
	@ApiOperation({ summary: "get booking detail" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Booking not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async bookingDetail(
		@Param("id") bookingId: string
	) {
		return await this.bookingService.getBookingDetail(bookingId);
	}

	@Get('payment')
	@ApiOperation({ summary: "get booking detail" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Booking not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async getPaymentHistory(
		@Query() listPaymentDto: ListPaymentDto,
		@GetUser() user
	) {
		return await this.bookingService.getPaymentHistory(user, listPaymentDto);
	}

	@Get('installment-list')
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "Payment List For Admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Payment not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async listPaymentForAdmin(
		@Query() paginationOption: ListPaymentAdminDto,

	) {
		return await this.bookingService.listPaymentForAdmin(paginationOption);
	}

	@Get('get-all-user-booking/:user_id')
	@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
	@ApiOperation({ summary: "get all user booking for admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Payment not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async getAllBookingId(
		@Param('user_id') userId: string,
		@Query() paginationOption: ListBookingDto,		
	) {
		return await this.bookingService.userBookingList(paginationOption,userId);
	}

	@Get('pending-booking')
	@Roles(Role.ADMIN,Role.SUPER_ADMIN,Role.SUPPORT)
	@ApiOperation({ summary: "It return daily price of the pending booking " })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Booking not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async getPredictiveBookingDdata(
		@Query() filterOption: listPredictedBookingData
	) {
		return await this.bookingService.getPredictiveBookingDdata(filterOption);
	}
}
