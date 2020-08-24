import { Controller, Get, UseGuards, Post, Body, HttpCode } from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiTags,
	ApiOperation,
	ApiResponse,
} from "@nestjs/swagger";
import { SubscriptionRepository } from "./subscription.repository";
import { Plan } from "src/entity/plan.entity";
import { SubscriptionService } from "./subscription.service";
import { AuthGuard } from "@nestjs/passport";
import { GetUser } from "src/auth/get-user.dacorator";
import { User } from "src/entity/user.entity";
import { SubscribePlan } from "./dto/subscribe-plan.dto";
import { RolesGuard } from "src/guards/role.guard";
import { Role } from "src/enum/role.enum";
import { Roles } from "src/guards/role.decorator";

@ApiTags("Plan Subscription")
@ApiBearerAuth()
@Controller("subscription")
export class SubscriptionController {
	constructor(private SubscriptionService: SubscriptionService) {}

	@Get()
	@ApiOperation({ summary: "List Subscription plan" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Subscription plan not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@HttpCode(200)
	async planList(): Promise<{ data: Plan[] }> {
		return await this.SubscriptionService.planList();
	}

    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.FREE_USER,Role.GUEST_USER,Role.PAID_USER)
	@ApiOperation({ summary: "Subscribe the plan" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Post()
	@HttpCode(200)
	async subscribePlan(
		@GetUser() user: User,
		@Body() subscribePlan: SubscribePlan
	): Promise<{ message: string }> {
		return await this.SubscriptionService.subscribePlan(
			subscribePlan,
			user.userId,user.userId
		);
	}


	@UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.ADMIN,Role.SUPER_ADMIN,Role.PAID_USER)
	@ApiOperation({ summary: "Get the subscribed plan detail" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Get('plan-detail')
	async getPlanDetail(
		@GetUser() user: User,
	)
	{
		return await this.SubscriptionService.getPlanDetail(
			user
		);
	}
}
