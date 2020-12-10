import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class DetailReqDto{
    @ApiProperty({
        description: 'Hotel ID for which details are required',
        required:true
    })
    @IsString()
    hotel_id: string;
}