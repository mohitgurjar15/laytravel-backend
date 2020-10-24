import { IsNotEmpty,ValidationArguments, IsEnum, ValidateIf, NotContains } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from 'src/enum/gender.enum';
import { errorMessage } from 'src/config/common.config';
import { IsValidDate } from 'src/decorator/is-valid-date.decorator';
import * as moment from 'moment';

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
    @NotContains(' ',{message : `First name does not contain whitespace `})
    @ApiProperty({
        description: `Enter First Name`,
        example: `Jon`
    })
    first_name: string;

    @IsNotEmpty({
        message : `Please enter travelers last name.&&&last_name`
    })
    @NotContains(' ',{message : `Last name does not contain whitespace `})
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

    
    
    
    @IsEnum(['M','F','N'],{
        message : (args: ValidationArguments) => {
            if (typeof args.value == "undefined" || args.value == "" || args.value == null) {
                return `Please select your gender.&&&gender&&&Please select your gender.`
            }
            else{
                return `Please select valid gender(M,F,N).&&&gender&&&${errorMessage}`
            }
        }
    })
    @ApiProperty({
        description: `Select Gender (M,F,N)`,
        example: `M`
    })
    gender : Gender;

    @ValidateIf((o) => moment(new Date()).diff(moment(o.dob),'years') >= 12)
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
    // @ValidateIf((o) => o.passport_expiry != "" &&  moment(new Date()).diff(moment(o.dob),'years') >= 12)
	// @IsValidDate("",{
    //     message: (args: ValidationArguments) => {
    //         if (typeof args.value != "undefined" || args.value != "") {
    //             return `Please enter valid passport expiry date format(YYYY-MM-DD)&&&passport_expiry`;
    //         }
    //     },
    // })
    @ApiProperty({
        description: `Enter travelers passport expiry date`,
        example: `2030-07-20`
    })
    passport_expiry: string;   

    @ApiPropertyOptional({
		type: "string",
		description: "Traveler phone no",
	})
	@ValidateIf((o) => moment(new Date()).diff(moment(o.dob),'years') >= 12)
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