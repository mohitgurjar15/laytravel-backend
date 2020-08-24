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
    plan_id: string;
    

    @IsNotEmpty({
		message: `Please enter currency id`,
	})
	@ApiProperty({
		description: `Enter currency id`,
		example: 1,
	})
	currency_id: number;
	

	@IsNotEmpty({
		message: `Your card detail is required`,
	})
	@ApiProperty({
		description: `Enter card token`,
		example: "lX1S2piuQrbLORuusqXbRlE21jyomOkNCfAml_RWqBc",
	})
    card_token: string;
    
}
