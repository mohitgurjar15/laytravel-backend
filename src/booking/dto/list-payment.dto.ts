import { IsNotEmpty } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { errorMessage } from "src/config/common.config";
export class ListPaymentDto {

    @IsNotEmpty({
        message : `Please enter limit&&&limit&&&${errorMessage}`
    })
    @ApiProperty({
        description:'Limit',
        example:10
    })
    limit:number;

    @IsNotEmpty({
        message : `Please enter page number&&&page&&&${errorMessage}`
    })
    @ApiProperty({
        description:'Page number',
        example:1
    })
    page_no:number;

    @ApiPropertyOptional({
        description:'Booking id',
        example:""
    })
    booking_id: string;

    @ApiPropertyOptional({
        description: 'Product id',
        example: ""
    })
    product_id: string;

    @ApiPropertyOptional({
        description:'module id',
        example:"1"
    })
    module_id: number;

    @ApiPropertyOptional({
        description:'Booking type',
        example:1
    })
    booking_type: number;

    @ApiPropertyOptional({
        description:'payment status',
        example:1
    })
    payment_status: number;
    /* @IsValidDate('',{
        message: (args: ValidationArguments) => {
            console.log(args)
            if (typeof args.value !== "undefined") {
                return `Please enter valid payment start date format(YYYY-MM-DD)&&&payment_start_date`;
            }
        },
    }) */
    @ApiPropertyOptional({
        description:'First instalemnt date',
        example:'2021-02-22'
    })
    payment_start_date: string;

    @ApiPropertyOptional({
        description:'Last instalemnt date',
        example:'2021-03-22'
    })
    payment_end_date: string;


    @ApiPropertyOptional({
        description:'instalment type',
        example:"weekly"
    })
    instalment_type:string;
}