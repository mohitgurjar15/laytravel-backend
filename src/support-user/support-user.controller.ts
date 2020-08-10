import {
	Controller,
	UseGuards,
	Post,
	HttpCode,
	Body,
	ValidationPipe,
	Param,
	Put,
	Delete,
	Get,
	Query,
	UseInterceptors,
	UploadedFiles,
	Req,
	BadRequestException,
} from "@nestjs/common";
import {
	ApiTags,
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiConsumes,
} from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/guards/role.guard";
import { SupportUserService } from "./support-user.service";
import { Role } from "src/enum/role.enum";
import { Roles } from "src/guards/role.decorator";
import { SaveUserDto } from "src/user/dto/save-user.dto";
import { GetUser } from "src/auth/get-user.dacorator";
import { User } from "@sentry/node";
import { UpdateUserDto } from "src/user/dto/update-user.dto";
import { ListUserDto } from "src/user/dto/list-user.dto";
import { SaveSupporterDto } from "./dto/save-supporter.dto";
import { UpdateSupporterDto } from "./dto/update-supporter.dto";
import { ListSupporterDto } from "./dto/list-suppoerter.dto";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { editFileName, imageFileFilter } from "../auth/file-validator";
import { ProfilePicDto } from "../auth/dto/profile-pic.dto";
import { SiteUrl } from "src/decorator/site-url.decorator";

@Controller("support-user")
// @ApiTags("Support-User")
@ApiBearerAuth()
@UseGuards(AuthGuard(), RolesGuard)
export class SupportUserController {
	// constructor(private supportUserService: SupportUserService) {}

	// @Post()
	// @Roles(Role.SUPER_ADMIN, Role.ADMIN)
	// @ApiConsumes("multipart/form-data")
	// @ApiOperation({ summary: "Create new support user by  admin" })
	// @ApiResponse({ status: 200, description: "Api success" })
	// @ApiResponse({ status: 422, description: "Bad Request or API error message" })
	// @ApiResponse({
	// 	status: 403,
	// 	description: "You are not allowed to access this resource.",
	// })
	// @ApiResponse({ status: 404, description: "User not found!" })
	// @ApiResponse({ status: 500, description: "Internal server error!" })
	// @HttpCode(200)
	// @UseInterceptors(
	// 	FileFieldsInterceptor([{ name: "profile_pic", maxCount: 1 }], {
	// 		storage: diskStorage({
	// 			destination: "./assets/profile",
	// 			filename: editFileName,
	// 		}),
	// 		fileFilter: imageFileFilter,
	// 		limits: { fileSize: 2097152 },
	// 	})
	// )
	// async createUser(
	// 	@Body() saveSupporterDto: SaveSupporterDto,
	// 	@GetUser() user: User,
	// 	@UploadedFiles() files: ProfilePicDto,
	// 	@Req() req
	// ) {
	// 	if (req.fileValidationError) {
	// 		throw new BadRequestException(`${req.fileValidationError}`);
	// 	}
	// 	const adminId = user.userId;
	// 	return await this.supportUserService.createSupportUser(saveSupporterDto,files,adminId);
	// }

	// /**
	//  * Update suppoerter admin
	//  * @param updateUserDto
	//  * @param user_id
	//  */
	// @Put("/:id")
	// @Roles(Role.SUPER_ADMIN, Role.ADMIN)
	// @ApiConsumes("multipart/form-data")
	// @ApiOperation({ summary: "Update Support user by Admin" })
	// @ApiResponse({ status: 200, description: "Api success" })
	// @ApiResponse({ status: 422, description: "Bad Request or API error message" })
	// @ApiResponse({
	// 	status: 403,
	// 	description: "You are not allowed to access this resource.",
	// })
	// @ApiResponse({ status: 404, description: "User not found!" })
	// @ApiResponse({ status: 500, description: "Internal server error!" })
	// @UseInterceptors(
	// 	FileFieldsInterceptor([{ name: "profile_pic", maxCount: 1 }], {
	// 		storage: diskStorage({
	// 			destination: "./assets/profile",
	// 			filename: editFileName,
	// 		}),
	// 		fileFilter: imageFileFilter,
	// 		limits: { fileSize: 2097152 },
	// 	})
	// )
	// async updateUser(
	// 	@Body(ValidationPipe) updateSupporterDto: UpdateSupporterDto,
	// 	@Param("id") user_id: string,
	// 	@GetUser() user: User,
	// 	@UploadedFiles() files: ProfilePicDto,
	// 	@Req() req
	// ) {
	// 	if (req.fileValidationError) {
	// 		throw new BadRequestException(`${req.fileValidationError}`);
	// 	}
	// 	const adminId = user.userId;
	// 	return await this.supportUserService.updateSupportUser(
	// 		updateSupporterDto,
	// 		user_id,
	// 		files,
	// 		adminId
	// 	);
	// }

	// /**
	//  * delete supporter
	//  * @param user_id
	//  */
	// @Delete(":id")
	// @Roles(Role.SUPER_ADMIN, Role.ADMIN)
	// @ApiOperation({ summary: "Delete support user  by admin" })
	// @ApiResponse({ status: 200, description: "Api success" })
	// @ApiResponse({ status: 422, description: "Bad Request or API error message" })
	// @ApiResponse({
	// 	status: 403,
	// 	description: "You are not allowed to access this resource.",
	// })
	// @ApiResponse({ status: 404, description: "User not found!" })
	// @ApiResponse({ status: 500, description: "Internal server error!" })
	// async deleteUser(@Param("id") user_id: string) {
	// 	return await this.supportUserService.deleteSupportUser(user_id);
	// }

	// /**
	//  * list of supporter
	//  * @param paginationOption
	//  */
	// @Get()
	// @Roles(Role.SUPER_ADMIN, Role.ADMIN)
	// @ApiOperation({ summary: "List support user by Admin" })
	// @ApiResponse({ status: 200, description: "Api success" })
	// @ApiResponse({ status: 422, description: "Bad Request or API error message" })
	// @ApiResponse({
	// 	status: 403,
	// 	description: "You are not allowed to access this resource.",
	// })
	// @ApiResponse({ status: 404, description: "User not found!" })
	// @ApiResponse({ status: 500, description: "Internal server error!" })
	// async listAdmin(
	// 	@Query() paginationOption: ListSupporterDto,@SiteUrl() siteUrl:string,
	// ): Promise<{ data: User[]; TotalReseult: number }> {
	// 	return await this.supportUserService.listSupportUser(paginationOption,siteUrl);
	// }

	// /**
	//  * export supporter
	//  */
	// @Get('export')
	// @Roles(Role.SUPER_ADMIN, Role.ADMIN)
	// @ApiOperation({ summary: "export support user by admin" })
	// @ApiResponse({ status: 200, description: "Api success" })
	// @ApiResponse({ status: 422, description: "Bad Request or API error message" })
	// @ApiResponse({
	// 	status: 403,
	// 	description: "You are not allowed to access this resource.",
	// })
	// @ApiResponse({ status: 404, description: "User not found!" })
	// @ApiResponse({ status: 500, description: "Internal server error!" })
	// async exportSuppoerter(
	// ): Promise<{ data: User[]}> {
	// 	return await this.supportUserService.exportSupporter();
	// }
}
