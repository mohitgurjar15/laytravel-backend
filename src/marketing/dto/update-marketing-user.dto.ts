import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, ValidationArguments } from "class-validator";
import { errorMessage } from "src/config/common.config";

export class UpdateMarketingUserDto {

    @IsNotEmpty({
        message: `Please enter user id.&&&id&&&${errorMessage}`,
    })
    @ApiProperty({
        description: `user id`,
        example: 1
    })
    user_id: number;

    
    @ApiProperty({
        description: `Enter First Name`,
        example: `Jon`
    })
    first_name: string;

    @ApiProperty({
        description: `Enter Last Name`,
        example: `Doe`
    })
    last_name: string;

    @IsEmail(
        {},
        {
            message: (args: ValidationArguments) => {
                if (typeof args.value == "undefined" || args.value == "") {
                    return `Please enter your email address.&&&email`;
                } else {
                    return `Please enter valid email address.&&&email`;
                }
            },
        },
    )
    @ApiProperty({
        description: `Enter Email Id`,
        example: `jon.doe@gmail.com`
    })
    email: string;    
}


