/*
 * Created on Tue May 12 2020
 *
 * @Auther:- Parth Virani
 * Copyright (c) 2020 Oneclick
 * my variables are ${myvar1} and ${myvar2}
 */

import { Controller, Post, Body, ValidationPipe, HttpCode, Put, UseGuards, Get, Query, UseInterceptors, Param } from '@nestjs/common';
import { AuthCredentialDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { User } from '../entity/user.entity';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { CreateUserDto } from './dto/crete-user.dto';
import { ForgetPasswordDto } from './dto/forget-paasword.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { SentryInterceptor } from 'src/sentry/sentry';
import { NewPasswordDto } from './dto/new-password.dto';
import { MobileAuthCredentialDto } from './dto/mobile-auth-credentials.dto';

@ApiTags("Auth")
@Controller('auth')
@UseInterceptors(SentryInterceptor)
export class AuthController {
    constructor(
        private authService: AuthService
    ) { }

    @Post('/signup')
    @ApiOperation({ summary: "Signup frontend user" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 400, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not found!' })
    @ApiResponse({ status: 409, description: 'User Already Exist' })
    @ApiResponse({ status: 500, description: 'Internal server error!' })
    @HttpCode(200)
    signUp(
        @Body(ValidationPipe) createUser: CreateUserDto
    ): Promise<User> {

        return this.authService.signUp(createUser)
    }

    @Post(['signin'])
    @ApiOperation({ summary: "Web Sign in without using social media" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 400, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not found!' })
    @ApiResponse({ status: 409, description: 'User Already Exist' })
    @ApiResponse({ status: 500, description: 'Internal server error!' })
    @HttpCode(200)
    async signIn(
        @Body(ValidationPipe) authCredentialDto: AuthCredentialDto
    ) {

        const result = await this.authService.validateUserPassword(authCredentialDto);
        return result
    }

	@Post(["mobile-signin"])
    @ApiOperation({ summary: "Mobile Sign in without social media" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 401, description: "Please login to continue." })
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 409, description: "User Already Exist" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@ApiResponse({ status: 403, description: "Forbidden, The user does not have access." })
	@HttpCode(200)
	async mobileSignIn(@Body(ValidationPipe) mobileAuthCredentialDto: MobileAuthCredentialDto) {
		const result = await this.authService.validateUserPasswordMobile(mobileAuthCredentialDto);
		return result;
	}

    @Post('forget-password')
    @ApiOperation({ summary: "Forgot password of user" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 400, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not found!' })
    @ApiResponse({ status: 409, description: 'User Already Exist' })
    @ApiResponse({ status: 500, description: 'Internal server error!' })
    @HttpCode(200)
    async forgetPassword(
        @Body(ValidationPipe) forgetPasswordDto: ForgetPasswordDto
    ) {
        await this.authService.forgetPassword(forgetPasswordDto);
    }

    @ApiOperation({ summary: "Reset password of user" })
	@Post("reset-password/:token")
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 401, description: "Please login to continue." })
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 409, description: "User Already Exist" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
    @ApiResponse({ status: 403, description: "Forbidden, The user does not have access." })
    @HttpCode(200)
	async updatePassword(@Param(ValidationPipe) updatePasswordDto: UpdatePasswordDto, @Body(ValidationPipe) newPasswordDto: NewPasswordDto) {
		return this.authService.updatePassword(updatePasswordDto, newPasswordDto);
	}

	@Post("/logout/:id")
    @ApiOperation({ summary: "Logout from mobile app" })
	@HttpCode(200)
	@ApiResponse({ status: 200, description: "Api success, [Logged out successfully]" })
	@ApiResponse({ status: 401, description: "Please login to continue." })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "User Details not found!, [Invalid user id! Please enter correct user id]" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async logout(@Param("id") id: string): Promise<any> {
		return this.authService.logout(id);
	}
}
