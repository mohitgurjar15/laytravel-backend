import { IsNotEmpty, IsEmail, MaxLength, IsEnum, ValidationArguments} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from 'src/enum/gender.enum';
import { errorMessage } from 'src/config/common.config';

export class UpdateSupplierDto{


    @IsEnum(["mr", "ms", "mrs"], {
		message: (args: ValidationArguments) => {
			if (typeof args.value == "undefined" || args.value == "") {
				return `Please select your title.&&&gender`;
			} else {
				return `Please select valid title('mr','ms','mrs').&&&title&&&${errorMessage}`;
			}
		},
	})
	@ApiProperty({
		description: `Select Title ('mr','ms','mrs')`,
		example: `mr`,
	})
	title: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'Enter First Name',
        example: 'Jon'
    })
    firstName: string;

    @ApiProperty({
        description: 'Enter Middle Name',
        example: 'K'
    })
    middleName: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'Enter Last Name',
        example: 'Doe'
    })
    lastName: string;

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