import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ReSendVerifyoOtpDto {
    @IsNotEmpty()
    @ApiProperty({
        description:'Enter Email Id ',
        example:'jonDoe@gmail.com'
    })
    email:string;
}