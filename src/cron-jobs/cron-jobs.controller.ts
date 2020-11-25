import { Controller , Get, HttpCode, Post, Put, Req } from '@nestjs/common';
import { CronJobsService } from './cron-jobs.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';


@ApiTags("Cron jobs")
@Controller('cron-jobs')
export class CronJobsController {
    constructor(private cronJobsService:CronJobsService) {}

    @Get('convert-customer')
	@ApiOperation({ summary: "Convert customer to free user if subscription plan is not done by paid customer" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Admin not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async convertCustomer(
	){
		return await this.cronJobsService.convertCustomer();
	}

	@Put('update-pending-flight-booking')
	@ApiOperation({ summary: "change status of the booking fare type is GDS " })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Admin not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async updateFlightBooking(
	){
		return await this.cronJobsService.checkPandingFlights();
	}


	@Post('get-partial-payment')
	@ApiOperation({ summary: "Get Partial paymnt from the user " })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Admin not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@HttpCode(200)
	async getPartialPoint(
	){
		return await this.cronJobsService.partialPayment();
	}


	@Post('partial-booking-price')
	@ApiOperation({ summary: "daily price of partial booking " })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Admin not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@HttpCode(200)
	async partialBookingPrice(
		@Req() req,
	){
		return await this.cronJobsService.partialBookingPrice(req.headers);
	}


	@Get('update-flight-booking')
	@ApiOperation({ summary: "update flight booking-in-process booking" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@HttpCode(200)
	async updateFlightBookingInProcess(
		@Req() req,
	){
		return await this.cronJobsService.updateFlightBookingInProcess();
	}

	@Get('add-recurring-laytrip-point')
	@ApiOperation({ summary: "Add Recurring laytrip point" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@HttpCode(200)
	async addRecurringLaytripPoint(
		@Req() req,
	){
		return await this.cronJobsService.addRecurringLaytripPoint();
	}

	@Get('installment-reminder')
	@ApiOperation({ summary: "send email notification to user have installment date in 2 days" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@HttpCode(200)
	async installerReminder(
		@Req() req,
	){
		return await this.cronJobsService.paymentReminder();
	}
}
