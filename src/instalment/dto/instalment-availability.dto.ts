import { ValidationArguments } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsValidDate } from "src/decorator/is-valid-date.decorator";

export class InstalmentAvailabilityDto{

    @IsValidDate('',{
        message: (args: ValidationArguments) => {
            if (typeof args.value == "undefined" || args.value == "") {
                return `Please enter checkin date.&&&checkin_date`;
            } else {
                return `Please enter valid checkin date format(YYYY-MM-DD)&&&checkin_date`;
            }
        },
    })
    @ApiProperty({
        description:`Checkin Date`,
        example:`2021-02-25`
    })
    checkin_date : string;
    
   
    @IsValidDate('',{
        message: (args: ValidationArguments) => {
            if (typeof args.value == "undefined" || args.value == "") {
                return `Please enter booking date&&&booking_date`;
            } else {
                return `Please enter valid booking date format(YYYY-MM-DD)&&&booking_date`;
            }
        },
    })
    @ApiProperty({
        description:`Booking Date`,
        example:`2021-01-25`
    })
    booking_date : string;
}