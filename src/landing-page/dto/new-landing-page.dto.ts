import {
    IsNotEmpty,
    IsEmail,
    MinLength,
    MaxLength,
    Matches,
    ValidationArguments,
    IsEnum,
    notContains,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Gender } from "src/enum/gender.enum";
import { errorMessage } from "src/config/common.config";
import { IsEqualTo } from "src/auth/password.decorator";

export class CreateLandingPageDto {
    @IsNotEmpty({
        message: `Please enter your page name.`,
    })
    @ApiProperty({
        description: `Enter Name`,
        example: `AS-410`,
    })
    name: string;

    @IsNotEmpty({
        message: `Please enter your templet name.&&&first_name`,
    })
    @ApiProperty({
        description: `Enter First templet`,
        example: `Blu-boostrap`,
    })
    templet: string;
}
