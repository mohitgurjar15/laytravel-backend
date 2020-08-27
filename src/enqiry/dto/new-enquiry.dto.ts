import { IsNotEmpty } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
export class newEnquiryDto {

    @IsNotEmpty({
        message : `Please enter location&&&subject&&&Please enter location`
    })
    @ApiProperty({
        description:'Enter location',
        example:'USA'
    })
    location:string;

    @IsNotEmpty({
        message : `Please enter subject&&&subject&&&Please enter subject`
    })
    @ApiProperty({
        description:'Enter Subject',
        example:'Hotel room'
    })
    subject:string;

    @IsNotEmpty({
        message : `Please enter message&&&message&&&Please enter message`
    })
    @ApiProperty({
        description:'Enter message',
        example: `how many bad in primium room `
    })
    message:string;
}