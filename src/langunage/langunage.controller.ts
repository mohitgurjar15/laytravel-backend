import {
	Controller,
	Get,
	Param,
	UseGuards,
	Put,
	Body,
	Patch,
	Delete
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
import { LangunageService } from "./langunage.service";
import { Language } from "src/entity/language.entity";
import { GetUser } from "src/auth/get-user.dacorator";
import { User } from "@sentry/node";
import { UpdateLangunageDto } from "./dto/update-language.dto";
import { LanguageStatusDto } from "./dto/langugeEnableDisable.dto";

@ApiTags("Language")
@ApiBearerAuth()
@Controller("language")
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
		// @Query() paginationOption: ListLangugeDto
	): Promise<{ data: Language[]; }> {
		return await this.languageService.listLanguge();
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

	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN)
	@ApiOperation({ summary: "Update language by super admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Put("/:id")
	async languageUpdate(
		@Param("id") id: number,
		@Body() updateLangunageDto: UpdateLangunageDto,
		@GetUser() user: User
	):Promise<{ message : string}> {
        const adminId = user.userId;
		return await this.languageService.languageUpdate(id, updateLangunageDto,adminId);
	}



	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN)
	@ApiOperation({ summary: "Enable-Disable language by super admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Patch("enable-disable/:id")
	async changeLangugeStatus(
		@Param("id") id: number,
		@Body() languageStatusDto:LanguageStatusDto,
		@GetUser() user: User
	):Promise<{ message : string}> {
        
		return await this.languageService.changeLangugeStatus(id, languageStatusDto,user);
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

	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN)	
	@ApiOperation({ summary: "Delete language by super admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Delete("/:id")
	async languageDelete(@Param("id") id: number,@GetUser() user: User):Promise<{ message : string}> {
		const adminId = user.userId;
		return await this.languageService.languageDelete(id,adminId);
	}
}
