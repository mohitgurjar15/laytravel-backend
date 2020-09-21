import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class SubscribeForNewslatterDto {	
	
	@ApiProperty({
		description: "Enter Email Id",
		example: "jonDoe@gmail.com",
	})
	@IsNotEmpty({
		message: "Please enter your email id.&&&emailId&&&Please enter your email id.",
	})
	email: string;
}