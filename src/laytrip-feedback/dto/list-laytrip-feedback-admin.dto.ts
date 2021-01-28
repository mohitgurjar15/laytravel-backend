import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { errorMessage } from "src/config/common.config";

export class ListLaytripFeedbackForAdminDto {

    @IsNotEmpty({
        message : `Please enter limit&&&limit&&&${errorMessage}`
    })
    @ApiProperty({
        description:'Limit',
        example:10
    })
    limit:number;

    @IsNotEmpty({
        message : `Please enter page number&&&page&&&${errorMessage}`
    })
    @ApiProperty({
        description:'Page number',
        example:1
    })
    page_no:number;

    @ApiPropertyOptional({
        description:'enter search',
        example:''
    })
    search:string;

    @ApiPropertyOptional({
        description:'enter rating',
        example:''
    })
    rating:number;
}