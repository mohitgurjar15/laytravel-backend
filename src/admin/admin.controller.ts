/*
 * Created on Mon Jul 06 2020
 *
 * @Auther:- Parth Virani
 * Copyright (c) 2020 Oneclick
 * my variables are ${myvar1} and ${myvar2}
 */

import {
	Controller,
	UseGuards,
	HttpCode,
	Post,
	Body,
	Put,
	ValidationPipe,
	Param,
	Delete,
	Query,
	Get,
	UseInterceptors,
	UploadedFiles,
	Req,
	BadRequestException,
	Patch,
	NotFoundException,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { RolesGuard } from "src/guards/role.guard";
import { AuthGuard } from "@nestjs/passport";
import {
	ApiBearerAuth,
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiConsumes,
} from "@nestjs/swagger";
import { Roles } from "src/guards/role.decorator";
import { GetUser } from "src/auth/get-user.dacorator";
import { SaveUserDto } from "src/user/dto/save-user.dto";
import { User } from "@sentry/node";
import { Role } from "src/enum/role.enum";
import { UpdateUserDto } from "src/user/dto/update-user.dto";
import { ListUserDto } from "src/user/dto/list-user.dto";
import { SaveAdminDto } from "./dto/save-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { ListAdminDto } from "./dto/list-admin.dto";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import {
	editFileName,
	imageFileFilter,
	csvFileFilter,
} from "../auth/file-validator";
import { ProfilePicDto } from "../auth/dto/profile-pic.dto";
import { SiteUrl } from "src/decorator/site-url.decorator";
import { statusPipe } from "src/user/pipes/status.pipes";
import { ActiveDeactiveDto } from "src/user/dto/active-deactive-user.dto";
import { ImportUserDto } from "src/user/dto/import-user.dto";
import { csvFileDto } from "src/user/dto/csv-file.dto";
import { Activity } from "src/utility/activity.utility";

@Controller("admin")
@ApiTags("Admin")
@ApiBearerAuth()
@UseGuards(AuthGuard(), RolesGuard)
export class AdminController {
	constructor(private adminService: AdminService) {}

	/**
	 * create a sub admin
	 * @param saveUserDto
	 * @param user
	 */
	@Post()
	@Roles(Role.SUPER_ADMIN)
	@ApiConsumes("multipart/form-data")
	@ApiOperation({ summary: "Create new Admin by Super admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Admin not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@HttpCode(200)
	@UseInterceptors(
		FileFieldsInterceptor([{ name: "profile_pic", maxCount: 1 }], {
			storage: diskStorage({
				destination: "./assets/profile",
				filename: editFileName,
			}),
			fileFilter: imageFileFilter,
			limits: { fileSize: 2097152 },
		})
	)
	async createAdmin(
		@Body() saveAdminDto: SaveAdminDto,
		@GetUser() user: User,
		@UploadedFiles() files: ProfilePicDto,
		@Req() req
	) {
		if (req.fileValidationError) {
			throw new BadRequestException(`${req.fileValidationError}`);
		}
		const adminId = user.userId;
		return await this.adminService.createAdmin(saveAdminDto, files, adminId);
	}
	/**
	 * Update sub admin
	 * @param updateUserDto
	 * @param user_id
	 */
	@Put("/:id")
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiConsumes("multipart/form-data")
	@ApiOperation({ summary: "Update Admin by Super-Admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Admin not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@UseInterceptors(
		FileFieldsInterceptor([{ name: "profile_pic", maxCount: 1 }], {
			storage: diskStorage({
				destination: "./assets/profile",
				filename: editFileName,
			}),
			fileFilter: imageFileFilter,
			limits: { fileSize: 2097152 },
		})
	)
	async updateAdmin(
		@Body(ValidationPipe) updateAdminDto: UpdateAdminDto,
		@Param("id") user_id: string,
		@UploadedFiles() files: ProfilePicDto,
		@GetUser() user: User,
		@Req() req
	) {
		if (req.fileValidationError) {
			throw new BadRequestException(`${req.fileValidationError}`);
		}
		const adminId = user.userId;
		return await this.adminService.updateAdmin(
			updateAdminDto,
			user_id,
			files,
			adminId
		);
	}

	/**
	 * delete admin
	 * @param user_id
	 */
	@Delete(":id")
	@Roles(Role.SUPER_ADMIN)
	@ApiOperation({ summary: "Delete admin  by super admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Admin not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async deleteAdmin(@Param("id") user_id: string,@GetUser() user: User) {
		const adminId = user.userId;
		return await this.adminService.deleteAdmin(user_id,adminId);
	}

	@Patch("active-deactive-admin/:id")
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "Active-deactive admin by super admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Admin not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async activeAdmin(
		@Param("id") user_id: string,
		@Body(statusPipe) activeDeactiveDto: ActiveDeactiveDto,
		@GetUser() user: User
	) {
		const adminId = user.userId;

		
		return await this.adminService.activeDeactiveAdmin(
			user_id,
			activeDeactiveDto,
			adminId
		);
	}
	/**
	 *
	 * @param paginationOption
	 */
	@Get()
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "List admin by Super-Admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Admin not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async listAdmin(
		@Query() paginationOption: ListAdminDto,
		@SiteUrl() siteUrl: string
	): Promise<{ data: User[]; TotalReseult: number }> {
		return await this.adminService.listAdmin(paginationOption, siteUrl);
	}

	@Get("/:id")
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "Get admin details by super admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Admin not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async getAdminData(
		@Param("id") userId: string,
		@SiteUrl() siteUrl: string
	): Promise<User> {
		return await this.adminService.getAdminData(userId, siteUrl);
	}
	/**
	 * Get count of user base on status
	 *
	 */
	@Get("report/counts")
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "counts Of all admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Admin not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async getCount(): Promise<{ result: any }> {
		return await this.adminService.getCounts();
	}

	/**
	 * return count of user ragister in current weak
	 */

	@Get("report/weekly-register")
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "Count of register admin in current week" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Admin not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async weeklyRagisterAdmin(): Promise<{ count: number }> {
		console.log("week");

		return await this.adminService.weeklyRegisterAdmin();
	}

	/**
	 * export admin
	 */
	@Get("report/export")
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "export admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Admin not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async exportAdmin(@GetUser() user: User): Promise<{ data: User[] }> {
		const userId = user.userId;
		return await this.adminService.exportAdmin(userId);
	}

	@Post("report/import")
	@ApiConsumes("multipart/form-data")
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "import admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@UseInterceptors(
		FileFieldsInterceptor([{ name: "file", maxCount: 1 }], {
			storage: diskStorage({
				destination: "./assets/otherfiles",
				filename: editFileName,
			}),
			fileFilter: csvFileFilter,
		})
	)
	async importUser(
		@Body() importUserDto: ImportUserDto,
		@UploadedFiles() files: csvFileDto,
		@Req() req,
		@GetUser() user: User,
		@SiteUrl() siteUrl: string
	) {
		if (req.fileValidationError) {
			throw new BadRequestException(`${req.fileValidationError}`);
		}
		if (typeof files.file[0] == "undefined") {
			throw new NotFoundException(`file is not available&&&file`);
		}
		const userId = user.userId;
		const file = files.file;

		return await this.adminService.importAdmin(
			importUserDto,
			file,
			userId,
			siteUrl
		);
	}
}
