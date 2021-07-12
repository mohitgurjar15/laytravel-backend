import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    ValidateNested,
    ValidationArguments,
} from "class-validator";

export class BlacklistedUnblacklistedFlightRouteDto {
    @IsNotEmpty({
        message: `Please enter status.`,
    })
    @ApiProperty({
        description: "status",
        example: "",
    })
    isBlackListed: boolean;
}
