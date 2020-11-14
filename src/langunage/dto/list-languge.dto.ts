
import {  ApiPropertyOptional } from '@nestjs/swagger';
export class ListLangugeDto {
    @ApiPropertyOptional({
        description:'search',
        example:""
    })
    search: string;
}