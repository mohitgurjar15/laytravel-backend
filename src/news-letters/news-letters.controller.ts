import { Controller, UseGuards, Post, HttpCode, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { NewsLettersService } from './news-letters.service';
import { SubscribeForNewslatterDto } from './dto/subscribe-for-newslatter.dto';

@Controller('news-letters')
@ApiTags("News Letters")
// @ApiBearerAuth()
// @UseGuards(AuthGuard())
export class NewsLettersController {
    constructor(private newsLettersService:NewsLettersService) {}

    @Post("subscribe")
	@ApiOperation({ summary: "subscribe email id for news updates" })
	@HttpCode(200)
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 406, description: "Please Verify Your Email Id" })
	@ApiResponse({
		status: 404,
		description: "not found",
	})
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async subscribeForNewsLetters(@Body() subscribeForNewslatterDto:SubscribeForNewslatterDto): Promise<any> {
		return await this.newsLettersService.subscribeForNewsLetters(subscribeForNewslatterDto);
	}

	@Patch("unsubscribe")
	@ApiOperation({ summary: "Unsubscribe email id from news updates" })
	@HttpCode(200)
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 406, description: "Please Verify Your Email Id" })
	@ApiResponse({
		status: 404,
		description: "not found",
	})
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async unSubscribeForNewsLetters(@Body() subscribeForNewslatterDto:SubscribeForNewslatterDto): Promise<any> {
		return await this.newsLettersService.unSubscribeForNewsLetters(subscribeForNewslatterDto);
	}
}
