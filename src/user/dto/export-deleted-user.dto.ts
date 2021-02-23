import { IsNotEmpty } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { errorMessage } from "src/config/common.config";
import { DeleteAccountRequestStatus } from "src/enum/delete-account-status.enum";
export class ExportDeleteRequestDto {
    @ApiPropertyOptional({
        description: 'search',
        example: ""
    })
    search: string;

    @ApiPropertyOptional({
        description: 'status',
        example: DeleteAccountRequestStatus.CONFIRM
    })
    status: number;
}