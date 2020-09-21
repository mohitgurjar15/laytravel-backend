import { Controller, Get, UseGuards, Query } from "@nestjs/common";
import { AdminDashboardService } from "./admin-dashboard.service";
import { Roles } from "src/guards/role.decorator";
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { Role } from "src/enum/role.enum";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/guards/role.guard";
import { DashboardFilterDto } from "./dto/dashboard-filter.dto";

@Controller("admin-dashboard")
@ApiTags("Admin Dashboard")
// @ApiBearerAuth()
// @UseGuards(AuthGuard(), RolesGuard)
export class AdminDashboardController {
	constructor(private adminDashboardService: AdminDashboardService) {}

	@Get("total-revanue")
	// @Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({
		summary: "Get a total no of booking , Total revenue, total profit cost",
	})
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async getTotalOfRevanue(
        @Query() filterOption : DashboardFilterDto
    ) {
		return await this.adminDashboardService.TotalRevanue(filterOption);
	}
}
