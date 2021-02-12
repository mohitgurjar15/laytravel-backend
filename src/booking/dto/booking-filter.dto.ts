import {ApiPropertyOptional } from '@nestjs/swagger';
export class BookingFilterDto {
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
        description: 'search with transaction token',
        example: ""
    })
    transaction_token: string;

    @ApiPropertyOptional({
        description: `enter valid booking through`,
        example: ``
    })
    booking_through: string;
}