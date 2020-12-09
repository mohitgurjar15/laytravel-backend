import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class FilterReqDto{
    @ApiProperty({
        description: 'Token string which got after search API',
        required:true
    })
    @IsString()
    token: string;
}