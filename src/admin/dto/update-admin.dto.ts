import { IsNotEmpty, IsEmail, MaxLength} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from 'src/enum/gender.enum';

export class UpdateAdminDto{

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