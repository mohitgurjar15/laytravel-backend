import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class RoomsReqDto{
    @ApiProperty({
        description: 'Hotel ID'
    })
    @IsString()
    hotel_id: string;
    
    @ApiProperty({
        description: 'Hotel ID'
    })
    @IsString()
    @IsOptional()
    token?: string;

    @IsOptional()
    ppn_bundle?: string;
}
