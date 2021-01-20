import { IsNotEmpty, Max, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class AddBookingFeedback {

    // @IsNotEmpty({
    //     message : `Please enter booking id&&&id&&&Please enter booking id`
    // })
    // @ApiProperty({
    //     description:'booking id',
    //     example:''
    // })
    // booking_id:string;

    
    @IsNotEmpty({
        message : `Please enter rate&&&rate&&&Please enter rate`
    })
    @Min(1)
    @Max(5)
    @ApiProperty({
        description:'rating',
        example:1
    })
    rating:number;

    @IsNotEmpty({
        message : `Please enter message&&&message&&&Please enter message`
    })
    @ApiPropertyOptional({
        description:'enter message',
        example:""
    })
    message: string;
}
