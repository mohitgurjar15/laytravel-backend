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
@ApiBearerAuth()
@UseGuards(AuthGuard(), RolesGuard)
export class AdminDashboardController {
	constructor(private adminDashboardService: AdminDashboardService) {}

	@Get("total-revanue")
	@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
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

	@Get('laytrip-user-location')
	@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
	@ApiOperation({ summary: "Count of the users based on locations" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async countryBasedCount(
	): Promise<any>{
		return await this.adminDashboardService.userCountOnCountry();
	}

	@Get("member-static-graph")
	@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
	@ApiOperation({
		summary: "Get a total of mamber statics ",
	})
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async getMemberStaticGraph(
        @Query() filterOption : DashboardFilterDto
    ) {
		return await this.adminDashboardService.memberStaticsForGraph(filterOption);
	}


	@Get("laytrip-credit-states")
	@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
	@ApiOperation({
		summary: "Total laytrip credit states ",
	})
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async laytripCreditStates(
        @Query() filterOption : DashboardFilterDto
    ) {
		return await this.adminDashboardService.laytripCreditStates(filterOption);
	}

	@Get("weekly-monthly-member-statics")
	@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
	@ApiOperation({
		summary: "Get a total of current month and current week count ",
	})
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async getMemberStatic(
    ) {
		return await this.adminDashboardService.memberStatics();
	}

	@Get("booking-statistics")
	@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
	@ApiOperation({
		summary: "get all booking statistics",
	})
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async bookingStatistics(
		@Query() filterOption : DashboardFilterDto
    ) {
		return await this.adminDashboardService.bookingStatistics(filterOption);
	}


	@Get("customer-statistics")
	@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
	@ApiOperation({
		summary: "get all customer statistics",
	})
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async customerStatistics(
		@Query() filterOption: DashboardFilterDto
    ) {
		return await this.adminDashboardService.customerStatistics(filterOption);
	}

	@Get("booking-statistics-detail")
	@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
	@ApiOperation({
		summary: "get booking detail statistics",
	})
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async bookingDetailStatistics() {
		return await this.adminDashboardService.bookingDetailStatistics();
	}


	@Get("booking-statistics-graph")
	@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
	@ApiOperation({
		summary: "get booking graph detail",
	})
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async bookingGraph(
		@Query() filterOption: DashboardFilterDto
    ) {
		return await this.adminDashboardService.dashboardBookingChart(filterOption);
	}

}
