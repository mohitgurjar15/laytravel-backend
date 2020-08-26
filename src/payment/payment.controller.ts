import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { SaveCardDto } from './dto/save-card.dto';
import { GetUser } from 'src/auth/get-user.dacorator';
import { AuthGuard } from '@nestjs/passport';


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
}
