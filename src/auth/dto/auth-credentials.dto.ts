import { IsNotEmpty, IsEmail, ValidationArguments } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AuthCredentialDto{
	
    @IsEmail(
		{},
		{
			message: (args: ValidationArguments) => {
				if (typeof args.value == "undefined" || args.value == "") {
					return `Please enter your email address.&&&email`;
				} else {
					return `Please Enter valid email address.&&&email`;
				}
			},
		},
	)
    @ApiProperty({
        description:'User Email',
        example:'jon.doe@gmail.com'
    })
    email:string;

    @IsNotEmpty({
		message: `Please enter your password.&&&password`,
	})
    @ApiProperty({
        description:'Password',
        example:'Jondoe123@'
    })
    password:string;
}