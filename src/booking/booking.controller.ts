import {
    Controller,
    Get,
    UseGuards,
    Param,
    Query,
    Post,
    Body,
    HttpCode,
    Delete,
    Put,
    Req,
} from "@nestjs/common";
import { BookingService } from "./booking.service";
import { AuthGuard } from "@nestjs/passport";
import {
    ApiOperation,
    ApiResponse,
    ApiTags,
    ApiBearerAuth,
    ApiHeader,
} from "@nestjs/swagger";
import { Roles } from "src/guards/role.decorator";
import { Role } from "src/enum/role.enum";
import { ListBookingDto } from "./dto/list-booking.dto";
import { GetUser } from "src/auth/get-user.dacorator";
import { ListPaymentDto } from "./dto/list-payment.dto";
import { ListPaymentAdminDto } from "src/booking/dto/list-payment-admin.dto";
import { ExportBookingDto } from "./dto/export-booking.dto";
import { ShareBookingDto } from "./dto/share-booking-detail.dto";
import { User } from "src/entity/user.entity";
import { getBookingDetailsDto } from "./dto/get-booking-detail.dto";
import { BookingFilterDto } from "./dto/booking-filter.dto";
import { ExportPaymentAdminDto } from "./dto/export-payment-list.dto";
import { DeleteBookingDto } from "./dto/delete-cart.dto";
import { UpdateTravelerInfoDto } from "./dto/update-traveler-info.dto";
import { updateBookingDto } from "./dto/update-booking.dto";
import { IntialCancelBookingDto } from "./dto/intial-cancelation-booking.dto";
import { ReverceIntialCancelBookingDto } from "./dto/inrial-cancellation-reverce.dto";
import { GetReferralId } from "src/decorator/referral.decorator";

@ApiTags("Booking")
@ApiBearerAuth()
@UseGuards(AuthGuard())
@ApiHeader({
    name: "referral_id",
    description: "landing page id",
    example: "",
})
@Controller("booking")
export class BookingController {
    constructor(private bookingService: BookingService) {}

    @Post("re-sent-booking-email")
    @UseGuards(AuthGuard())
    @ApiOperation({ summary: "re-sent the email of the booking " })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Given booking id not found" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async resentEmailId(
        @Body() shareBookingDto: getBookingDetailsDto
    ): Promise<{ message: any }> {
        return await this.bookingService.resendBookingEmail(shareBookingDto);
    }

    @Post("cart/re-sent-email")
    @UseGuards(AuthGuard())
    @ApiOperation({ summary: "re-sent the email of the cart booking " })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Given booking id not found" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async resentCartEmail(@Body() shareBookingDto: getBookingDetailsDto) {
        return await this.bookingService.resendCartEmail(shareBookingDto);
    }

    @Get()
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    @ApiOperation({ summary: "Booking listing by admin" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Booking not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async listBooking(@Query() paginationOption: ListBookingDto) {
        return await this.bookingService.listBooking(paginationOption);
    }

    @Get("user-booking-list")
    @Roles(Role.GUEST_USER, Role.FREE_USER, Role.PAID_USER)
    @ApiOperation({ summary: "Booking listing by user" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
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
        return await this.bookingService.userBookingList(
            paginationOption,
            user.userId
        );
    }

    @Get("incomplete-bookings")
    @Roles(Role.GUEST_USER, Role.FREE_USER, Role.PAID_USER)
    @ApiOperation({ summary: "Incomplete booking list of user" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Booking not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async currentBooking(
        @Query() paginationOption: BookingFilterDto,
        @GetUser() user: User
    ) {
        return await this.bookingService.currentBooking(paginationOption, user);
    }

    @Get("complete-bookings")
    @Roles(Role.GUEST_USER, Role.FREE_USER, Role.PAID_USER)
    @ApiOperation({ summary: "complete booking listing by user" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Booking not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async completeBookingList(
        @Query() paginationOption: BookingFilterDto,
        @GetUser() user: User
    ) {
        return await this.bookingService.completeBooking(
            paginationOption,
            user
        );
    }

    @Get("cart-detail/:cart_id")
    @Roles(Role.FREE_USER, Role.PAID_USER)
    @ApiOperation({ summary: "get cart detail" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async cartBookingDetail(
        @GetUser() user: User,
        @Param("cart_id") cartId: string
    ) {
        return await this.bookingService.getCartBookingDetail(cartId, user);
    }

    @Get("booking-details/:id")
    @ApiOperation({ summary: "get booking detail" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Booking not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async bookingDetail(@Param("id") bookingId: string) {
        return await this.bookingService.getBookingDetail(bookingId);
    }

    @Get("payment")
    @ApiOperation({ summary: "get booking payment detail" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
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
        return await this.bookingService.getPaymentHistory(
            user,
            listPaymentDto
        );
    }

    @Get("upcoming-installment-list")
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    @ApiOperation({ summary: "Upcoming payment List For Admin" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Payment not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async upcomingPaymentForAdmin(
        @Query() paginationOption: ListPaymentAdminDto
    ) {
        return await this.bookingService.upcomingPaymentForAdmin(
            paginationOption
        );
    }

    @Get("active-installment-list")
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    @ApiOperation({ summary: "Active payment List For Admin" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Payment not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async activePaymentForAdmin(
        @Query() paginationOption: ListPaymentAdminDto
    ) {
        return await this.bookingService.activePaymentForAdmin(
            paginationOption
        );
    }

    @Get("export/upcoming-installment")
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    @ApiOperation({ summary: "Upcoming payment List For Admin" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Payment not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async exportUpcomingPaymentForAdmin(
        @Query() paginationOption: ExportPaymentAdminDto
    ) {
        return await this.bookingService.exportUpcomingPaymentForAdmin(
            paginationOption
        );
    }

    @Get("export/active-installment")
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    @ApiOperation({ summary: "Active payment List For Admin" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Payment not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async exportActivePaymentForAdmin(
        @Query() paginationOption: ExportPaymentAdminDto
    ) {
        return await this.bookingService.exportActivePaymentForAdmin(
            paginationOption
        );
    }

    @Get("get-all-user-booking/:user_id")
    @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
    @ApiOperation({ summary: "get all user booking for admin" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Payment not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async getAllBookingId(
        @Param("user_id") userId: string,
        @Query() paginationOption: ListBookingDto
    ) {
        return await this.bookingService.userBookingList(
            paginationOption,
            userId
        );
    }

    @Get("pending-booking")
    @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SUPPORT)
    @ApiOperation({
        summary: "It return to day price of the all pending booking ",
    })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Booking not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async getPredictiveBookingDdata() {
        return await this.bookingService.getPredictiveBookingDdata();
    }

    @Get("daily-prices-of-booking/:booking_id")
    @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SUPPORT)
    @ApiOperation({ summary: "It return daily price of the pending booking " })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Booking not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async dailyPricesOfBooking(@Param("booking_id") bookingId: string) {
        return await this.bookingService.getDailyPricesOfBooking(bookingId);
    }

    @Get("export-bookings")
    @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SUPPORT)
    @ApiOperation({ summary: "Export all bookings " })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Booking not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async exportBooking(@Query() filterOption: ExportBookingDto) {
        return await this.bookingService.exportBookings(filterOption);
    }

    @Post("share-booking-detail")
    @UseGuards(AuthGuard())
    @Roles(Role.FREE_USER, Role.GUEST_USER, Role.PAID_USER)
    @ApiOperation({ summary: "share your booking detail" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Given booking id not found" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async shareBookingDetail(
        @Body() shareBookingDto: ShareBookingDto,
        @GetUser() user: User
    ): Promise<{ message: any }> {
        return await this.bookingService.shareBooking(shareBookingDto, user);
    }

    @Get("filter-options/booking-id")
    @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
    @ApiOperation({ summary: "list all booking id  for admin" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "User not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async getemails() {
        return await this.bookingService.getBookingIds();
    }

    @Delete()
    @ApiOperation({ summary: "Delete booking" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Booking not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async deleteCart(
        @Query() deleteBookingDto: DeleteBookingDto,
        @GetUser() user: User,@GetReferralId() referralId:string
    ) {
        return await this.bookingService.deleteBooking(deleteBookingDto, user,referralId);
    }

    @Put("travelerInfo/:traveler_info_id")
    @UseGuards(AuthGuard())
    @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SUPPORT)
    @ApiOperation({ summary: "Update booking traveler info" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Given booking id not found" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async updateTravelerInfo(
        @Body() updateTravelerInfoDto: UpdateTravelerInfoDto,
        @Param("traveler_info_id") id: number,
        @GetUser() user: User
    ): Promise<{ message: any }> {
        return await this.bookingService.updateTravelerInfo(
            id,
            updateTravelerInfoDto,
            user
        );
    }

    @Put()
    @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
    @ApiOperation({ summary: "Update booking by admin" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiHeader({
        name: "currency",
        description: "Enter currency code(ex. USD)",
        example: "USD",
    })
    @ApiHeader({
        name: "language",
        description: "Enter language code(ex. en)",
    })
    @ApiResponse({ status: 404, description: "User not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async updateBooking(
        @Body() updateBookingDto: updateBookingDto,
        @Req() req,
        @GetUser() admin: User
    ) {
        return await this.bookingService.updateBookingByAdmin(
            updateBookingDto,
            req.headers,
            admin
        );
    }

    @Put("primary-travel/:booking_id/:traveler_info_id")
    @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
    @ApiOperation({ summary: "Update traveler to primery traveler" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "User not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async primaryTraveler(
        @Param("booking_id") bookingId: string,
        @Param("traveler_info_id") travelerId: number
    ) {
        return await this.bookingService.updatePrimaryTraveler(
            bookingId,
            travelerId
        );
    }

    @Put("initiate-cancellation/reverse")
    @UseGuards(AuthGuard())
    @Roles(Role.FREE_USER, Role.GUEST_USER, Role.PAID_USER)
    @ApiOperation({
        summary: "Reverse request of initiate cancellation booking",
    })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Given booking id not found" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async reverceInitiateCancellation(
        @Body() reverceIntialCancelBookingDto: ReverceIntialCancelBookingDto,
        @GetUser() user: User
    ): Promise<{ message: any }> {
        return await this.bookingService.reverceIntialBookingCancel(reverceIntialCancelBookingDto, user);
    }


    @Post("initiate-cancellation/request")
    @UseGuards(AuthGuard())
    @Roles(Role.FREE_USER, Role.GUEST_USER, Role.PAID_USER)
    @ApiOperation({
        summary: "create request for initiate cancellation booking",
    })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Given booking id not found" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async initiateCancellation(
        @Body() intialCancelBookingDto: IntialCancelBookingDto,
        @GetUser() user: User
    ): Promise<{ message: any }> {
        return await this.bookingService.requestIntialCancelBooking(intialCancelBookingDto, user);
    }
}

