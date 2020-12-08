import { IsEmail, IsNotEmpty, ValidationArguments } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { errorMessage } from "src/config/common.config";
export class ShareBookingDto {
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