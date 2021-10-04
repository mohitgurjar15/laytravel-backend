import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    ValidateNested,
    ValidationArguments,
} from "class-validator";

export class ListExistFlightRouteDto {
    @ApiProperty({
        description: "Enter alternate location",
        example: "",
    })
    alternate_location: string;

    @IsNotEmpty({
        message: `Please enter search key word.`,
    })
    @ApiProperty({
        description: "Enter search term",
        example: "",
    })
    search: string;

    @IsNotEmpty({
        message: `Please enter is from location or not.`,
    })
    @ApiProperty({
        description: "Enter from location or not",
        example: "",
    })
    is_from_location: string;
}
