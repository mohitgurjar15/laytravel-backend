import { Controller, UseGuards, Post, HttpCode, Body, ValidationPipe, Param, Put, Delete, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guards/role.guard';
import { SupportUserService } from './support-user.service';
import { Role } from "src/enum/role.enum";
import { Roles } from 'src/guards/role.decorator';
import { SaveUserDto } from 'src/user/dto/save-user.dto';
import { GetUser } from 'src/auth/get-user.dacorator';
import { User } from '@sentry/node';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { ListUserDto } from 'src/user/dto/list-user.dto';
import { SaveSupporterDto } from './dto/save-supporter.dto';
import { UpdateSupporterDto } from './dto/update-supporter.dto';
import { ListSupporterDto } from './dto/list-suppoerter.dto';

@Controller('support-user')
@ApiTags("Support-User")
@ApiBearerAuth()
@UseGuards(AuthGuard(), RolesGuard)
export class SupportUserController {
    constructor(private supportUserService: SupportUserService) {}

    @Post()
	@Roles(Role.SUPER_ADMIN,Role.ADMIN)
	@ApiOperation({ summary: "Create new support-user by  admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 403, description: "You are not allowed to access this resource." })
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@HttpCode(200)
	async createUser(@Body() saveSupporterDto: SaveSupporterDto, @GetUser() user: User) {
		return await this.supportUserService.createSupportUser(saveSupporterDto);
    }
    
    /**
     * Update User and admin 
     * @param updateUserDto 
     * @param user_id 
     */
	@Put("/:id")
	@Roles(Role.SUPER_ADMIN,Role.ADMIN)
	@ApiOperation({ summary: "Update Support user by Admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 403, description: "You are not allowed to access this resource." })
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async updateUser(
		@Body(ValidationPipe) updateSupporterDto: UpdateSupporterDto,
		@Param("id") user_id: string
	) {
		return await this.supportUserService.updateSupportUser(updateSupporterDto, user_id);
    }
    

    /**
	 * delete supporter
	 * @param user_id
	 */
	@Delete(":id")
	@Roles(Role.SUPER_ADMIN,Role.ADMIN)
	@ApiOperation({ summary: "Delete support user  by admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 403, description: "You are not allowed to access this resource." })
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async deleteUser(@Param("id") user_id: string) {
		return await this.supportUserService.deleteSupportUser(user_id);
	}

    /**
     * list of supporter
     * @param paginationOption 
     */
	@Get()
	@Roles(Role.SUPER_ADMIN,Role.ADMIN)
    @ApiOperation({ summary: "List support user by Admin" })
    @ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 403, description: "You are not allowed to access this resource." })
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
    async listAdmin(
        @Query() paginationOption: ListSupporterDto,
    ): Promise<{data:User[], TotalReseult:number}> {
        return await this.supportUserService.listSupportUser(paginationOption);
    }
}
