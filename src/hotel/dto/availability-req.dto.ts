import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { InternalDto } from "./internal.dto";

export class AvailabilityDto extends InternalDto{

    @ApiProperty({
        description: 'Room ID which is selected for booking',
        required:true
    })
    @IsString()
    room_id: string;

}