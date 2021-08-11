import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { InternalDto } from "./internal.dto";

export class HotelCityDto extends InternalDto{
    
    @ApiProperty({
        description: 'City Name'
    })
    @IsString()
    city: string;
    
}
