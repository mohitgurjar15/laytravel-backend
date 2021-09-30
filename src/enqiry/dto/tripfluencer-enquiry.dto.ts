import { IsEmail, IsNotEmpty, ValidationArguments } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
export class newTripfluencerDto {
    @IsNotEmpty({
        message: `Please enter user name&&&user_name&&&Please enter user name`,
    })
    @ApiProperty({
        description: "Enter user name",
        example: "Jaymees",
    })
    name: string;

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
        }
    )
    @ApiProperty({
        description: "User Email",
        example: "jaymees@gmail.com",
    })
    email: string;
   
    @ApiProperty({
        description: "Enter social user name",
        example: `jaymees_donga`,
    })
    social_user_name: string;
}
