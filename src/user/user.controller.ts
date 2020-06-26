import { Controller,  Body, UseGuards, Param, Put, ValidationPipe, Get, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../entity/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ListUserDto } from './dto/list-user.dto';
import { OrderByEnum } from './orderby.enum';
import { OrderByPipe } from './pipes/orderBy.pipes'
import { GetUser } from 'src/auth/get-user.dacorator';

@ApiTags('User')
@Controller('user')
@ApiBearerAuth()
@UseGuards(AuthGuard())
export class UserController {

    constructor(
        private userService: UserService
    ) { }


    @Get()
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    
    async getUser(
        @GetUser() user: User
    ): Promise<User> {
        return user;
    }

    @Put()
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    async updateProfile(
        @Body(ValidationPipe) updateUserDto: UpdateUserDto,
        @GetUser() user: User
    ): Promise<void> {
        const userId = user.userId
        return await this.userService.updateProfile(updateUserDto, userId);
    }

    @Get('/:id')
    @ApiResponse({ status: 201, description: 'Api success' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 400, description: 'Bad Request or API error message' })
    async getUserData(
        @Param('id') userId: number
    ): Promise<User> {
        return await this.userService.getUserData(userId);
    }

    @Put('change-password')
    @ApiOperation({ summary: "Change user password" })
    @ApiResponse({ status: 200, description: "Api success, [Logged out successfully]" })
	@ApiResponse({ status: 401, description: "Please login to continue." })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "User Details not found!, [Invalid user id! Please enter correct user id]" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
    async changePassword(
        @Body(ValidationPipe) changePasswordDto: ChangePasswordDto,
        @GetUser() user: User,
    ){
        const userId = user.userId
        return await this.userService.changePassword(changePasswordDto, userId);
    }


    @Get('/:orderBy/listUser')
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    async listUser(
        @Query() paginationOption: ListUserDto,
        @Param('orderBy', OrderByPipe) orderBy: OrderByEnum
    ): Promise<{data:User[], TotalReseult:number}> {
        console.log(paginationOption);
        return await this.userService.listUser(paginationOption, orderBy);
    }
}
