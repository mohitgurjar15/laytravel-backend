import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SubscribePlan{
	@IsNotEmpty({
		message: `Please enter plan id`,
	})
	@ApiProperty({
		description: `Enter plan id`,
		example: '51fcf4bb-b53b-4c0e-a4f4-0e7c44f0cb10',
	})
    planId: string;
    

    @IsNotEmpty({
		message: `Please enter currency id`,
	})
	@ApiProperty({
		description: `Enter currency id`,
		example: 1,
	})
    currencyId: number;
    

    @IsNotEmpty({
		message: `Please enter amount`,
	})
	@ApiProperty({
		description: `Enter amount`,
		example: '500',
	})
    amount: string;
    
    @IsNotEmpty({
		message: `Please enter payment status`,
	})
	@ApiProperty({
		description: `Enter payment status`,
		example: 1,
	})
    status: number;
    
    @IsNotEmpty({
		message: `Please enter payment info`,
	})
	@ApiProperty({
		description: `Enter payment info`,
		example: '{ sessionId:443344, statusCode:1 ,status: success}',
	})
	info: JSON;
}
