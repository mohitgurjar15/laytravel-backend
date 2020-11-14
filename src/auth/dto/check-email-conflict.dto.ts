import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CheckEmailConflictDto {
	@ApiProperty({
		description: "Enter Email Id",
		example: "jonDoe@gmail.com",
	})
	@IsNotEmpty({
		message: "Please enter your email id.&&&emailId",
	})
	email: string;
}
