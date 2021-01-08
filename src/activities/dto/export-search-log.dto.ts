import { IsNotEmpty } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { errorMessage } from "src/config/common.config";
import { Type } from "class-transformer";
export class ExportSearchLogDto {
    @ApiPropertyOptional({
        description: 'source location',
        example: ''
    })
    source_location: string;



    @ApiPropertyOptional({
        description: `To Airport Location`,
        example: `DEL`
    })
    destination_location: string;


    @ApiPropertyOptional({
        description: `Departure date`,
        example: `2020-11-06`
    })
    departure_date: string;

    @ApiPropertyOptional({
        description: `arrival date`,
        example: `2020-11-15`
    })
    arrival_date: string;

    @ApiPropertyOptional({
        description: `Flight class (Economy, Business, First)`,
        example: `Economy`
    })
    flight_class: string;
    
    @ApiPropertyOptional({
        description: 'search for date',
        example: ""
    })
    searchDate: Date;

    @ApiPropertyOptional({
        description: 'search for user',
        example: ""
    })
    userId: string;
}

