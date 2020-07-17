import { IsNotEmpty } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { errorMessage } from "src/config/common.config";
export class ListLangugeDto {
    @ApiPropertyOptional({
        description:'search',
        example:""
    })
    search: string;
}