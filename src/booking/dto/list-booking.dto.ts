import { IsEmail, IsEnum, IsNotEmpty, ValidateIf, ValidationArguments } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { errorMessage } from "src/config/common.config";
export class ListBookingDto {

    @IsNotEmpty({
        message: `Please enter limit&&&limit&&&${errorMessage}`
    })
    @ApiProperty({
        description: 'Limit',
        example: 10
    })
    limit: number;

    @IsNotEmpty({
        message: `Please enter page number&&&page&&&${errorMessage}`
    })
    @ApiProperty({
        description: 'Page number',
        example: 1
    })
    page_no: number;

    @ApiPropertyOptional({
        description: 'search for date',
        example: ""
    })
    start_date: Date;

    @ApiPropertyOptional({
        description: 'search for date',
        example: ""
    })
    end_date: Date;

    @ApiPropertyOptional({
        description: 'Booking type search',
        example: 1
    })
    booking_type: number;

    @ApiPropertyOptional({
        description: 'Customer name',
        example: "steave"
    })
    customer_name: string;

    @ApiPropertyOptional({
        description: 'Booking status',
        example: 0
    })
    booking_status: number;

    @ApiPropertyOptional({
        description: 'module id',
        example: ''
    })
    module_id: number;

    @ApiPropertyOptional({
        description: 'Payment type',
        example: 1
    })
    payment_type: number;

    @ApiPropertyOptional({
        description: 'booking id',
        example: ""
    })
    booking_id: string;

    @ApiPropertyOptional({
        description: 'supplier id',
        example: ""
    })
    supplier_id: number;

    @ApiPropertyOptional({
        description: 'search with keyword',
        example: ""
    })
    search: string;

    @ApiPropertyOptional({
        description: 'search with transaction token',
        example: ""
    })
    transaction_token: string;

    @ValidateIf((o) => o.email != "undefined")

    // @IsEmail(
    //     {},
    //     {
    //         message: (args: ValidationArguments) => {
    //             if (typeof args.value != "undefined" || args.value != "") {
    //                 return `Please Enter valid email address.&&&email`;
    //             }
    //         },
    //     }
    // )
    @ApiPropertyOptional({
        type: "string",
        description: "user email id",
    })
    email: string;


    // @ValidateIf((o) => o.booking_through != "undefined")
    // @IsEnum(['ios','web','android'],{
    //     message : (args: ValidationArguments) => {
    //         if (typeof args.value != "undefined" || args.value != "") {
    //             return `Please enter valid booking through up type('ios','web','android').&&&signup_via&&&Please enter valid booking through ('ios','web','android')`
    //         }
    //     }
    // })
    @ApiPropertyOptional({
        description: `enter valid booking through`,
        example: ``
    })
    booking_through: string;

}