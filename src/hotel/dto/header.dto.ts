import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class HeaderDto{
    @ApiProperty({
        description: 'Hotel ID for which details are required',
        required:true
    })
    @IsString()
    token: string;
}