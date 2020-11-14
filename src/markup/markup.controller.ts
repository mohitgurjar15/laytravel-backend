import { Controller, UseGuards, Put, Param, Body, Get } from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiTags,
	ApiOperation,
	ApiResponse,
} from "@nestjs/swagger";
import { MarkupService } from "./markup.service";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/guards/role.guard";
import { Role } from "src/enum/role.enum";
import { Roles } from "src/guards/role.decorator";
import { UpdateMarkupDto } from "./dto/updatemarkup.dto";
import { GetUser } from "src/auth/get-user.dacorator";
import { User } from "src/entity/user.entity";

@ApiTags("Markup")
@ApiBearerAuth()
@Controller("markup")
export class MarkupController {
	constructor(private markupService: MarkupService) {}

	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN)
	@ApiOperation({ summary: "Update Markup by super admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Put(":id")
	async changeMarkupStatus(
		@Param("id") id: number,
		@Body() updateMarkupDto: UpdateMarkupDto,
		@GetUser() user: User
	): Promise<{ message: string }> {
		return await this.markupService.updateMarkup(id, updateMarkupDto, user);
	}

	@Get()
	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "List markups" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Markup not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async listMarkup(): Promise<{ data: any }> {
		return await this.markupService.listMarkup();
	}


	@Get(':id')
	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "Get  markup Detail" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "language not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async getMarkup(@Param("id") id: number): Promise<{ data: any }> {
		return await this.markupService.getMarkup(id);
	}
}
