import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { errorMessage } from "src/config/common.config";

export class AvailabilityDetailsDto {

    @ApiProperty({
        description:"Enter a check in date",
        example:'2021-01-05'
    })
    check_in_date:string;

    
    @ApiProperty({
        description:"Enter a check out date",
        example:'2021-01-15'
    })
    check_out_date:string;

    @ApiProperty({
        description:"Enter a adult count",
        example: 2
    })
    adult_count:number;


    // @ApiProperty({
    //     description:"Enter a currency",
    //     example:'USD'
    // })
    // currency:string;
}