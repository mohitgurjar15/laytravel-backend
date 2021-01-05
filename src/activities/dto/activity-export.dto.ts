import { IsNotEmpty } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { errorMessage } from "src/config/common.config";
export class ExportActivityDto {

    @ApiPropertyOptional({
        description: 'search',
        example: ""
    })
    search: string;

    @ApiPropertyOptional({
        description: 'search for date',
        example: ""
    })
    searchDate: Date;

    @ApiPropertyOptional({
        description: 'search for user',
        example: ""
    })
    userId: string;
}