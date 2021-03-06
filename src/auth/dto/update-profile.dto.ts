import { IsNotEmpty, ValidationArguments, IsEnum, Length } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { errorMessage } from 'src/config/common.config';
import { IsValidDate } from 'src/decorator/is-valid-date.decorator';
import { Gender } from 'src/enum/gender.enum';

export class UpdateProfileDto {

    // @IsEnum(['mr','ms','mrs'],{
    //     message : (args: ValidationArguments) => {
    //         if (typeof args.value == "undefined" || args.value == "") {
    //             return `Please select your title.&&&gender`;
    //         } else {
    //             return `Please select valid title('mr','ms','mrs').&&&title&&&${errorMessage}`
    //         }
    //     }
    // })
    @ApiPropertyOptional({
        description: `Select Title ('mr','ms','mrs')`,
        example: `mr`
    })
    title : string;

    
    @IsEnum(['M','F','O'],{
        message : (args: ValidationArguments) => {
            if (typeof args.value == "undefined" || args.value == "" || args.value == null) {
                return `Please select your gender.&&&gender&&&Please select your gender.`
            }
            else{
                return `Please select valid gender(M,F,O).&&&gender&&&${errorMessage}`
            }
        }
    })
    @ApiProperty({
        description: `Select Gender (M,F,O)`,
        example: `M`
    })
    gender : Gender;

    @IsNotEmpty({
        message : `Please enter your first name.&&&first_name`
    })
    @Length(3, 20)
    @ApiProperty({
        description: `Enter First Name`,
        example: `Jon`
    })
    first_name: string;

    @IsNotEmpty({
        message : `Please enter your last name.&&&last_name`
    })
    @Length(3, 20)
    @ApiProperty({
        description: `Enter Last Name`,
        example: `Doe`
    })
    last_name: string;

    @IsNotEmpty({
        message : `Please enter your phone country code.&&&phone numberPlease enter your phone country code.`
    })
    @ApiProperty({
        description: `Select country code`,
        example: `+1`
    })
    country_code: string;

    @IsNotEmpty({
        message : `Please enter your phone number.&&&phone number&&&Please enter your phone number.`
    })@ApiProperty({
        description: `Enter phone number`,
        example: `8452456712`
    })
    phone_no: string;

    @ApiPropertyOptional({
		type: "string",
		description: "address",
	})    
    @ApiProperty({
        description: `Enter Your address`,
        example: `12 street, las vegas`
    })
    address: string;

    
    @ApiPropertyOptional({
		type: "string",
		description: "zip code",
	})    
    zip_code: string;

    @ApiPropertyOptional({
		type: "string",
		description: "country id",
	})    
    // @ValidateIf((o) =>  o.state_id  != undefined || o.state_id != "")
    // @IsNotEmpty({
	// 	message: (args: ValidationArguments) => {
	// 		if (typeof args.value == "undefined" || args.value == "") {
	// 			return `Please enter country code.&&&country&&&Please enter country code`;
	// 		}
	// 	}
	// })
    // @ApiProperty({
    //     description: `Enter your country id`,
    //     example: 233
    // })
    country_id: number;

    
    @ApiPropertyOptional({
		type: "string",
		description: "state id",
    })
    // @ValidateIf((o) =>  o.country_id  != undefined || o.country_id != "")
    // @IsNotEmpty({
	// 	message: (args: ValidationArguments) => {
	// 		if (typeof args.value == "undefined" || args.value == "") {
	// 			return `Please enter state code.&&&country&&&Please enter state code`;
	// 		}
	// 	}
	// })    
    // @ApiProperty({
    //     description: `Enter your state id`,
    //     example: 1452
    // })
    state_id: number;

    @ApiPropertyOptional({
		type: "string",
		description: "city name",
	})    
    city_name: string;

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


    @ApiPropertyOptional({
		type: "string",
		format: "binary",
		description: "profile Picture Url (Allow Only 'JPG,JPEG,PNG')",
		example: "profile.jpg",
	})
    profile_pic: string;
    
    @ApiPropertyOptional({
		type: "string",
		description: "Passport number",
	})
    passport_number: string;

    @ApiPropertyOptional({
		type: "string",
		description: "home airport",
	})
    home_airport: string;

    @ApiPropertyOptional({
		type: "string",
		description: "Passport expiry date",
	})
	// @ValidateIf((o) => o.passport_expiry)
	// @IsValidDate("", {
	// 	message: (args: ValidationArguments) => {
	// 		if (typeof args.value != "undefined" || args.value != "") {
	// 			return `Please enter valid passport expiry date format(YYYY-MM-DD)&&&passport_expiry`;
	// 		}
	// 	},
	// })
	// @ApiProperty({
	// 	description: `Enter travelers passport expiry date`,
	// 	example: `2030-07-20`,
	// })
    passport_expiry: string;


    @ApiPropertyOptional({
		type: "string",
		description: "languge id",
	})    
    // @ApiProperty({
    //     description:'Enter Language ID ',
    //     example:'1'
    // })
    language_id :number;


    @ApiPropertyOptional({
		type: "string",
		description: "currency id",
	})    
    // @ApiProperty({
    //     description:'Enter currency ID ',
    //     example:'1'
    // })
    currency_id :number;
}