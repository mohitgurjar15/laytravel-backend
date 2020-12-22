import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString } from "class-validator";
import { InternalDto } from "./internal.dto";

export class BookDto extends InternalDto{
    
    @ApiProperty({
        description: "User ID of Primary guest",
        required: true
    })
    @IsString()
    primary_guest: string;
    
    @ApiProperty({
        description: "Array of User ID's for whom is booking is to be made",
        required: true
    })
    @IsArray()
    guests: string[];
    
}
