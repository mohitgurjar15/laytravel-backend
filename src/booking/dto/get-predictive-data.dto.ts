import { ApiPropertyOptional } from '@nestjs/swagger';
export class listPredictedBookingData {

    @ApiPropertyOptional({
        description: 'booking id',
        example: ''
    })
    booking_id: string;


    @ApiPropertyOptional({
        description: 'Below minimum seat',
        example: true
    })
    below_minimum_seat: boolean;
}