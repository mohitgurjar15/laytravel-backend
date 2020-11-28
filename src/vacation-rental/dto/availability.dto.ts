import { ApiProperty } from "@nestjs/swagger";

export class AvailabilityDto {

    @ApiProperty({
        description:"Enter a id",
        example:133
    })
    id:number;

    @ApiProperty({
        description:"Enter a type city or hotel ",
        example:'hotel'
    })
    type:string;
    
    @ApiProperty({
        description:"Enter a checkin date",
        example:'2021-01-05'
    })
    checkInDate:string;

    
    @ApiProperty({
        description:"Enter a checkin date",
        example:'2021-01-15'
    })
    checkOutDate:string;

    @ApiProperty({
        description:"Enter a adult count",
        example: 2
    })
    adultCount:number;

    // @ApiProperty({
    //     description:"Enter a currency",
    //     example:'USD'
    // })
    // currency:string;

}