import { ApiPropertyOptional } from '@nestjs/swagger';
export class getBookingDailyPriceDto {
    @ApiPropertyOptional({
        description:'booking id',
        example: ''
    })
    booking_id:string;   
}