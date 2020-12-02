import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray } from "class-validator";

export class BookingDto{

    @ApiProperty({
        description:"Enter room id",
        example:7111514346492
    })
    room_id:number;

    @ApiProperty({
        description:"Enter rate plan selected for price check.",
        example:'186PNPNX01'
    })
    rate_plan_code:string;

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