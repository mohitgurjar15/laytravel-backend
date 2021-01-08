import { IsArray, IsEmail, IsNotEmpty, ValidateNested, ValidationArguments } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { errorMessage } from "src/config/common.config";
import { Role } from "src/enum/role.enum";

export class MassCommunicationDto {

    @IsNotEmpty({
        message: `Please enter subject`
    })
    @ApiProperty({
        description: `subject`,
        example: ``
    })
    subject: string

    @IsNotEmpty({
        message: `Please enter email body`
    })
    @ApiProperty({
        description: `email body`,
        example: ``
    })
    email_body: string


    @ApiPropertyOptional({
        description: `role`,
        example: [6]
    })
    role: Role[] 
}
