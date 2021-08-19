import { IsNotEmpty } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { errorMessage } from "src/config/common.config";
export class ExportFlightRouteDto {
    @ApiPropertyOptional({
        description: "search",
        example: "",
    })
    search: string;

    @ApiPropertyOptional({
        description: "status",
        example: "",
    })
    status: boolean;

    @ApiPropertyOptional({
        description: "category id",
        example: 1,
    })
    category_id: number;

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
