/*
 * Created on Tue May 12 2020
 *
 * @Auther:- Parth Virani
 * Copyright (c) 2020 Oneclick
 * my variables are ${myvar1} and ${myvar2}
 */

import { Controller, Post, Body, ValidationPipe, HttpCode, UseGuards, Get, UseInterceptors, Param, Put, UploadedFiles, Req, BadRequestException } from '@nestjs/common';
import { AuthCredentialDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { User } from '../entity/user.entity';
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { CreateUserDto } from './dto/crete-user.dto';
import { ForgetPasswordDto } from './dto/forget-paasword.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { SentryInterceptor } from 'src/sentry/sentry';
import { NewPasswordDto } from './dto/new-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MobileAuthCredentialDto } from './dto/mobile-auth-credentials.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { GetUser } from './get-user.dacorator';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { editFileName, imageFileFilter } from './file-validator';
import { ProfilePicDto } from './dto/profile-pic.dto';
import { SiteUrl } from 'src/decorator/site-url.decorator';
import { Role } from 'src/enum/role.enum';
import { I18nService } from 'nestjs-i18n';
import { ChangePasswordDto } from 'src/user/dto/change-password.dto';
@ApiTags("Auth")
@Controller('auth')
@UseInterceptors(SentryInterceptor)
export class AuthController {
    constructor(
		private authService: AuthService,
		private readonly i18n: I18nService
    ) { }

    @Post('/signup')
    @ApiOperation({ summary: "Signup frontend user" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not found!' })
    @ApiResponse({ status: 409, description: 'User Already Exist' })
    @ApiResponse({ status: 500, description: 'Internal server error!' })
    @HttpCode(200)
    signUp(
		@Body(ValidationPipe) createUser: CreateUserDto,
		@Req() req
    ){
        return this.authService.signUp(createUser,req)
    }

    @Post(['signin'])
    @ApiOperation({ summary: "Frontend Sign in without using social media" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 401, description: "Invalid Login credentials." })
    @ApiResponse({ status: 500, description: 'Internal server error!' })
    @HttpCode(200)
    async signIn(
		@Body(ValidationPipe) authCredentialDto: AuthCredentialDto,
		@SiteUrl() siteUrl:string,
		@Req() req
    ) {
		console.log(await this.i18n.translate('TEST'))
		const roles = [Role.FREE_USER, Role.PAID_USER];
        const result = await this.authService.validateUserPassword(authCredentialDto,siteUrl,roles,req);
        return result
    }

	@Post(["mobile-signin"])
    @ApiOperation({ summary: "Mobile Sign in without social media" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 401, description: "Invalid Login credentials." })
	@ApiResponse({ status: 409, description: "User Already Exist" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@ApiResponse({ status: 403, description: "Forbidden, The user does not have access." })
	@HttpCode(200)
	async mobileSignIn(
		@Body(ValidationPipe) mobileAuthCredentialDto: MobileAuthCredentialDto,
		@SiteUrl() siteUrl:string,
		@Req() req
	) {
		const roles = [Role.FREE_USER, Role.PAID_USER];
		const result = await this.authService.validateUserPasswordMobile(mobileAuthCredentialDto,siteUrl,req,roles);
		return result;
	}
	
	@Post(["backend-signin"])
    @ApiOperation({ summary: "Backend Sign in without social media" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 401, description: "Invalid Login credentials." })
	@ApiResponse({ status: 409, description: "User Already Exist" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@ApiResponse({ status: 403, description: "Forbidden, The user does not have access." })
	@HttpCode(200)
	async adminSignIn(
		@Body(ValidationPipe) authCredentialDto: AuthCredentialDto,
		@SiteUrl() siteUrl:string,
		@Req() req
    ) {
		const roles = [Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT, Role.SUPPLIER];
        const result = await this.authService.validateUserPassword(authCredentialDto,siteUrl,roles,req);
        return result
    }
    
    @Post(["social-login"])
    @ApiOperation({ summary: "Social Media signup & login" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 401, description: "Invalid Login credentials." })
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@ApiResponse({ status: 403, description: "Forbidden, The user does not have access." })
	@HttpCode(200)
	async socialLogin(
		@Body(ValidationPipe) socialLoginDto: SocialLoginDto,
		@Req() req
	) {
		const result = await this.authService.socialLogin(socialLoginDto,req);
		return result;
	}

    @Post('forget-password')
    @ApiOperation({ summary: "Forgot password of user" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not found!' })
    @ApiResponse({ status: 500, description: 'Internal server error!' })
    @HttpCode(200)
    async forgetPassword(
		@Body(ValidationPipe) forgetPasswordDto: ForgetPasswordDto,
		@SiteUrl() siteUrl:string
    ) {
        return await this.authService.forgetPassword(forgetPasswordDto,siteUrl);
    }

    @ApiOperation({ summary: "Reset password of user" })
	@Post("reset-password/:token")
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 401, description: "Invalid Login credentials." })
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
    @ApiResponse({ status: 403, description: "Forbidden, The user does not have access." })
    @HttpCode(200)
	async updatePassword(@Param(ValidationPipe) updatePasswordDto: UpdatePasswordDto, @Body(ValidationPipe) newPasswordDto: NewPasswordDto) {
		return this.authService.updatePassword(updatePasswordDto, newPasswordDto);
	}

	@Post("/logout/:id")
    @ApiOperation({ summary: "Logout from mobile app" })
	@HttpCode(200)
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "User Details not found!, [Invalid user id! Please enter correct user id]" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async logout(@Param("id") id: string): Promise<any> {
		return this.authService.logout(id);
    }
    
    @Get('/profile')
    @ApiOperation({ summary: "Get Profile Details" })
    @HttpCode(200)
    @ApiBearerAuth()
    @UseGuards(AuthGuard())
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 401, description: "Please login to continue." })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "User Details not found!, [Invalid user id! Please enter correct user id]" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async getProfile(
        @GetUser() user: User,
		@SiteUrl() siteUrl:string,
    ){
        return await this.authService.getProfile(user,siteUrl);
    }

   

	@Put("/profile")
	@ApiOperation({summary:"Update user profile"})
	@ApiConsumes("multipart/form-data")
	@ApiBearerAuth()
	@UseGuards(AuthGuard())
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 400, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not found!" })
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
	async updateProfile(
        @Body() updateProfileDto: UpdateProfileDto,
        @UploadedFiles() files: ProfilePicDto,
		@Req() req,
		@GetUser() user: User,
		@SiteUrl() siteUrl
	): Promise<User> {
		
		if (req.fileValidationError) {
			throw new BadRequestException(`${req.fileValidationError}`);
        }
        return await this.authService.updateProfile(updateProfileDto,user,files,siteUrl);
	}


	@Put('change-password')
	@ApiOperation({ summary: "Change user password" })
	@ApiBearerAuth()
	@UseGuards(AuthGuard())
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
        return await this.authService.changePassword(changePasswordDto, userId);
    }

	
}
