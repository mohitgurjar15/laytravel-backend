import { IsNotEmpty } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { errorMessage } from "src/config/common.config";
export class getBookingDetailsDto {
    @IsNotEmpty({
        message : `Please enter booking id &&&limit&&&${errorMessage}`
    })
    @ApiProperty({
        description:'booking id',
        example: '447a5557-1f53-4318-b24a-045bc0d9f2b5'
    })
    bookingId:string;   
}