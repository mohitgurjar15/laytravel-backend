import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class DetailReqDto{
    @ApiProperty({
        description: 'Hotel ID for which details are required',
        required:true
    })
    @IsNumber()
    hotel_id: string;
}