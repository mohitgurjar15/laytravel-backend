import { ApiProperty } from '@nestjs/swagger';
export class listPredictedBookingData {
    @ApiProperty({
        description:'require to book',
        example: true
    })
    requireToBook:boolean;   
}