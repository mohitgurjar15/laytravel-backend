import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    ValidateNested,
    ValidationArguments,
} from "class-validator";

export class EnableDisableFlightRouteDto {
    @IsNotEmpty({
        message: `Please enter status.`,
    })
    @ApiProperty({
        description: "status",
        example: "",
    })
    status: boolean;
}
