import { IsNotEmpty, IsEmail, MinLength, MaxLength, Matches, ValidationArguments, IsEnum, ValidateIf, min, Length } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';
import { errorMessage } from 'src/config/common.config';

export class CreateMarketingUserDto {

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
    
    @ValidateIf(o => o.signup_via === 'mobile')
    @IsNotEmpty({ message: `Please enter your device type.&&&device_type&&&${errorMessage}` })
	@ApiProperty({
		description: `Device Type`,
		example: 1,
	})
    device_type: number;
    
    @ValidateIf(o => o.signup_via === 'mobile')
    @IsNotEmpty({ message: `Please enter your device model.&&&device_model&&&${errorMessage}` })
	@ApiProperty({
		description: `Device Model`,
		example: 'RNE-L22',
	})
    device_model: string;
    
    @IsNotEmpty({ message: `Please enter your ip adddress.&&&ip_address&&&${errorMessage}` })
	@ApiProperty({
		description: `ip_address`,
		example: '127.0.0.1',
	})
	ip_address: string;


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

    @IsNotEmpty({ message: `Please enter your name. &&&name&&&Please enter your name.` })
    @ApiProperty({
        description: `Enter First Name`,
        example: `Jon`
    })
    name: string;

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

    
}