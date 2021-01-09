import { Controller, UseGuards, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles } from 'src/guards/role.decorator';
import { Role } from 'src/enum/role.enum';
import { ActivitiesService } from './activities.service';
import { ListActivityDto } from './dto/list-activities.dto';
import { ActivityLog } from 'src/entity/activity-log.entity';
import { LoginLog } from 'src/entity/login-log.entity';
import { ExportActivityDto } from './dto/activity-export.dto';
import { ListSearchLogDto } from './dto/list-search-log.dto';
import { ExportSearchLogDto } from './dto/export-search-log.dto';

@ApiTags("Activities")
@ApiBearerAuth()
@Controller('activities')
@UseGuards(AuthGuard(), RolesGuard)

export class ActivitiesController {

	constructor(private activitiesService: ActivitiesService) { }


	@Get('activity-log')
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "activity logs" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "log not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async listActivityLog(
		@Query() paginationOption: ListActivityDto,

	): Promise<{ data: ActivityLog[]; TotalReseult: number }> {
		return await this.activitiesService.listActivityLog(paginationOption);
	}


	@Get('export-activity-log')
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "activity logs" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "log not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async exportActivityLog(
		@Query() paginationOption: ExportActivityDto,

	): Promise<{ data: ActivityLog[]; TotalReseult: number }> {
		return await this.activitiesService.exportActivityLog(paginationOption);
	}


	@Get('login-log')
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "login logs" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "log not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async listAdmin(
		@Query() paginationOption: ListActivityDto,

	): Promise<{ data: LoginLog[]; TotalReseult: any }> {
		return await this.activitiesService.listloginlog(paginationOption);
	}

	@Get('list-search-log')
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "Search logs" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "log not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async searchLog(
		@Query() paginationOption: ListSearchLogDto,
	) {
		return await this.activitiesService.listSearchLog(paginationOption);
	}

	@Get('export-search-log')
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "export Search logs" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "log not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async exportSearchLog(
		@Query() paginationOption: ExportSearchLogDto,
	) {
		return await this.activitiesService.exportSearchLog(paginationOption);
	}
}
