import { IsArray, IsEmail, IsNotEmpty, ValidateNested, ValidationArguments } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { errorMessage } from "src/config/common.config";

export class WebNotificationDto {
    @IsNotEmpty({
        message: `Please enter user id &&&limit&&&${errorMessage}`
    })
    @ApiProperty({
        description: 'user id',
        example: ''
    })
    userId: string;

    @IsNotEmpty({
        message: `Please enter header &&&limit&&&${errorMessage}`
    })
    @ApiProperty({
        description: `Header`,
        example: ``
    })
    header: object

    @IsNotEmpty({
        message: `Please enter body &&&limit&&&${errorMessage}`
    })
    @ApiProperty({
        description: `body`,
        example: ``
    })
    body: object

    @IsNotEmpty({
        message: `Please enter action id &&&limit&&&${errorMessage}`
    })
    @ApiProperty({
        description: `body`,
        example: [{
            "action": "explore",
            "title": "Go to the site"
        }]
    })
    action: object[]


}
