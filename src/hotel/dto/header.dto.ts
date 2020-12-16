import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class HotelHeaderDto{
    
    @IsString()
    @ApiProperty({
        name: 'token',
        type: String,
        description: 'Token which was generated during Hotel Search API'
    })
    @IsString()
    token: string;
}