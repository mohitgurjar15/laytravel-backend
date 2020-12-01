import { Controller, Post, Body, UseGuards, Get,  Param, Put, HttpCode } from '@nestjs/common';
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


@ApiTags("Payment")
@ApiBearerAuth()
@UseGuards(AuthGuard())
@Controller('payment')
export class PaymentController {

    constructor(private paymentService:PaymentService){}

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
        @Body() saveCardDto:SaveCardDto,
        @GetUser() user
    ){
        return await this.paymentService.saveCard(saveCardDto,user);
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
    ){
        return await this.paymentService.getAllCards(user);
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
        @Body() dddCardDto:AddCardDto,
        @GetUser() user
    ){
        return await this.paymentService.addCard(dddCardDto,user);
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
        @Param('card_token') card_token:string
    ){
		console.log("card_token",card_token)
        return await this.paymentService.retainCard(card_token);
	}


	@Post('get-payment')
	@UseGuards( RolesGuard)
	@Roles(Role.SUPER_ADMIN , Role.ADMIN)
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
        @Body() creteTransactionDto:CreteTransactionDto,
        @GetUser() user : User
    ){
        return await this.paymentService.createTransaction(creteTransactionDto,user.userId);
	}


	



	// @Get('installment-list-of-user')
	// @ApiOperation({ summary: "Payment list for user" })
	// @ApiResponse({ status: 200, description: "Api success" })
	// @ApiResponse({ status: 422, description: "Bad Request or API error message" })
	// @ApiResponse({
	// 	status: 403,
	// 	description: "You are not allowed to access this resource.",
	// })
	// @ApiResponse({ status: 404, description: "Payment not found!" })
	// @ApiResponse({ status: 500, description: "Internal server error!" })
	// async listPaymentForUser(
	// 	@Query() paginationOption: ListPaymentUserDto,
	// 	@GetUser() user : User
	// ) {
	// 	return await this.paymentService.listPaymentForUser(paginationOption,user.userId);
	// }


}
