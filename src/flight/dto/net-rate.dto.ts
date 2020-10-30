import {  IsNotEmpty, ValidationArguments } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { errorMessage } from "src/config/common.config";
import { IsValidDate } from "src/decorator/is-valid-date.decorator";

export class NetRateDto{
	
    @IsNotEmpty({
		message: `Please enter net rate.&&&net_rate${errorMessage}`,
	})
    @ApiProperty({
        description:`Net Rate`,
        example:100
    })
    net_rate:number;

    /* @IsEnum([PaymentType.INSTALMENT,PaymentType.NOINSTALMENT],{
        message : (args: ValidationArguments) => {
            if (typeof args.value == "undefined" || args.value == "") {
                return `Please enter payment type.&&&payment_type&&&${errorMessage}`;
            } else {
                return `Please enter valid payment type('${PaymentType.INSTALMENT, PaymentType.NOINSTALMENT}').&&&payment_type&&&${errorMessage}`
            }
        }
    })
    @ApiProperty({
        description:`Payment type`,
        example:PaymentType.INSTALMENT
    })
    payment_type:string; */
    
    @IsValidDate('',{
        message: (args: ValidationArguments) => {
            if (typeof args.value == "undefined" || args.value == "") {
                return `Please enter departure date.&&&departure_date`;
            } else {
                return `Please enter valid departure date format(YYYY-MM-DD)&&&departure_date`;
            }
        },
    })
    @ApiProperty({
        description:`Departure date`,
        example:`2020-11-06`
    })
	departure_date : string;
}
