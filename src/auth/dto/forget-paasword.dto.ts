import { IsNotEmpty, IsEmail } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ForgetPasswordDto {

    
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({
        description: 'User Email',
        example: 'suresh@itoneclick.com'
    })
    email: string;

}