import { IsEnum, ValidationArguments, IsNotEmpty } from "class-validator";
import { InstalmentType } from "src/enum/instalment-type.enum";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsValidDate } from "src/decorator/is-valid-date.decorator";

export class AllInstalmentDto{


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

    @IsNotEmpty({
        message : `Please enter amount&&&amount`
    })
    @ApiProperty({
        description:`Booking Amount`,
        example:150.50
    })
    amount : number;

    @ApiPropertyOptional({
        description:`Additonal Amount`,
        example:10
    })
    additional_amount : number;

    @ApiPropertyOptional({
        description:`Down Amount`,
        example:3
    })
    down_payment : number;

    @ApiPropertyOptional({
        description:`Selected Down Amount`,
        example:3
    })
    selected_down_payment : number;

    @ApiPropertyOptional({
        description:`Custom Down Amount`,
        example:3
    })
    custom_down_payment : number;
}