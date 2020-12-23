import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { InternalDto } from "./internal.dto";

export class DetailReqDto extends InternalDto{
    @ApiProperty({
        description: 'Hotel ID for which details are required',
        required:true
    })
    @IsString()
    hotel_id: string;
}