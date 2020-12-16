import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { DetailsDto } from "../others/details-res.dto";

export class RoomsReqDto {
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
    ppn_bundle?: string;
    
    @IsOptional()
    token?: string;
    

    /* Added this property for Public/retail  */
    @IsOptional()
    rooms?: string;
}
