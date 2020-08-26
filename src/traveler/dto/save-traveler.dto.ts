import { IsNotEmpty, IsEmail, MinLength, MaxLength, Matches, ValidationArguments, IsEnum, ValidateIf } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from 'src/enum/gender.enum';
import { errorMessage } from 'src/config/common.config';
import { IsEqualTo } from 'src/auth/password.decorator';
import { IsValidDate } from 'src/decorator/is-valid-date.decorator';

export class SaveTravelerDto {

    @ApiPropertyOptional({
		type: "string",
		description: "parent user id",
	})
    @ApiProperty({
        description: `Enter parent user id`,
        example: `fb99b4c6-38ce-46bb-a084-d561a459605e`
    })
    parent_user_id: string;
    
    @IsEnum(['mr','ms','mrs'],{
        message : (args: ValidationArguments) => {
            if (typeof args.value == "undefined" || args.value == "") {
                return `Please select travelers title.&&&gender`;
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
        message : `Please enter travelers first name.&&&first_name`
    })
    @ApiProperty({
        description: `Enter First Name`,
        example: `Jon`
    })
    first_name: string;

    @IsNotEmpty({
        message : `Please enter travelers last name.&&&last_name`
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
					return `Please enter travelers email address.&&&email`;
				} else {
					return `Please Enter valid email address.&&&email`;
				}
			},
		},
	)
    @ApiProperty({
        description: `Enter travelers Email Id`,
        example: `jon.doe@gmail.com`
    })
    email: string;

    @IsValidDate('',{
        message: (args: ValidationArguments) => {
            if (typeof args.value == "undefined" || args.value == "") {
                return `Please enter date of birth.&&&dob`;
            } else {
                return `Please enter valid date of birth format(YYYY-MM-DD)&&&dob`;
            }
        },
    })
    @ApiProperty({
        description: `Enter your dob`,
        example: `1995-06-22`
    })
    dob: string;

    
    
    @IsNotEmpty({
        message : `Please select travelers gender.&&&gender`
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

    @IsNotEmpty({
        message : `Please select country code.&&&country_code`
    })
    @ApiProperty({
        description: `Select country code`,
        example: `+1`
    })
    country_code: string;

    @ApiPropertyOptional({
		type: "string",
		description: "Passport number",
	})
    @ApiProperty({
        description: `Enter travelers passport number`,
        example: `S1234X7896`
    })
    passport_number: string;

    @ApiPropertyOptional({
		type: "string",
		description: "Passport expiry date",
	})
    @IsValidDate('',{
        message: (args: ValidationArguments) => {
            if (typeof args.value == "undefined" || args.value == "") {
                return `Please enter travelers passport expiry date.&&&passport_expiry`;
            } else {
                return `Please enter valid passport expiry date format(YYYY-MM-DD)&&&passport_expiry`;
            }
        },
    })
    @ApiProperty({
        description: `Enter travelers passport expiry date`,
        example: `2030-07-20`
    })
    passport_expiry: string;

    

}