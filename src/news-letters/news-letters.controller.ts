import { Controller, UseGuards, Post, HttpCode, Patch, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { NewsLettersService } from './news-letters.service';
import { SubscribeForNewslatterDto } from './dto/subscribe-for-newslatter.dto';
import { ListSubscribeUsersDto } from './dto/list-subscribe-users.dto';
import { NewsLetters } from 'src/entity/news-letter.entity';

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


	@Get()
	@ApiOperation({ summary: "List Of subscribers" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async getSubscribers(
		@Query() paginationOption: ListSubscribeUsersDto
	): Promise<{ data: NewsLetters[]; TotalReseult: number }> {
		return await this.newsLettersService.listSubscriber(paginationOption);
	}
}
