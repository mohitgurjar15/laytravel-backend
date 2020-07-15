import { Controller,  Body, UseGuards, Param, Put, ValidationPipe, Get, Query, HttpStatus, HttpCode, Post, Delete, UseInterceptors, UploadedFiles, Req, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../entity/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ListUserDto } from './dto/list-user.dto';
import { GetUser } from 'src/auth/get-user.dacorator';
import { SaveUserDto } from './dto/save-user.dto';
import { Roles } from 'src/guards/role.decorator';
import { RolesGuard } from 'src/guards/role.guard';
import { Role } from 'src/enum/role.enum';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from "multer";
import { editFileName, imageFileFilter } from '../auth/file-validator';
import { ProfilePicDto } from '../auth/dto/profile-pic.dto';
import { SiteUrl } from 'src/decorator/site-url.decorator';

@ApiTags('User')
@Controller('user')
@ApiBearerAuth()
@UseGuards(AuthGuard(),RolesGuard)
export class UserController {

    constructor(
        private userService: UserService
    ) { }

    @Get()
    @Roles(Role.SUPER_ADMIN,Role.ADMIN)
    @ApiOperation({ summary: "List user by admin" })
    @ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 403, description: "You are not allowed to access this resource." })
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
    async listUser(
        @Query() paginationOption: ListUserDto,
        @SiteUrl() siteUrl:string,
    ): Promise<{data:User[], TotalReseult:number}> {
        return await this.userService.listUser(paginationOption,siteUrl);
    }

    @Get('/:id')
    @Roles(Role.SUPER_ADMIN,Role.ADMIN)
    @ApiOperation({ summary: "Get user details by admin" })
    @ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 403, description: "You are not allowed to access this resource." })
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
    async getUserData(
        @Param('id') userId: string
    ): Promise<User> {
        return await this.userService.getUserData(userId);
    }

    @Post()
    @Roles(Role.SUPER_ADMIN,Role.ADMIN)
    @ApiConsumes("multipart/form-data")
    @ApiOperation({ summary: "Create new user by admin" })
    @ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 403, description: "You are not allowed to access this resource." })
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    @UseInterceptors(
		FileFieldsInterceptor(
			[
				{ name: "profile_pic", maxCount: 1 }
			],
			{
				storage: diskStorage({
					destination: "./assets/profile",
					filename: editFileName,
				}),
				fileFilter: imageFileFilter,
				limits:{fileSize:2097152}
			},
		),
	)
    async createUser(
        @Body() saveUserDto:SaveUserDto,
        @UploadedFiles() files: ProfilePicDto,
        @Req() req,
        @GetUser() user:User
    ){
        if (req.fileValidationError) {
			throw new BadRequestException(`${req.fileValidationError}`);
        }
        console.log("user",user)
        const userId = user.userId;
        return await this.userService.create(saveUserDto,files,userId)
    }


    @Put('/:id')
    @Roles(Role.SUPER_ADMIN,Role.ADMIN)
    @ApiConsumes("multipart/form-data")
    @ApiOperation({ summary: "Update user by admin" })
    @ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 403, description: "You are not allowed to access this resource." })
	@ApiResponse({ status: 404, description: "User not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @UseInterceptors(
		FileFieldsInterceptor(
			[
				{ name: "profile_pic", maxCount: 1 }
			],
			{
				storage: diskStorage({
					destination: "./assets/profile",
					filename: editFileName,
				}),
				fileFilter: imageFileFilter,
				limits:{fileSize:2097152}
			},
		),
	)
    async updateUser(
        @Body(ValidationPipe) updateUserDto: UpdateUserDto,
        @Param('id') user_id: string,
        @GetUser() user:User,
        @UploadedFiles() files: ProfilePicDto,
		@Req() req,
    ){
        if (req.fileValidationError) {
			throw new BadRequestException(`${req.fileValidationError}`);
        }
        const adminId = user.userId;
        return await this.userService.updateUser(updateUserDto,user_id,files,adminId);
    }

    @Put('change-password')
    @ApiOperation({ summary: "Change user password" })
    @ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 403, description: "You are not allowed to access this resource." })
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
    @Roles(Role.SUPER_ADMIN,Role.ADMIN)
    @ApiOperation({ summary: "Delete user by admin" })
    @ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 403, description: "You are not allowed to access this resource." })
	@ApiResponse({ status: 404, description: "User not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async deleteUser(
        @Param('id') user_id:string
    ){
        return await this.userService.deleteUser(user_id);
    }

    /**
	 * export Customer
	 */
	@Get('export')
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "export customer" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async exportCustomer(
	): Promise<{ data: User[]}> {
		return await this.userService.exportUser();
	}
}
