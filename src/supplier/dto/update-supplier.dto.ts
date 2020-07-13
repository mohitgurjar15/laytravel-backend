import { IsNotEmpty, IsEmail, MaxLength} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSupplierDto{

    @IsNotEmpty()
    @MaxLength(25)
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
    @MaxLength(25)
    @ApiProperty({
        description: 'Enter Last Name',
        example: 'Doe'
    })
    lastName: string;

    @ApiPropertyOptional({
		type: "string",
		format: "binary",
		description: "profile Picture Url (Allow Only 'JPG,JPEG,PNG')",
		example: "profile.jpg",
	})
	profile_pic: string;
}