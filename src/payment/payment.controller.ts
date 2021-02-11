import { Controller, Post, Body, UseGuards, Get, Param, Put, HttpCode, Delete } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { SaveCardDto } from './dto/save-card.dto';
import { GetUser } from 'src/auth/get-user.dacorator';
import { AuthGuard } from '@nestjs/passport';
import { AddCardDto } from './dto/add-card.dto';
import { Roles } from 'src/guards/role.decorator';
import { Role } from 'src/enum/role.enum';
import { User } from 'src/entity/user.entity';
import { CreteTransactionDto } from './dto/create-transaction.dto';
import { RolesGuard } from 'src/guards/role.guard';
import { ManullyTakePaymentDto } from './dto/manully-take-payment.dto';


@ApiTags("Payment")
@ApiBearerAuth()
@UseGuards(AuthGuard())
@Controller('payment')
export class PaymentController {

	constructor(private paymentService: PaymentService) { }

	@Post()
	@ApiOperation({ summary: "Save Card" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 401, description: "Unauthorized access" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@HttpCode(200)
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async saveCard(
		@Body() saveCardDto: SaveCardDto,
		@GetUser() user
	) {
		return await this.paymentService.saveCard(saveCardDto, user.userId);
	}

	@Post('user-card/:user_id')
	@UseGuards(RolesGuard)
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "Save user Card by admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 401, description: "Unauthorized access" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@HttpCode(200)
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async saveUserCard(
		@Body() saveCardDto: SaveCardDto,
		@GetUser() user,
		@Param('user_id') userId : string
	) {
		return await this.paymentService.saveCard(saveCardDto, userId);
	}

	@Get('user-card/:user_id')
	@UseGuards(RolesGuard)
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "Get all customer card list by admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 401, description: "Unauthorized access" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async listUserCard(
		@GetUser() user,
		@Param('user_id') userId : string
	) {
		return await this.paymentService.getAllCards(userId);
	}

	@Get()
	@ApiOperation({ summary: "Get all customer card" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 401, description: "Unauthorized access" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async getAllCards(
		@GetUser() user
	) {
		return await this.paymentService.getAllCards(user.userId);
	}

	@Post('add-card')
	@ApiOperation({ summary: "Add Card" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 401, description: "Unauthorized access" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@HttpCode(200)
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async addCard(
		@Body() addCardDto: AddCardDto,
		@GetUser() user
	) {
		return await this.paymentService.addCard(addCardDto, user.userId);
	}
	@Post('add-user-card/:user_id')
	@UseGuards(RolesGuard)
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "Save user Card by admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 401, description: "Unauthorized access" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@HttpCode(200)
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async addUserCard(
		@Body() addCardDto: AddCardDto,
		@GetUser() user,
		@Param('user_id') userId : string
	) {
		return await this.paymentService.addCard(addCardDto, userId);
	}

	@Put('retain-card/:card_token')
	@ApiOperation({ summary: "Retain card for future use" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 401, description: "Unauthorized access" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async retainCard(
		@Param('card_token') card_token: string
	) {
		console.log("card_token", card_token)
		return await this.paymentService.retainCard(card_token);
	}


	@Post('get-payment')
	@UseGuards(RolesGuard)
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "Get a payment from the user by admin " })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 401, description: "Unauthorized access" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@HttpCode(200)
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async getPayment(
		@Body() creteTransactionDto: CreteTransactionDto,
		@GetUser() user: User
	) {
		return await this.paymentService.createTransaction(creteTransactionDto, user.userId);
	}

	@Get('check-active-payments/:card_id')
	@UseGuards(RolesGuard)
	@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.FREE_USER, Role.PAID_USER)
	@ApiOperation({ summary: "check for payment active for selected card " })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Payment not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async checkCardPendingPayment(
		@Param('card_id') cardId: string,
		@GetUser() user: User
	) {
		return await this.paymentService.checkCardPendingPayment(cardId, user);
	}


	@Delete('/:card_id')
	@UseGuards(RolesGuard)
	@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.FREE_USER, Role.PAID_USER)
	@ApiOperation({ summary: "delete user card" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Payment not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async listPaymentForUser(
		@Param('card_id') cardId: string,
		@GetUser() user: User
	) {
		return await this.paymentService.deleteCard(cardId, user);
	}

	@Put('/:card_id')
	@UseGuards(RolesGuard)
	@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.FREE_USER, Role.PAID_USER)
	@ApiOperation({ summary: "update user card" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Payment not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async updateCard(
		@Param('card_id') cardId: string,
		@Body() addCardDto: AddCardDto,
		@GetUser() user: User
	) {
		return await this.paymentService.updateCard(cardId, addCardDto, user);
	}

	@Post('/take-manually')
	@UseGuards(RolesGuard)
	@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.FREE_USER, Role.PAID_USER)
	@ApiOperation({ summary: "Manually take payment " })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Payment not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async manuallyPayment(
		@Body() manullyTakePaymentDto: ManullyTakePaymentDto,
		@GetUser() user: User
	) {
		return await this.paymentService.manuallyTakePayment(manullyTakePaymentDto, user);
	}
}
