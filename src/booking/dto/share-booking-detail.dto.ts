import { IsArray, IsEmail, IsNotEmpty, ValidateNested, ValidationArguments } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { Type } from "class-transformer";
import { errorMessage } from "src/config/common.config";

export class ShareBookingDto {
	@IsNotEmpty({
		message: `Please enter booking id &&&limit&&&${errorMessage}`
	})
	@ApiProperty({
		description: 'booking id',
		example: ''
	})
	bookingId: string;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => emailsArray)
	@ApiProperty({
		description: `emails`,
		example: [{ "email": "jon.doe@gmail.com" }]
	})
	emails: emailsArray[]
}


class emailsArray {

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

