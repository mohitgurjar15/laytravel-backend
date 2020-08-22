import { Controller, UseGuards, Get } from '@nestjs/common';
import { CronJobsService } from './cron-jobs.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

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

}
