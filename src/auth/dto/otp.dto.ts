import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

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
