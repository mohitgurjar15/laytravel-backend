import { IsNotEmpty } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { errorMessage } from "src/config/common.config";
export class ListBookingDto {

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
        description:'search for date',
        example:""
    })
    start_date: Date;

    @ApiPropertyOptional({
        description:'search for date',
        example:""
    })
    end_date: Date;

    @ApiPropertyOptional({
        description:'Booking type search',
        example:1
    })
    booking_type: number;

    @ApiPropertyOptional({
        description:'Customer name',
        example:"steave"
    })
    customer_name: string;

    @ApiPropertyOptional({
        description:'Booking status',
        example:0
    })
    booking_status: number;

    @ApiPropertyOptional({
        description:'Payment type',
        example:1
    })
    payment_type:number;
}