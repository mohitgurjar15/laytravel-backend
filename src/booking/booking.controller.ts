import { Controller, Get, UseGuards, Param } from "@nestjs/common";
import { BookingService } from "./booking.service";
import { AuthGuard } from "@nestjs/passport";
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { RolesGuard } from "src/guards/role.guard";

@ApiTags("Booking")
@ApiBearerAuth()
@UseGuards(AuthGuard())
@Controller("booking")
export class BookingController {
	constructor(private bookingService: BookingService) {}

	@Get("re-sent-booking-email/:id")
	@UseGuards(AuthGuard())
	@ApiOperation({ summary: "re-sent the email of the booking " })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Given booking id not exiest" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async resentEmailId(
		@Param("id") bookingId: string
	): Promise<{ message: any }> {
		return await this.bookingService.resendBookingEmail(bookingId);
	}
}
