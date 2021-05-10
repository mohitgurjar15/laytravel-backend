import { IsNotEmpty } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { errorMessage } from "src/config/common.config";
export class ListLandingPageDto {
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
}
