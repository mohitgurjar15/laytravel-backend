import {
	Controller,
	UseGuards,
	Put,
	Get,
	Query,
	Post,
	HttpCode,
	Body,
	Param,
	Delete,
	Patch,
} from "@nestjs/common";
import { FaqService } from "./faq.service";
import {
	ApiTags,
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
} from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/guards/role.guard";
import { Roles } from "src/guards/role.decorator";
import { Role } from "src/enum/role.enum";
import { ListFaqDto } from "./dto/list-faq.dto";
import { Faq } from "src/entity/faq.entity";
import { InsertFaqDto } from "./dto/insert-faq.dto";
import { GetUser } from "src/auth/get-user.dacorator";
import { User } from "@sentry/node";
import { UpdateFaqDto } from "./dto/update-faq.dto";
import { ActiveDeactiveDto } from "src/user/dto/active-deactive-user.dto";
import { ActiveDeactiveFaq } from "./dto/active-deactive-faq.dto";

@ApiTags("FAQ")
@ApiBearerAuth()
@Controller("faq")
export class FaqController {
	constructor(private faqService: FaqService) {}

	@Get()
	@ApiOperation({ summary: "List of Faq" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Faq Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async getFaq(
		@Query() paginationOption: ListFaqDto
	): Promise<{ data: Faq[]; TotalReseult: number }> {
		return await this.faqService.listFaq(paginationOption);
	}

	@Post()
	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN)
	@ApiOperation({ summary: "new Faq create" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: " Faq Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@HttpCode(200)
	async insertFaq(
		@Body() InsertFaqDto: InsertFaqDto,
		@GetUser() user: User
	): Promise<{ message: string }> {
		return await this.faqService.createFaq(InsertFaqDto, user);
	}

	@Put("/:id")
	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN)
	@ApiOperation({ summary: "Update Faq" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Faq Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@HttpCode(200)
	async updateFaq(
		@Param("id") id: number,
		@Body() UpdateFaqDto: UpdateFaqDto,
		@GetUser() user: User
	): Promise<{ message: string }> {
		return await this.faqService.updateFaq(id, UpdateFaqDto, user);
	}

	@Delete("/:id")
	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN)
	@ApiOperation({ summary: "Delete Faq" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@HttpCode(200)
	async DeleteFaq(
		@Param("id") id: number,
		@GetUser() user: User
	): Promise<{ message: string }> {
		return await this.faqService.deleteFaq(id, user);
	}

	@Patch("/:id")
	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN)
	@ApiOperation({ summary: "Change Faq Status" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@HttpCode(200)
	async activeDeactiveFaq(
		@Param("id") id: number,
		@Body() activeDeactiveFaq: ActiveDeactiveFaq,
		@GetUser() user: User
	): Promise<{ message: string }> {
		return await this.faqService.activeDeactiveFaq(id, activeDeactiveFaq, user);
	}

	@Get("/:id")
	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN)
	@ApiOperation({ summary: "get Faq by id" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@HttpCode(200)
	async getFaqDetail(@Param("id") id: number): Promise<Faq> {
		return await this.faqService.getFaq(id);
	}
}
