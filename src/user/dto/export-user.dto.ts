import { IsNotEmpty } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { errorMessage } from "src/config/common.config";
export class ExportUserDto {

    @ApiPropertyOptional({
        description:'first name',
        example:""
    })
    firstName: string;

    @ApiPropertyOptional({
        description:'last name',
        example:""
    })
    lastName: string;

    @ApiPropertyOptional({
        description:'email',
        example:""
    })
    email: string;

    @ApiPropertyOptional({
        description:'country id',
        example:""
    })
    countryId: number;

}