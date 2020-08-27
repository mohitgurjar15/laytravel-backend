import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ActiveDeactiveDto 
{
    @IsNotEmpty({
        message : `Please enter status`
    })
    @ApiProperty({
        description:`Enter status`,
        example: true
    })
    status:boolean;
}