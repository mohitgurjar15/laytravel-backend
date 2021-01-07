import { Body, Controller, Get, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from 'src/enum/role.enum';
import { Roles } from 'src/guards/role.decorator';
import { Detail } from 'src/hotel/hotel-suppliers/priceline/modules/detail';
import { PushNotification } from 'src/utility/push-notification.utility';
import { WebNotification } from 'src/utility/web-notification.utility';
import { PushNotificationDto } from './dto/push-notification.dto';
import { MassCommunicationDto } from './dto/send-mass-communication.dto';
import { WebNotificationDto } from './dto/web-notification.dto';
import { GeneralService } from './general.service';

@ApiTags("Generic")
@Controller('generic')
export class GeneralController {

    constructor(
        private generalService: GeneralService
    ) {

    }

    @ApiOperation({ summary: "Get All country" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not found!' })
    @ApiResponse({ status: 409, description: 'User Already Exist' })
    @ApiResponse({ status: 500, description: 'Internal server error!' })
    @Get('country')
    async getCountry() {
        return await this.generalService.getAllCountry();
    }

    @ApiOperation({ summary: "Get country details" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not found!' })
    @ApiResponse({ status: 500, description: 'Internal server error!' })
    @Get('country/:id')
    async getCountryDetails(
        @Param('id') id: number
    ) {
        return await this.generalService.getCountryDetails(id);
    }

    @ApiOperation({ summary: "Get state by country id" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not found!' })
    @ApiResponse({ status: 500, description: 'Internal server error!' })
    @Get('country/:id/state')
    async getState(
        @Param('id') id: number
    ) {
        return await this.generalService.getStates(id);
    }

    @ApiOperation({ summary: "Get state details" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not found!' })
    @ApiResponse({ status: 500, description: 'Internal server error!' })
    @Get('state/:id')
    async getStateDetails(
        @Param('id') id: number
    ) {
        return await this.generalService.getStateDetails(id);
    }

    @ApiOperation({ summary: "User Location" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not found!' })
    @ApiResponse({ status: 500, description: 'Internal server error!' })
    @Get('location')
    async getUserLocation(
        @Req() req
    ) {
        return await this.generalService.getUserLocation(req);
    }

    @ApiOperation({ summary: "push notification" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not found!' })
    @ApiResponse({ status: 500, description: 'Internal server error!' })
    @Post('push-notification')
    async pusTest(
        @Body() detail: PushNotificationDto
    ) {
        const { userId, body, header } = detail
        PushNotification.sendNotificationTouser(userId, body, header, userId)
        return { message: `Notification send succesfully` }
    }

    @ApiOperation({ summary: "web notification" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not found!' })
    @ApiResponse({ status: 500, description: 'Internal server error!' })
    @Post('web-notification')
    async webtest(
        @Body() detail: WebNotificationDto
    ) {
        try {
            const { userId, body, header, action } = detail
            await WebNotification.sendNotificationTouser(userId, body, header, userId, action)
            return { message: `Notification send succesfully` }
        } catch (error) {
            console.log(error);

        }

    }

    @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SUPPORT)
    @Post(["mass-communication"])
    @ApiBearerAuth()
    @UseGuards(AuthGuard())
    @ApiOperation({ summary: "Mass communicartion" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({ status: 422, description: "Bad Request or API error message" })
    @ApiResponse({ status: 406, description: "Please Verify Your Email Id" })
    @ApiResponse({ status: 401, description: "Invalid Login credentials." })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async massCommunication(
        @Body() dto: MassCommunicationDto
    ) {
        return await this.generalService.massCommunication(
            dto
        );
    }
}
