import { IsArray, IsEmail, IsNotEmpty, ValidateNested, ValidationArguments } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { Type } from "class-transformer";
import { errorMessage } from "src/config/common.config";

export class PushNotificationDto {
    @IsNotEmpty({
        message: `Please enter user id &&&limit&&&${errorMessage}`
    })
    @ApiProperty({
        description: 'user id',
        example: ''
    })
    userId: string;

    @ApiProperty({
        description: `Header`,
        example: ``
    })
    header: object

    @ApiProperty({
        description: `body`,
        example: ``
    })
    body: object
}
