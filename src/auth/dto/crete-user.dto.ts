import { IsNotEmpty, IsEmail, MinLength, MaxLength, Matches, IsDate } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {

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

    @IsNotEmpty()
    @IsEmail()
    @ApiProperty({
        description: 'Enter Email Id',
        example: 'jon.doe@gmail.com'
    })
    email: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'Enter Password',
        example: 'Jon@Doe'
    })
    @MinLength(8)
    @MaxLength(20)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'Password Too weak' })
    password: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'profile Picture Url',
        example: 'ex.jpg'
    })
    profilePic: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'gender',
        example: 'f'
    })
    gender: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'Country',
        example: 'india'
    })
    country: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'State',
        example: 'guj'
    })
    state: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'city',
        example: 'ahmbdabad'
    })
    city: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'Address',
        example: 'ploat :av at b flore'
    })
    address: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'profile Picture Url',
        example: '345434'
    })
    zipCode: string;
}