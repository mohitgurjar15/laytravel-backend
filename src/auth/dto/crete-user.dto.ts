import { IsNotEmpty, IsEmail, MinLength, MaxLength, Matches, ValidationArguments, IsEnum, ValidateIf } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';
import { IsEqualTo } from "../password.decorator";
import { Gender } from 'src/enum/gender.enum';
import { errorMessage } from 'src/config/common.config';

export class CreateUserDto {

    @IsEnum(['mobile','web'],{
        message : (args: ValidationArguments) => {
            if (typeof args.value == "undefined" || args.value == "") {
                return `Please enter sign up type.&&&signup_via&&&${errorMessage}`;
            } else {
                return `Please enter valid sign up type(mobile or web).&&&signup_via&&&${errorMessage}`
            }
        }
    })
    @ApiProperty({
        description: `Sign up via mobile or web`,
        example: `mobile`
    })
    signup_via: string;

    @IsNotEmpty({
        message : `Please enter your first name.&&&first_name`
    })
    @ApiProperty({
        description: `Enter First Name`,
        example: `Jon`
    })
    first_name: string;

    @IsNotEmpty({
        message : `Please enter your last name.&&&last_name`
    })
    @ApiProperty({
        description: `Enter Last Name`,
        example: `Doe`
    })
    last_name: string;

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
        description: `Enter Email Id`,
        example: `jon.doe@gmail.com`
    })
    email: string;

    @IsNotEmpty({
        message : `Please enter your password.&&&password`
    })
    @ApiProperty({
        description: `Enter Password`,
        example: `Jondoe123@`
    })
    @MaxLength(20)
	@MinLength(8, { message: `Password is too short. It should be minimum 8 characters.&&&password` })
	@Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: `Your password must be 8 characters long, should contain at least 1 uppercase, 1 lowercase, 1 numeric or special character.&&&password`,
	})
	password: string;

	@ApiProperty({
		description: `Enter confirm password`,
		example: `Jondoe123@`,
	})
	@IsEqualTo(`password`)
	@IsNotEmpty({
		message: `Please enter your confirm password.&&&confirm_password`,
	})
    confirm_password: string;
    
    @IsNotEmpty({
        message : `Please select your gender.&&&gender`
    })
    @IsEnum(['M','F'],{
        message : (args: ValidationArguments) => {
            if (typeof args.value == "undefined" || args.value == "") {
                return `Please select your gender.&&&gender`;
            } else {
                return `Please select valid gender(M,F).&&&gender&&&${errorMessage}`
            }
        }
    })
    @ApiProperty({
        description: `Select Gender (M,F)`,
        example: `M`
    })
    gender : Gender;

    @ValidateIf(o => o.signup_via === 'mobile')
    @IsNotEmpty({ message: `Please enter your device type.&&&device_type&&&${errorMessage}` })
	@ApiProperty({
		description: `Device Type`,
		example: 1,
	})
	device_type: number;

    @ValidateIf(o => o.signup_via === 'mobile')
	@IsNotEmpty({ message: `Please enter your device token.&&&device_token&&&${errorMessage}` })
	@ApiProperty({
		description: `Device Token`,
		example: `123abc#$%456`,
	})
	device_token: string;

    @ValidateIf(o => o.signup_via === 'mobile')
	@IsNotEmpty({ message: `Please enter your app version.&&&app_version&&&${errorMessage}` })
	@ApiProperty({
		description: `App Version`,
		example: `1.0`,
	})
	app_version: string;

    @ValidateIf(o => o.signup_via === 'mobile')
	@IsNotEmpty({ message: `Please enter your os version. &&&os_version&&&${errorMessage}` })
	@ApiProperty({
		description: `OS Version`,
		example: `7.0`,
	})
	os_version: string;
}