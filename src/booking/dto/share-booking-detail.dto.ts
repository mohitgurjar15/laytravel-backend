import { IsArray, IsEmail, IsNotEmpty, ValidateNested, ValidationArguments } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { Type } from "class-transformer";

export class ShareBookingDto {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => emails)
	@ApiProperty({
		description: `emails`,
		example: [
			{
				email: ``
			}
		]
	})
	emails: emails[]
}


class emails {

	@IsEmail(
		{},
		{
			message: (args: ValidationArguments) => {
				if (typeof args.value == "undefined" || args.value == "") {
					return `Please enter  email address.&&&email`;
				} else {
					return `Please Enter valid email address.&&&email`;
				}
			},
		},
	)
	@ApiProperty({
		description: `Enter Email Id`,
		example: `jon.doe@gmail.com`
	})
	email: string;
}

