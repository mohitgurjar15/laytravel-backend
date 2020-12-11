import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer/decorators";

export class AvailabilityDto {
    @ApiProperty({
        description:"Enter a id",
        example:19
    })
    id:number;

    @ApiProperty({
        description:"Enter a type city or hotel ",
        example:'city'
    })
    type:string;

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

    @Type(() => Number)
    @ApiProperty({
        description:`Children ages collection`,
        example:[10,12,15]
    })
    number_and_children_ages:Array<Number>;
    
    @ApiProperty({
        description:"Enter a adult count",
        example: 2
    })
    adult_count:number;
}
