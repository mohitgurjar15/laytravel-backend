import { IsNotEmpty, IsEmail, ValidationArguments, ValidateIf, isNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { errorMessage } from "src/config/common.config";

export class SocialLoginDto {

	@IsNotEmpty({
		message : `Please enter account type`
	})
	@ApiProperty({
		description: `Account type (Facebook(1), google(2) or Apple(3))`,
		example: 1,
	})
	account_type : number

	@ValidateIf(o => o.account_type === 1 || o.account_type === 2)
	@IsNotEmpty({
		message : `Please enter your user name&&&name`
	})
	@ApiProperty({
		description: `User Name`,
		example: `Jon Doe`,
	})
	name : string

	
	@ValidateIf(o => o.account_type === 2 || o.account_type === 3)
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

	@ApiProperty({
		description: `Account id return by social media account&&&social_account_id`,
		example: `ere45tytyu34fff`,
	})
	social_account_id : string

	@IsNotEmpty({ message: `Please enter your device type.&&&device_type&&&${errorMessage}` })
	@ApiProperty({
		description: `Device Type`,
		example: 1,
	})
	device_type: number;

	//@IsNotEmpty({ message: `Please enter your device token.&&&device_token&&&${errorMessage}` })
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
