import { IsNotEmpty } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { errorMessage } from "src/config/common.config";
import { RouteType } from "src/flight/model/route.model";
export class ListCityDto {
    @ApiPropertyOptional({
        description: "country",
        example: "",
    })
    country: string;
}
