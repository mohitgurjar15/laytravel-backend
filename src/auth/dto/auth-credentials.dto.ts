import { IsNotEmpty, IsEmail, ValidationArguments } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { I18nService } from "nestjs-i18n";

export class AuthCredentialDto{
	constructor(private readonly i18n: I18nService) {}
	
    @IsEmail(
		{},
		{
			message: (args: ValidationArguments) => {
				if (typeof args.value == "undefined" || args.value == "") {
					return ``;
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