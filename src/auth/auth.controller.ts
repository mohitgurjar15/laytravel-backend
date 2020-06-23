/*
 * Created on Tue May 12 2020
 *
 * @Auther:- Parth Virani
 * Copyright (c) 2020 Oneclick
 * my variables are ${myvar1} and ${myvar2}
 */

import { Controller, Post, Body, ValidationPipe, HttpCode, Put, UseGuards, Get, Query, UseInterceptors } from '@nestjs/common';
import { AuthCredentialDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { User } from '../entity/user.entity';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/crete-user.dto';
import { ForgetPasswordDto } from './dto/forget-paasword.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { query } from 'express';
import { SentryInterceptor } from 'src/sentry/sentry';


@Controller('auth')
@UseInterceptors(SentryInterceptor)
export class AuthController {
    constructor(
        private authService: AuthService
    ) { }

    @Post('/signup')
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

    @Post('forget-password')
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


    @Get('forget-password')
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 400, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not found!' })
    @ApiResponse({ status: 409, description: 'User Already Exist' })
    @ApiResponse({ status: 500, description: 'Internal server error!' })
    async updatePassword(
        @Query(ValidationPipe) updatePasswordDto: UpdatePasswordDto
    ) {
        await this.authService.updatePassword(updatePasswordDto);
    }

}
