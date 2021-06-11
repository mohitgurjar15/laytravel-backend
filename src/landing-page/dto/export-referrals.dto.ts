import { IsNotEmpty } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { errorMessage } from "src/config/common.config";
export class ExportReferralDto {
    @IsNotEmpty({
        message: `Please enter referral_id&&&page&&&${errorMessage}`,
    })
    @ApiProperty({
        description: "Page referral_id",
        example: 1,
    })
    referral_id: string;

    @ApiPropertyOptional({
        description: "search",
        example: "",
    })
    search: string;
}
