import { Controller,  Body, UseGuards, Param, Put, ValidationPipe, Get, Query, HttpStatus, HttpCode, Post, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../entity/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ListUserDto } from './dto/list-user.dto';
import { GetUser } from 'src/auth/get-user.dacorator';
import { SaveUserDto } from './dto/save-user.dto';
import { Roles } from 'src/guards/role.decorator';
import { RolesGuard } from 'src/guards/role.guard';
import { Role } from 'src/enum/role.enum';

@ApiTags('User')
@Controller('user')
@ApiBearerAuth()
@UseGuards(AuthGuard(),RolesGuard)
export class UserController {

    constructor(
        private userService: UserService
    ) { }

    @Get()
    @ApiOperation({ summary: "List user by admin" })
    @ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 401, description: "Invalid Login credentials." })
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
    async listUser(
        @Query() paginationOption: ListUserDto,
    ): Promise<{data:User[], TotalReseult:number}> {
        return await this.userService.listUser(paginationOption);
    }

    @Get('/:id')
    @ApiOperation({ summary: "Get user details by admin" })
    @ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 401, description: "Invalid Login credentials." })
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
    async getUserData(
        @Param('id') userId: string
    ): Promise<User> {
        return await this.userService.getUserData(userId);
    }

    @Post()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: "Create new user by admin" })
    @ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 401, description: "Invalid Login credentials." })
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async createUser(
        @Body() saveUserDto:SaveUserDto,
        @GetUser() user:User
    ){

        console.log("user",user)
        return await this.userService.create(saveUserDto)
    }


    @Put('/:id')
    @ApiOperation({ summary: "Update user by admin" })
    @ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 401, description: "Invalid Login credentials." })
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
    async updateUser(
        @Body(ValidationPipe) updateUserDto: UpdateUserDto,
        @Param('id') user_id: string
    ){
        return await this.userService.updateUser(updateUserDto,user_id);
    }

    @Put('change-password')
    @ApiOperation({ summary: "Change user password" })
    @ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 401, description: "Invalid Login credentials." })
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
    async changePassword(
        @Body(ValidationPipe) changePasswordDto: ChangePasswordDto,
        @GetUser() user: User,
    ){
        const userId = user.userId
        return await this.userService.changePassword(changePasswordDto, userId);
    }

    @Delete(':id')
    @ApiOperation({ summary: "Delete user by admin" })
    @ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 401, description: "Invalid Login credentials." })
	@ApiResponse({ status: 404, description: "User not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async deleteUser(
        @Param('id') user_id:string
    ){

        return await this.userService.deleteUser(user_id);
    }

}