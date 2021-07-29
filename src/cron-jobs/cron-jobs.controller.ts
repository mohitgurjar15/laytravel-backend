import { Controller, Delete, Get, HttpCode, Put, Query, Req } from '@nestjs/common';
import { CronJobsService } from './cron-jobs.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { getBookingDailyPriceDto } from './dto/get-daily-booking-price.dto';


@ApiTags("Cron jobs")
@Controller("cron-jobs")
export class CronJobsController {
    constructor(private cronJobsService: CronJobsService) {}

    @Get("convert-customer")
    @ApiOperation({
        summary:
            "Convert customer to free user if subscription plan is not done by paid customer",
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
    @ApiResponse({ status: 404, description: "Admin not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async convertCustomer() {
        return await this.cronJobsService.convertCustomer();
    }

    @Get("update-pending-flight-booking")
    @ApiOperation({ summary: "change status of the booking fare type is GDS " })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Admin not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async updateFlightBooking() {
        return await this.cronJobsService.checkPandingFlights();
    }

    @Get("get-partial-payment")
    @ApiOperation({ summary: "Get Partial paymnt from the user " })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Admin not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async getPartialPoint() {
        return await this.cronJobsService.partialPayment();
    }

    @Get("payment/daily")
    @ApiOperation({ summary: "Get Partial paymnt from the user " })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Admin not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async dailyInstallmentPayment() {
        return await this.cronJobsService.dailyPayment();
    }

    @Get("partial-booking-price")
    @ApiOperation({ summary: "get daily price of partial booking " })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Admin not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async partialBookingPrice(
        @Req() req,
        @Query() options: getBookingDailyPriceDto
    ) {
        return await this.cronJobsService.partialBookingPrice(
            req.headers,
            options
        );
    }

    @Get("update-flight-booking")
    @ApiOperation({ summary: "update flight booking-in-process booking" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async updateFlightBookingInProcess(@Req() req) {
        return await this.cronJobsService.updateFlightBookingInProcess();
    }

    @Get("add-recurring-laytrip-point")
    @ApiOperation({ summary: "Add Recurring laytrip point" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async addRecurringLaytripPoint(@Req() req) {
        return await this.cronJobsService.addRecurringLaytripPoint();
    }

    @Get("installment-reminder")
    @ApiOperation({
        summary:
            "send email notification to user have installment date in 2 days",
    })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async installerReminder(@Req() req) {
        return await this.cronJobsService.paymentReminder();
    }

    @Get("upload-flight-log")
    @ApiOperation({ summary: "upload flight log on s3 bucket" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async uploadFlightLog() {
        return await this.cronJobsService.uploadLogIntoS3Bucket("flights");
    }

    @Get("upload-payment-log")
    @ApiOperation({ summary: "upload payment log on s3 bucket" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async uploadPaymentLog() {
        return await this.cronJobsService.uploadLogIntoS3Bucket("payment");
    }

    @Get("upload-hotel-log")
    @ApiOperation({ summary: "upload payment log on s3 bucket" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async uploadHotelLog() {
        return await this.cronJobsService.uploadLogIntoS3Bucket("hotel");
    }

    @Delete("log")
    @ApiOperation({ summary: "delete logs" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async deletelogs() {
        await this.cronJobsService.deleteLog("flights");
       return await this.cronJobsService.deleteLog("payment");
    }

    @Get("database-backup")
    @ApiOperation({ summary: "upload database backup file on s3 bucket" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async databaseBackup() {
        return await this.cronJobsService.backupDatabase();
    }

    @Put("update-module-info")
    @ApiOperation({ summary: "update cart" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async updateModuleInfo(@Req() req) {
        return await this.cronJobsService.updateModuleInfo(req.headers);
    }

    // @Get("booking-confirmation-mail")
    // @ApiOperation({
    //     summary: "Upcoming booking traveler provider change mail",
    // })
    // @ApiResponse({ status: 200, description: "Api success" })
    // @ApiResponse({
    //     status: 422,
    //     description: "Bad Request or API error message",
    // })
    // @ApiResponse({
    //     status: 403,
    //     description: "You are not allowed to access this resource.",
    // })
    // @ApiResponse({ status: 404, description: "Admin not found!" })
    // @ApiResponse({ status: 500, description: "Internal server error!" })
    // async travelProviderMail() {
    //     return await this.cronJobsService.ChangesFromTravelProvider();
    // }

    @Get("reminder/upcoming-booking")
    @ApiOperation({
        summary: "Upcoming booking mail",
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
    @ApiResponse({ status: 404, description: "Admin not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async upcommintBooking() {
        return await this.cronJobsService.upcommingBookingDetail();
    }



    @Get("default-user")
    @ApiOperation({ summary: "default user on 10 th day from due date." })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Admin not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async defaultUser(
    ) {
        return await this.cronJobsService.defaultUserOn10day()
    }


    @Get("flight-availiblity-assure")
    @ApiOperation({ summary: "flight availiblity assure cron " })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Admin not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async assureFlightRoutes(
    ) {
        return await this.cronJobsService.flightAvailiblityAssure()
    }



    @Get("airline-availiblity-assure")
    @ApiOperation({ summary: "flight availiblity assure cron " })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Admin not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async assureAirlines(
    ) {
        return await this.cronJobsService.deltaFlightAvailiblityAssure()
    }


}
