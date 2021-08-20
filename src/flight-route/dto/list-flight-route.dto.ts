import { IsNotEmpty } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { errorMessage } from "src/config/common.config";
import { RouteType } from "src/flight/model/route.model";
export class ListFlightRouteDto {
    @IsNotEmpty({
        message: `Please enter limit&&&limit&&&${errorMessage}`,
    })
    @ApiProperty({
        description: "Limit",
        example: 10,
    })
    limit: number;

    @IsNotEmpty({
        message: `Please enter page number&&&page&&&${errorMessage}`,
    })
    @ApiProperty({
        description: "Page number",
        example: 1,
    })
    page_no: number;

    @ApiPropertyOptional({
        description: "search",
        example: "",
    })
    search: string;

    @ApiPropertyOptional({
        description:'status',
        example:""
    })
    status: boolean;

    @ApiPropertyOptional({
        description:'category id',
        example:1
    })
    category_id: number;

    @ApiPropertyOptional({
        description:'type',
        example:1
    })
    type: string;

    @ApiPropertyOptional({
        description:'From airport code',
        example:'ABQ'
    })
    from_airport_code: string;

    @ApiPropertyOptional({
        description:'To airport code',
        example:'LAS'
    })
    to_airport_code: string;

}
