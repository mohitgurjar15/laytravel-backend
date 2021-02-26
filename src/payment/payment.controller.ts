import { Controller, Post, Body, UseGuards, Get, Param, Put, HttpCode, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { SaveCardDto } from './dto/save-card.dto';
import { GetUser, LogInUser } from 'src/auth/get-user.dacorator';
import { AuthGuard } from '@nestjs/passport';
import { AddCardDto } from './dto/add-card.dto';
import { Roles } from 'src/guards/role.decorator';
import { Role } from 'src/enum/role.enum';
import { User } from 'src/entity/user.entity';
import { CreteTransactionDto } from './dto/create-transaction.dto';
import { RolesGuard } from 'src/guards/role.guard';
import { ManullyTakePaymentDto } from './dto/manully-take-payment.dto';


@ApiTags("Payment")
@Controller('payment')
export class PaymentController {

	constructor(private paymentService: PaymentService) { }

	@Post()
	@ApiBearerAuth()
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
		@LogInUser() user
	) {
		const parent_user_id = user.roleId != Role.GUEST_USER ? user.user_id : '';
		const guest_id = user.roleId == Role.GUEST_USER ? user.user_id : '';
		return await this.paymentService.saveCard(saveCardDto, parent_user_id, guest_id);
	}

	@Post('user-card/:user_id')
	@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
	@ApiBearerAuth()
	@UseGuards(AuthGuard(), RolesGuard)
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
		@Param('user_id') userId: string
	) {
		const parent_user_id = user.roleId != Role.GUEST_USER ? user.user_id : '';
		const guest_id = user.roleId == Role.GUEST_USER ? user.user_id : '';
		return await this.paymentService.saveCard(saveCardDto, userId, guest_id);
	}

	@Get('user-card/:user_id')
	@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
	@ApiBearerAuth()
	@UseGuards(AuthGuard(), RolesGuard)
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
		@Param('user_id') userId: string
	) {
		return await this.paymentService.getAllCards(userId, { guest_id: '' });
	}


	@Get('details')
	@ApiBearerAuth()
	@UseGuards(AuthGuard(), RolesGuard)
	@ApiOperation({ summary: "payment caredantial" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 401, description: "Unauthorized access" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async gatewayCredantial(
	) {
		return await this.paymentService.getCredantial();
	}

	@Get()
	@ApiBearerAuth()
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
		@LogInUser() user
	) {
		const parent_user_id = user.roleId != Role.GUEST_USER ? user.user_id : '';
		const guest_id = user.roleId == Role.GUEST_USER ? user.user_id : '';
		return await this.paymentService.getAllCards(parent_user_id, guest_id);
	}

	@Post('add-card')
	@ApiBearerAuth()
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
		@LogInUser() user
	) {
		const parent_user_id = user.roleId != Role.GUEST_USER ? user.user_id : '';
		const guest_id = user.roleId == Role.GUEST_USER ? user.user_id : '';
		return await this.paymentService.addCard(addCardDto,parent_user_id,guest_id);
	}
	@Post('add-user-card/:user_id')
	@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
	@ApiBearerAuth()
	@UseGuards(AuthGuard(), RolesGuard)
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
		@Param('user_id') userId: string
	) {
		return await this.paymentService.addCard(addCardDto, userId,'');
	}

	@Put('retain-card/:card_token')
	@ApiBearerAuth()
	@UseGuards(AuthGuard())
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
	@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
	@ApiBearerAuth()
	@UseGuards(AuthGuard(), RolesGuard)
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
	@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.FREE_USER, Role.PAID_USER, Role.SUPPORT)
	@ApiBearerAuth()
	@UseGuards(AuthGuard(), RolesGuard)
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
	@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.FREE_USER, Role.PAID_USER, Role.SUPPORT)
	@ApiBearerAuth()
	@UseGuards(AuthGuard(), RolesGuard)
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
	@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.FREE_USER, Role.PAID_USER, Role.SUPPORT)
	@ApiBearerAuth()
	@UseGuards(AuthGuard(), RolesGuard)
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
	@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.FREE_USER, Role.PAID_USER, Role.SUPPORT)
	@ApiBearerAuth()
	@UseGuards(AuthGuard(), RolesGuard)
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
