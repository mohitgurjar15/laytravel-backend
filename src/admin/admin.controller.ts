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
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { RolesGuard } from "src/guards/role.guard";
import { AuthGuard } from "@nestjs/passport";
import {
	ApiBearerAuth,
	ApiTags,
	ApiOperation,
	ApiResponse,
} from "@nestjs/swagger";
import { Roles } from "src/guards/role.decorator";
import { GetUser } from "src/auth/get-user.dacorator";
import { SaveUserDto } from "src/user/dto/save-user.dto";
import { User } from "@sentry/node";
import { Role } from "src/enum/role.enum";
import { UpdateUserDto } from "src/user/dto/update-user.dto";

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
	@ApiOperation({ summary: "Create new Sub-Admin by Super admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 401, description: "Invalid Login credentials." })
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@HttpCode(200)
	async createUser(@Body() saveUserDto: SaveUserDto, @GetUser() user: User) {
		return await this.adminService.createAdmin(saveUserDto);
	}
    /**
     * Update User and admin 
     * @param updateUserDto 
     * @param user_id 
     */
	@Put("/:id")
	@Roles(Role.SUPER_ADMIN)
	@ApiOperation({ summary: "Update Sub-Admin by Super-Admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 401, description: "Invalid Login credentials." })
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async updateUser(
		@Body(ValidationPipe) updateUserDto: UpdateUserDto,
		@Param("id") user_id: string
	) {
		return await this.adminService.updateAdmin(updateUserDto, user_id);
	}

	/**
	 * delete All type of user using the Super Admin
	 * @param user_id
	 */
	@Delete(":id")
	@Roles(Role.SUPER_ADMIN)
	@ApiOperation({ summary: "Delete user and admin  by super admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 401, description: "Invalid Login credentials." })
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async deleteUser(@Param("id") user_id: string) {
		return await this.adminService.deleteAdmin(user_id);
	}
}
