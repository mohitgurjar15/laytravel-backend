import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer/decorators";
import { ValidationArguments } from "class-validator";
import { IsValidDate } from "src/decorator/is-valid-date.decorator";

export class HomeRentalFlexibleDayDto{
    @ApiProperty({
        description:"Enter a locatio name",
        example:"Barcelona"
    })
    name:string;

    @ApiProperty({
        description:"Enter a type city or hotel ",
        example:'city'
    })
    type:string;
    
    @IsValidDate('',{
        message: (args: ValidationArguments) => {
            if (typeof args.value == "undefined" || args.value == "") {
                return `Please enter check in date.&&&check_in_date`;
            } else {
                return `Please enter valid check in date format(YYYY-MM-DD)&&&check_in_date`;
            }
        },
    })
    @ApiProperty({
        description:`check in date`,
        example:`2021-03-01`
    })
    check_in_date : string;

    @IsValidDate('',{
        message: (args: ValidationArguments) => {
            if (typeof args.value == "undefined" || args.value == "") {
                return `Please enter check in date.&&&check_in_date`;
            } else {
                return `Please enter valid check out date format(YYYY-MM-DD)&&&check_out_date`;
            }
        },
    })
    @ApiProperty({
        description:`check in date`,
        example:`2021-03-10`
    })
    check_out_date : string;

    
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
