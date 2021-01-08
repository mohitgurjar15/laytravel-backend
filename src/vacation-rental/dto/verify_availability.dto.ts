import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class VerifyAvailabilityDto {

    @ApiProperty({
        description:"Enter a property id",
        example:42945378516991
    })
    property_id:number;

    @ApiProperty({
        description:"Enter room id ",
        example:42945378451569
    })
    room_id:number;

    @ApiProperty({
        description:"Enter rate plan selected for price check.  ",
        example:'ThisUnitTypeHasDepositsPaidOnArrivalAmount'
    })
    rate_plan_code:string;

    @ApiProperty({
        description:"Enter price of unit type.",
        example:612.5
    })
    original_price:number;
     

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

    @Type(() => Number)
    @ApiProperty({
        description:`Children ages collection`,
        example:[10,12,15]
    })
    number_and_children_ages:Array<Number>;
}