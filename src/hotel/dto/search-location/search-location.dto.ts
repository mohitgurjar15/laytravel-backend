import { ApiProperty } from "@nestjs/swagger";

export class HotelSearchLocationDto{
    @ApiProperty({
        description:'City or Hotel name',
        example:'London'
    })
    term: string;
}