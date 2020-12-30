import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { getLanguage } from 'src/get-language.decorator';
import { Detail } from 'src/hotel/hotel-suppliers/priceline/modules/detail';
import { PushNotification } from 'src/utility/push-notification.utility';
import { Translation } from 'src/utility/translation.utility';
import { WebNotification } from 'src/utility/web-notification.utility';
import { multiLangugeDemo } from './dto/multi-lang-demo.dto';
import { PushNotificationDto } from './dto/push-notification.dto';
import { WebNotificationDto } from './dto/web-notification.dto';
import { GeneralService } from './general.service';

@ApiTags("Generic")
@Controller('generic')
@ApiHeader({
    name: 'language',
    description: 'Enter language code(ex. en)',
})
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


    @ApiOperation({ summary: "test-case-for-multi-language" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not found!' })
    @ApiResponse({ status: 409, description: 'User Already Exist' })
    @ApiResponse({ status: 500, description: 'Internal server error!' })
    @Post('test-case-for-multi-language')
    async getaTranslation(
        @getLanguage() lang: string,
        @Body() multiLangugeDemo: multiLangugeDemo
    ) {
        if (multiLangugeDemo.is_exception) {
            return Translation.Translater(lang || 'en', 'error', multiLangugeDemo.variable)
        }
        return Translation.Translater(lang || 'en', 'responce', multiLangugeDemo.variable)
    }
}
