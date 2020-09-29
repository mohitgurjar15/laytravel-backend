import { Controller , Get, Put } from '@nestjs/common';
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

	@Put('update-panding-flight-booking')
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

}
