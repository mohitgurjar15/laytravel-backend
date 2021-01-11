import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class HotelHeaderDto{
    
    @ApiProperty({
        name: 'token',
        description: 'Token which was generated during Hotel Search API (Object: details.token)'
    })
    @IsString()
    token: string;
    
    @ApiProperty({
        name: 'currency',
        description: 'Enter currency code(ex. USD)'
    })
    @IsString()
    currency: string;
}