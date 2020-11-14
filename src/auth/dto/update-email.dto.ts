import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateEmailId {
    @IsNotEmpty()
    @ApiProperty({
        description:'Enter Email Id ',
        example:'jonDoe@gmail.com'
    })
    newEmail:string;
}