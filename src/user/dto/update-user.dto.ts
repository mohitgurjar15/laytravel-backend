import { IsNotEmpty, IsEmail, MaxLength, MinLength, Matches, IsEnum, ValidationArguments} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { errorMessage } from 'src/config/common.config';
import { IsEqualTo } from 'src/auth/password.decorator';
import { Gender } from 'src/enum/gender.enum';

export class UpdateUserDto{

    @IsEnum(['mr','ms','mrs'],{
        message : (args: ValidationArguments) => {
            if (typeof args.value == "undefined" || args.value == "") {
                return `Please select your title.&&&gender`;
            } else {
                return `Please select valid title('mr','ms','mrs').&&&title&&&${errorMessage}`
            }
        }
    })
    @ApiProperty({
        description: `Select Title ('mr','ms','mrs')`,
        example: `mr`
    })
    title : string;

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
        message : `Please select country code.&&&country_code`
    })
    @ApiProperty({
        description: `Select country code`,
        example: `+1`
    })
    country_code: string;

    @IsNotEmpty({
        message : `Please enter your contact number.&&&phone_no`
    })
    @ApiProperty({
        description: `Enter phone number`,
        example: `8452456712`
    })
    phone_no: string;

    @IsNotEmpty({
        message : `Please enter your address.&&&address`
    })
    @ApiProperty({
        description: `Enter Your address`,
        example: `12 street, las vegas`
    })
    address: string;

    @IsNotEmpty({
        message : `Please enter your zipcode.&&&zip_code`
    })
    @ApiProperty({
        description: `Enter your zipcode`,
        example: `H7623`
    })
    zip_code: string;

    @IsNotEmpty({
        message : `Please select your country.&&&country_id`
    })
    @ApiProperty({
        description: `Enter your country id`,
        example: 233
    })
    country_id: number;

    @IsNotEmpty({
        message : `Please select your state.&&&state_id`
    })
    @ApiProperty({
        description: `Enter your state id`,
        example: 1452
    })
    state_id: number;

    @IsNotEmpty({
        message : `Please enter your city name.&&&city_name`
    })
    @ApiProperty({
        description: `Enter your city name`,
        example: `Las vegas`
    })
    city_name: string;
    
    @ApiPropertyOptional({
		description: `Select user prefer Language `,
		example: `1`,
	})
	prefer_language: number;


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

    @ApiPropertyOptional({
		type: "string",
		format: "binary",
		description: "profile Picture Url (Allow Only 'JPG,JPEG,PNG')",
		example: "profile.jpg",
	})
	profile_pic: string;
}