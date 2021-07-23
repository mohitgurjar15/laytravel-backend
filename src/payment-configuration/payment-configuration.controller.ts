import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { query } from 'express';
import { GetUser } from 'src/auth/get-user.dacorator';
import { Role } from 'src/enum/role.enum';
import { Roles } from 'src/guards/role.decorator';
import { RolesGuard } from 'src/guards/role.guard';
import { GetPaymentConfigurationDto } from './dto/get-payment-config.dto';
import { UpdatePaymentConfigurationDto } from './dto/update-payment-config.dto';
import { PaymentConfigurationService } from './payment-configuration.service';

@ApiTags("Payment Configuration")
@ApiHeader({
    name: "referral_id",
    description: "landing page id",
    example: "",
})
@Controller('payment-configuration')
export class PaymentConfigurationController {
    constructor(private paymentConfigurationService: PaymentConfigurationService) { }

    @Post()
    @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @ApiOperation({ summary: "Update payment config" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({ status: 401, description: "Unauthorized access" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @HttpCode(200)
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async saveUserCard(
        @Body() updatePaymentConfigurationDto: UpdatePaymentConfigurationDto,
        @GetUser() user,
    ) {
        return await this.paymentConfigurationService.updatePaymentConfig(
            updatePaymentConfigurationDto, user
        );
    }

    @Get()
    @ApiOperation({ summary: "Get payment config" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({ status: 401, description: "Unauthorized access" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async listUserCard(@Query() getPaymentConfigurationDto: GetPaymentConfigurationDto) {
        return await this.paymentConfigurationService.getPaymentConfig(getPaymentConfigurationDto);
    }

    @Get(`days-config`)
    @ApiOperation({ summary: "Get payment config" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({ status: 401, description: "Unauthorized access" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async daysConfig() {
        return await this.paymentConfigurationService.getDaysConfig();
    }
}

