import { IsArray, IsEmail, IsNotEmpty, ValidateNested, ValidationArguments } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { Type } from "class-transformer";
import { errorMessage } from "src/config/common.config";

export class multiLangugeDemo {
    @IsNotEmpty({
        message: ``
    })
    @ApiProperty({
        description: 'variable',
        example: ''
    })
    variable: string;

    @ApiProperty({
        description: `is exception`,
        example: true
    })
    is_exception: boolean

}
