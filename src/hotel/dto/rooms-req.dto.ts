import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { InternalDto } from "./internal.dto";

export class RoomsReqDto extends InternalDto{
    
    @ApiProperty({
        description: 'Hotel ID'
    })
    @IsString()
    hotel_id: string;

    @ApiProperty({
        description: 'Bundle ID'
    })
    @IsString()
    bundle: string;
    
}
