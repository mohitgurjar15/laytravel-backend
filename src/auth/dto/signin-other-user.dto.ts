import { IsNotEmpty, IsEmail, ValidationArguments } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { errorMessage } from "src/config/common.config";

export class SignInOtherUserDto{

    @IsNotEmpty({
		message: `Please enter your user id.&&&user_id&&&${errorMessage}`,
	})
    @ApiProperty({
        description:'Password',
        example:'Jondoe123@'
    })
    user_id:string;
}