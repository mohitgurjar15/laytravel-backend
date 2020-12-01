import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray } from "class-validator";

export class AvailabilityDetailsDto {

    @ApiProperty({
        description:"Enter a property",
        example:7110442417410
    })
    id:number;

    @ApiProperty({
        description:"Enter a check in date",
        example:'2021-01-05'
    })
    check_in_date:string;

    
    @ApiProperty({
        description:"Enter a check out date",
        example:'2021-01-15'
    })
    check_out_date:string;

    @ApiProperty({
        description:"Enter a adult count",
        example: 2
    })
    adult_count:number;

    @IsArray()
    @Type(() => Number)
    @ApiProperty({
        description:`Children ages collection`,
        example:[10,12,15]
    })
    number_of_children_ages:Array<Number>;
}