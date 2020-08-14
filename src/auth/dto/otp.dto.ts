import { IsNotEmpty, MinLength, MaxLength, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsEqualTo } from "../password.decorator";

export class OtpDto {
    @ApiProperty({
		description: "Enter Email Id",
		example: "jonDoe@gmail.com",
	})
	@IsNotEmpty({
		message: "Please enter your email id.&&&emailId",
	})
    email: string;
    
    @ApiProperty({
		description: "Enter Otp",
		example: "192653654",
	})
	@IsNotEmpty({
		message: "Please enter your otp.&&&otp",
	})
	otp: number;
}
