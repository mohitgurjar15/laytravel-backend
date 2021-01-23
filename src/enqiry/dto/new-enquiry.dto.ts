import { IsEmail, IsNotEmpty, ValidationArguments } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class newEnquiryDto {

    @IsNotEmpty({
        message: `Please enter user name&&&subject&&&Please enter user name`
    })
    @ApiProperty({
        description: 'Enter user name',
        example: 'USA'
    })
    name: string;

    @IsEmail(
        {},
        {
            message: (args: ValidationArguments) => {
                if (typeof args.value == "undefined" || args.value == "") {
                    return `Please enter your email address.&&&email`;
                } else {
                    return `Please Enter valid email address.&&&email`;
                }
            },
        },
    )
    @ApiProperty({
        description: 'User Email',
        example: 'jon.doe@gmail.com'
    })
    email: string;


    // @ApiPropertyOptional({
    //     type: "string",
    //     description: "Phone country code",
    // })
    // @ApiProperty({
    //     description: `Select phone country code`,
    //     example: `+1`
    // })
    // country_code: string;



    // @ApiPropertyOptional({
    //     type: "string",
    //     description: "phone number",
    // })
    // @ApiProperty({
    //     description: `Enter phone number`,
    //     example: `8452456712`
    // })
    // phone_no: string;

    @IsNotEmpty({
        message: `Please enter message&&&message&&&Please enter message`
    })
    @ApiProperty({
        description: 'Enter message',
        example: `how many bad in primium room `
    })
    message: string;
}