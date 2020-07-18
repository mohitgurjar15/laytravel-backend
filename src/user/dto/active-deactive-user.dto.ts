import { IsNotEmpty } from "class-validator";
import { statusEnum } from "../status.enum";
import { ApiProperty } from "@nestjs/swagger";

export class ActiveDeactiveDto 
{
    @IsNotEmpty({
        message : `Please enter status`
    })
    @ApiProperty({
        description:`Enter status`,
        example:`Active/Deactive`
    })
    status:statusEnum;
}