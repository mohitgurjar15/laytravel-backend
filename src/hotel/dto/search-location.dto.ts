import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class HotelSearchLocationDto{
    @ApiProperty({
        description:'City or Hotel name',
        example: 'London',
        required: true
    })
    @IsString()
    term: string;
}