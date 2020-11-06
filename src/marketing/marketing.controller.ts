import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/enum/role.enum';
import { Roles } from 'src/guards/role.decorator';
import { RolesGuard } from 'src/guards/role.guard';
import { ActiveInactiveGameMarkupDto } from './dto/active-inactive-game-markup.dto';
import { ActiveInactiveGameDto } from './dto/active-inactive-game.dto';
import { addRewordMarkupDto } from './dto/add-reword-markup.dto';
import { CreateGameDto } from './dto/new-game.dto';
import { CreateMarketingUserDto } from './dto/new-marketing-user.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { UpdateRewordMarkupDto } from './dto/update-reword-markup.dto';
import { MarketingService } from './marketing.service';
import { AddQuetionDto } from './dto/add-question-answer.dto';
import { QuizResultDto } from './dto/quiz-result.dto';
import { UpdateMarketingUserDto } from './dto/update-marketing-user.dto';

@Controller('marketing')
@ApiTags("Marketing")
@ApiBearerAuth()
export class MarketingController {
	constructor(private marketingService: MarketingService) { }
	/**
	 *
	 * @param paginationOption
	 */
	@Get('game')
	@ApiOperation({ summary: "List game" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async listGames() {
		return await this.marketingService.listGame();
	}

	@Get('game/:id')
	@ApiOperation({ summary: "get a game data with markup" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async getGame(@Param("id") id: number) {
		return await this.marketingService.getGameData(id);
	}

	// @Roles(Role.SUPER_ADMIN)
	// @UseGuards(AuthGuard(),RolesGuard)
	// @ApiOperation({ summary: "add new game"})
	// @ApiResponse({ status: 200, description: 'Api success' })
	// @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
	// @ApiResponse({ status: 500, description: "Internal server error!" })
	// @Post('game')
	// @HttpCode(200)
	// async addGame(
	//     @Body() createGameDto:CreateGameDto
	// ){
	// 	return await this.marketingService.addGame(createGameDto);
	// }

	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@UseGuards(AuthGuard(), RolesGuard)
	@ApiOperation({ summary: "Update Game by super admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Put("game/:id")
	async updateGame(
		@Param("id") id: number,
		@Body() updateGameDto: UpdateGameDto
	) {
		return await this.marketingService.updateGame(id, updateGameDto)
	}

	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@UseGuards(AuthGuard(), RolesGuard)
	@ApiOperation({ summary: "Change status of game by super admin" })
	@ApiResponse({ status: 200, description: 'Api success' })
	@ApiResponse({ status: 422, description: 'Bad Request or API error message' })
	@ApiResponse({ status: 404, description: 'Not Found' })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Patch('game/:id')
	async changeStatus(
		@Param('id') id: number,
		@Body() activeInactiveGameDto: ActiveInactiveGameDto
	) {
		return await this.marketingService.activeInactiveGame(id, activeInactiveGameDto);
	}

	// @Roles(Role.SUPER_ADMIN)
	// @UseGuards(AuthGuard(), RolesGuard)
	// @ApiOperation({ summary: "Delete game by super admin" })
	// @ApiResponse({ status: 200, description: "Api success" })
	// @ApiResponse({ status: 422, description: "Bad Request or API error message" })
	// @ApiResponse({ status: 404, description: "Not Found" })
	// @ApiResponse({ status: 500, description: "Internal server error!" })
	// @Delete("game/:id")
	// async deleteGame(
	// 	@Param("id") id: number,

	// ){
	// 	return await this.marketingService.deleteGame(id);
	// }



	@Roles(Role.SUPER_ADMIN)
	@UseGuards(AuthGuard(), RolesGuard)
	@ApiOperation({ summary: "add new game markup" })
	@ApiResponse({ status: 200, description: 'Api success' })
	@ApiResponse({ status: 422, description: 'Bad Request or API error message' })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Post('game-markup')
	@HttpCode(200)
	async addGameMarkup(
		@Body() addRewordMarkup: addRewordMarkupDto
	) {
		return await this.marketingService.addRewordMarkup(addRewordMarkup);
	}

	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@UseGuards(AuthGuard(), RolesGuard)
	@ApiOperation({ summary: "Update Game markup by super admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Put("game-markup/:id")
	async updateGameMarkup(
		@Param("id") id: number,
		@Body() updateRewordMarkupDto: UpdateRewordMarkupDto
	) {
		return await this.marketingService.UpateRewordMarkup(id, updateRewordMarkupDto)
	}

	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@UseGuards(AuthGuard(), RolesGuard)
	@ApiOperation({ summary: "Change status of game markup by super admin" })
	@ApiResponse({ status: 200, description: 'Api success' })
	@ApiResponse({ status: 422, description: 'Bad Request or API error message' })
	@ApiResponse({ status: 404, description: 'Not Found' })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Patch('game-markup/:id')
	async changeStatusGameMarkup(
		@Param('id') id: number,
		@Body() activeInactiveGameMarkupDto: ActiveInactiveGameMarkupDto
	) {
		return await this.marketingService.activeInactiveGameMarkup(id, activeInactiveGameMarkupDto);
	}

	@Roles(Role.SUPER_ADMIN)
	@UseGuards(AuthGuard(), RolesGuard)
	@ApiOperation({ summary: "Delete game markup by super admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Delete("game-markup/:id")
	async deleteGameMarkup(
		@Param("id") id: number,
	) {
		return await this.marketingService.deleteGameMarkup(id);
	}


	@ApiOperation({ summary: "user detail " })
	@ApiResponse({ status: 200, description: 'Api success' })
	@ApiResponse({ status: 422, description: 'Bad Request or API error message' })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Post('user')
	@HttpCode(200)
	async newUser(
		@Body() createMarketingUserDto: CreateMarketingUserDto
	) {
		return await this.marketingService.marketingUser(createMarketingUserDto);
	}

	@Roles(Role.SUPER_ADMIN)
	@UseGuards(AuthGuard(), RolesGuard)
	@ApiOperation({ summary: "add new question for the quiz game" })
	@ApiResponse({ status: 200, description: 'Api success' })
	@ApiResponse({ status: 422, description: 'Bad Request or API error message' })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Post('quiz')
	@HttpCode(200)
	async newQuetion(
		@Body() addQuetionDto: AddQuetionDto
	) {
		return await this.marketingService.addQuetionAnswer(addQuetionDto);
	}

	@Roles(Role.SUPER_ADMIN)
	@UseGuards(AuthGuard(), RolesGuard)
	@ApiOperation({ summary: "list quiz game for admin" })
	@ApiResponse({ status: 200, description: 'Api success' })
	@ApiResponse({ status: 422, description: 'Bad Request or API error message' })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Get('quiz/list-for-admin')
	async listQuizforAdmin(
	) {
		return await this.marketingService.getQuetionForAdmin();
	}


	@ApiOperation({ summary: "list quiz game for user" })
	@ApiResponse({ status: 200, description: 'Api success' })
	@ApiResponse({ status: 422, description: 'Bad Request or API error message' })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Get('quiz/list-for-user')
	async listQuizforUser(
	) {
		return await this.marketingService.getQuetionForUser();
	}

	@ApiOperation({ summary: "submit quiz" })
	@ApiResponse({ status: 200, description: 'Api success' })
	@ApiResponse({ status: 422, description: 'Bad Request or API error message' })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Post('quiz/submit')
	@HttpCode(200)
	async submitQuiz(
		@Body() quizResultDto: QuizResultDto
	) {
		return await this.marketingService.quizResult(quizResultDto);
	}

	@ApiOperation({ summary: "list wheel option for user" })
	@ApiResponse({ status: 200, description: 'Api success' })
	@ApiResponse({ status: 422, description: 'Bad Request or API error message' })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Get('wheel/list-for-user')
	async listWheelforUser(
	) {
		return await this.marketingService.wheelGameOptionListForUser();
	}

	@ApiOperation({ summary: "wheel submit for user" })
	@ApiResponse({ status: 200, description: 'Api success' })
	@ApiResponse({ status: 422, description: 'Bad Request or API error message' })
	@ApiResponse({ status: 404, description: 'Not Found' })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Patch('wheel/:user_id')
	async wheelResult(
		@Param('user_id') id: number,
	){
		return await this.marketingService.submitWheelGame(id);
	}

	@ApiOperation({ summary: "Update marketing user data" })
	@ApiResponse({ status: 200, description: 'Api success' })
	@ApiResponse({ status: 422, description: 'Bad Request or API error message' })
	@ApiResponse({ status: 404, description: 'Not Found' })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Put('user')
	async updateMarketingUser(
		@Body() userData: UpdateMarketingUserDto
	){
		return await this.marketingService.updateMarketingUser(userData);
	}
}
