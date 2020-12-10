import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class Occupancy{
    @ApiProperty({
        description: 'Number of adults for a room',
        example: 2,
        required: true
    })
    @IsNumber()
    adults: number;
    
    @ApiProperty({
        description: 'Array of Age\'s of Children as per the room',
        example: [2,3],
        required: true
    })
    @IsArray()
    children: Array<number>;
}

export class SearchReqDto{

    @ApiProperty({
        description: 'Check In date',
        example: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split('T')[0],
        required: true
    })
    @IsString()
    check_in: string;
    
    @ApiProperty({
        description: 'Check Out date',
        example: new Date(new Date().setDate(new Date().getDate() + 11)).toISOString().split('T')[0],
        required: true
    })
    @IsString()
    check_out: string;
    
    @ApiProperty({
        description: 'Latitude of the searched location',
        example: "51.5074",
        required: true
    })
    @IsString()
    latitude: string; 
    
    @ApiProperty({
        description: 'Longitude of the searched location',
        example: "-0.1276",
        required: true
    })
    @IsString()
    longitude: string;
    
    @ApiProperty({
        description: 'Number of occupancies for this search',
        required: true,
        type: () => [Occupancy],
    })
    @IsArray()
    occupancies: Array<Occupancy[]>;

    @ApiProperty({
        description: 'If this object is set as "true" than "filter_object" will be provided with the search result which can be used to show under the Filter section',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    filter?: boolean = false;

}
