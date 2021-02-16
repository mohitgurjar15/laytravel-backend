import {
	IsNotEmpty,
	IsEmail,
	ValidationArguments,
	IsEnum,
	ValidateIf,
	NotContains,
    IsArray,
    ValidateNested,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Gender } from "src/enum/gender.enum";
import { errorMessage } from "src/config/common.config";
import { IsValidDate } from "src/decorator/is-valid-date.decorator";
import * as moment from 'moment';
import { Type } from "class-transformer";

export class MultipleTravelersDto{
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Traveler)
    @ApiProperty({
        description:`Travelers`,
        example:[
            {
                "traveler_id": "123-ffacd-dfefefesadsdaw-ww",
                "first_name": "Jon",
                "last_name": "Doe",
                "email": "jon.doe@gmail.com",
                "dob": "1995-06-22",
                "gender": "M",
                "country_code": "1",
                "phone_no": "91919221212",
                "passport_number": "S1234X7896",
                "passport_expiry": "2030-07-20",
                "country_id": "1"
              },
              {
                "first_name": "Jon",
                "last_name": "Doe",
                "email": "jon.doe@gmail.com",
                "dob": "1995-06-22",
                "gender": "M",
                "country_code": "1",
                "phone_no": "91919221212",
                "passport_number": "S1234X7896",
                "passport_expiry": "2030-07-20",
                "country_id": "1"
              }
        ]
    })
    travelers:Traveler[]

	@ApiPropertyOptional({
		description: "enter guest id ",
		example: "25f56893-3759-46f1-a845-b90c2c3c488a"
	})
	guest_id: string;
}
class Traveler {
	// @ApiPropertyOptional({
	// 	type: "string",
	// 	description: "parent user id",
	// })
	// @ApiProperty({
	//     description: `Enter parent user id`,
	//     example: `fb99b4c6-38ce-46bb-a084-d561a459605e`
	// })
	// parent_user_id: string;

	// @IsEnum(["mr", "ms", "mrs"], {
	// 	message: (args: ValidationArguments) => {
	// 		if (typeof args.value == "undefined" || args.value == "") {
	// 			return `Please select travelers title.&&&gender`;
	// 		} else {
	// 			return `Please select valid title('mr','ms','mrs').&&&title&&&${errorMessage}`;
	// 		}
	// 	},
	// })
	// @ApiProperty({
	// 	description: `Select Title ('mr','ms','mrs')`,
	// 	example: `mr`,
	// })
	// title: string;
    @ApiPropertyOptional({
		type: "string",
		description: "traveler id",
	})	
	@ApiProperty({
		description: `Enter traveler id`,
		example: ``,
	})
    traveler_id: string;

	@IsNotEmpty({
		message: `Please enter travelers first name.&&&first_name`,
	})
	@NotContains(' ',{message : `First name does not contain whitespace `})
	@ApiProperty({
		description: `Enter First Name`,
		example: `Jon`,
	})
	first_name: string;

	@IsNotEmpty({
		message: `Please enter travelers last name.&&&last_name`,
	})
	@NotContains(' ',{message : `Last name does not contain whitespace `})
	@ApiProperty({
		description: `Enter Last Name`,
		example: `Doe`,
	})
	last_name: string;

	@ApiPropertyOptional({
		type: "string",
		description: "Traveler email id",
	})
	@ValidateIf((o) => moment(new Date()).diff(moment(o.dob),'years') >= 12)
	
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
		}
	)
	@ApiProperty({
		description: `Enter travelers Email Id`,
		example: `jon.doe@gmail.com`,
	})
	email: string;

	@IsValidDate("", {
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
		example: `1995-06-22`,
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
		example: `1`,
	})
	country_code: string;

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
    
	@ApiPropertyOptional({
		type: "string",
		description: "Passport number",
	})
	@ApiProperty({
		description: `Enter travelers passport number`,
		example: `S1234X7896`,
	})
	passport_number: string;

	@ApiPropertyOptional({
		type: "string",
		description: "Passport expiry date",
	})	
	@ApiProperty({
		description: `Enter travelers passport expiry date`,
		example: `2030-07-20`,
	})
    passport_expiry: string;
    
    @IsNotEmpty({
		message: `Please select country id.&&&country_code`,
	})
	@ApiProperty({
		description: `Select country id`,
		example: `1`,
	})
	country_id: number;

	@ApiPropertyOptional({
		description: "enter guest id ",
		example: "25f56893-3759-46f1-a845-b90c2c3c488a"
	})
	guest_id: string;
	
}
