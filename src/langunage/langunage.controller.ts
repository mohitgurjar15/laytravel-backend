import {
	Controller,
	Get,
	Param,
	UseGuards,
	Post,
	Put,
	Body,
	Patch,
	Delete,
	Query,
} from "@nestjs/common";
import {
	ApiTags,
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
} from "@nestjs/swagger";
import { Roles } from "src/guards/role.decorator";
import { Role } from "src/enum/role.enum";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/guards/role.guard";
import { CreateLangunageDto } from "./dto/create-langunage.dto";
import { LangunageStatusDto } from "./dto/langunage-status.dto";
import { get } from "http";
import { ListLangugeDto } from "./dto/list-languge.dto";
import { LangunageService } from "./langunage.service";
import { Language } from "src/entity/language.entity";
import { promises } from "dns";
import { GetUser } from "src/auth/get-user.dacorator";
import { User } from "@sentry/node";
import { UpdateLangunageDto } from "./dto/update-language.dto";

@ApiTags("Langunage")
@ApiBearerAuth()
@Controller("langunage")
export class LangunageController {
	constructor(private languageService: LangunageService) {}

	@Get()
	@ApiOperation({ summary: "List language" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "language not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async listLanguge(
		@Query() paginationOption: ListLangugeDto
	): Promise<{ data: Language[]; TotalReseult: number }> {
		return await this.languageService.listLanguge(paginationOption);
	}

	@Get("/:id")
	@ApiOperation({ summary: "get a detail of language" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async getLangunage(@Param("id") id: number): Promise<Language> {
		return await this.languageService.languageDetail(id);
	}

	// @Roles(Role.SUPER_ADMIN)
	// @UseGuards(AuthGuard(),RolesGuard)
	// @ApiOperation({ summary: "Save new langunage by super admin"})
	// @ApiResponse({ status: 200, description: 'Api success' })
	// @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
	// @ApiResponse({ status: 500, description: "Internal server error!" })
	// @Post()
	// saveCurrency(
	//     @Body() createLangunageDto:CreateLangunageDto
	// ){
	//     return "API is pending";
	// }

	@Roles(Role.SUPER_ADMIN)
	@UseGuards(AuthGuard(), RolesGuard)
	@ApiOperation({ summary: "Update langunage by super admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Put("/:id")
	async updateCurrency(
		@Param("id") id: number,

		@Body() updateLangunageDto: UpdateLangunageDto,
		@GetUser() user: User
	):Promise<{ message : string}> {
        const adminId = user.userId;
		return await this.languageService.languageUpdate(id, updateLangunageDto,adminId);
	}

	// @Roles(Role.SUPER_ADMIN)
	// @UseGuards(AuthGuard(), RolesGuard)
	// @ApiOperation({ summary: "Change status by super admin" })
	// @ApiResponse({ status: 200, description: "Api success" })
	// @ApiResponse({ status: 422, description: "Bad Request or API error message" })
	// @ApiResponse({ status: 404, description: "Not Found" })
	// @ApiResponse({ status: 500, description: "Internal server error!" })
	// @Patch("/:id")
	// changeStatus(
	// 	@Param("id") id: number,
	// 	@Body() langunageStatusDto: LangunageStatusDto
	// ) {
	// 	return "API is pending";
	// }

	@Roles(Role.SUPER_ADMIN)
	@UseGuards(AuthGuard(), RolesGuard)
	@ApiOperation({ summary: "Delete langunage by super admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Delete("/:id")
	async deleteCurrency(@Param("id") id: number,@GetUser() user: User):Promise<{ message : string}> {
		const adminId = user.userId;
		return await this.languageService.languageDelete(id,adminId);
	}
}
