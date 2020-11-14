import { IsNotEmpty, IsEnum, ValidationArguments} from 'class-validator'
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

    @IsNotEmpty({
        message : `Please enter your first name.&&&first_name`
    })
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

    @IsNotEmpty({
        message : `Please enter your last name.&&&last_name`
    })
    @ApiProperty({
        description: 'Enter Last Name',
        example: 'Doe'
    })
    lastName: string;

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

    @ApiPropertyOptional({
		type: "string",
		format: "binary",
		description: "profile Picture Url (Allow Only 'JPG,JPEG,PNG')",
		example: "profile.jpg",
	})
	profile_pic: string;
}