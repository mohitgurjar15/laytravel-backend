import { IsNotEmpty, IsEmail, MaxLength} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto{

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
}