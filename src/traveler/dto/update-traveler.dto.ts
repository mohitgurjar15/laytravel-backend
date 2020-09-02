import { IsNotEmpty,ValidationArguments, IsEnum, ValidateIf } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from 'src/enum/gender.enum';
import { errorMessage } from 'src/config/common.config';
import { IsValidDate } from 'src/decorator/is-valid-date.decorator';

var today = new Date();
export class UpdateTravelerDto{

    
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

    @ValidateIf((o) => today.getFullYear() - new Date(o.dob).getFullYear() >= 12)
	@IsNotEmpty({
		message: `Please select phone country code.&&&country_code`,
	})
	@ApiProperty({
		description: `Select phone country code`,
		example: `+1`,
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
    @ValidateIf(o => o.passport_expiry != "")
    @IsValidDate("",{
        message: (args: ValidationArguments) => {
            if (typeof args.value != "undefined" || args.value != "") {
                return `Please enter valid passport expiry date format(YYYY-MM-DD)&&&passport_expiry`;
            }
        },
    })
    @ApiProperty({
        description: `Enter travelers passport expiry date`,
        example: `2030-07-20`
    })
    passport_expiry: string;   

    @ApiPropertyOptional({
		type: "string",
		description: "Traveler phone no",
	})
	@ValidateIf((o) => today.getFullYear() - new Date(o.dob).getFullYear() >= 12)
    @IsNotEmpty({
		message: (args: ValidationArguments) => {
			if (typeof args.value == "undefined" || args.value == "") {
				return `Please enter phone no.&&&phon_no`;
			}
		}
	})
    @ApiProperty({
		description: `Enter travelers phone no`,
		example: `91919221212`,
	})
    phone_no: string;


    @IsNotEmpty({
		message: `Please select country id.&&&country_code`,
	})
	@ApiProperty({
		description: `Select country id`,
		example: `1`,
	})
	country_id: number;


}