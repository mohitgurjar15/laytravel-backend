import { IsNotEmpty } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { errorMessage } from "src/config/common.config";
import { RouteType } from "src/flight/model/route.model";
export class ListAirportRouteDto {
    @ApiPropertyOptional({
        description: "limit",
        example: "",
    })
    limit: number;
    @ApiPropertyOptional({
        description: "Page number",
        example: "",
    })
    page_no: number;
    @ApiPropertyOptional({
        description: "code",
        example: "",
    })
    code: string;
    @ApiPropertyOptional({
        description: "city",
        example: "",
    })
    city: string;
    @ApiPropertyOptional({
        description: "country",
        example: "",
    })
    country: string;
}
