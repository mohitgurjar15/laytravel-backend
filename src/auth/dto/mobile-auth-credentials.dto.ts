import { IsNotEmpty, IsEmail, ValidationArguments } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { errorMessage } from "src/config/common.config";

export class MobileAuthCredentialDto {
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
		description: `User Email`,
		example: `jon.doe@gmail.com`,
	})
	email: string;

	@IsNotEmpty({
		message: `Please enter your password.&&&password`,
	})
	@ApiProperty({
		description: `Password`,
		example: `Jondoe123@`,
	})
	password: string;

	@IsNotEmpty({ message: `Please enter your device type.&&&device_type&&&${errorMessage}` })
	@ApiProperty({
		description: `Device Type`,
		example: 1,
	})
	device_type: number;

    @IsNotEmpty({ message: `Please enter your device model.&&&device_model&&&${errorMessage}` })
	@ApiProperty({
		description: `Device Model`,
		example: 'RNE-L22',
	})
	device_model: string;

	@IsNotEmpty({ message: `Please enter your device token.&&&device_token&&&${errorMessage}` })
	@ApiProperty({
		description: `Device Token`,
		example: `123abc#$%456`,
	})
	device_token: string;

	@IsNotEmpty({ message: `Please enter your app version.&&&app_version&&&${errorMessage}` })
	@ApiProperty({
		description: `App Version`,
		example: `1.0`,
	})
	app_version: string;

	@IsNotEmpty({ message: `Please enter your os version. &&&os_version&&&${errorMessage}` })
	@ApiProperty({
		description: `OS Version`,
		example: `7.0`,
	})
	os_version: string;
}
