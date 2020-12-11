import { IsNotEmpty } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { errorMessage } from "src/config/common.config";
export class getBookingDetailsDto {
    @IsNotEmpty({
        message : `Please enter booking id &&&limit&&&${errorMessage}`
    })
    @ApiProperty({
        description:'booking id',
        example: ''
    })
    bookingId:string;   
}