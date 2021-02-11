import { IsNotEmpty } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class DeleteAccountReqDto {
    @ApiPropertyOptional({
        description: "Require backup files",
        example: true,
    })
    requireBackupFile: boolean;
}
