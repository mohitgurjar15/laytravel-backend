import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { errorMessage } from "src/config/common.config";

export class ExportLaytripFeedbackForAdminDto {
    @ApiPropertyOptional({
        description: "enter search",
        example: "",
    })
    search: string;

    @ApiPropertyOptional({
        description: "enter rating",
        example: "",
    })
    rating: number;
}
