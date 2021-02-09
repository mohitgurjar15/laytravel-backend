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
        description:`Vacation rental search name`,
        example:`Barcelona`
    })
    name:string;

    @ApiPropertyOptional({  
        description:`Vacation rental search type(city,hotel)`,
        example:`city`
    })
   type:string;

    @ApiPropertyOptional({  
        description:`check in date`,
        example:`2021-01-11`
    })
    check_in_date:string;

    @ApiPropertyOptional({  
        description:`check out date`,
        example:`2021-01-15`
    })
    check_out_date:string;

    @ApiPropertyOptional({  
        description:`adult count`,
        example:2
    })
    adult_count:number;

    @ApiPropertyOptional({
        description:`Children ages collection`,
        example:[10,12,15],
        type:[Number]
    })
    number_and_children_ages:number[];
    
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

