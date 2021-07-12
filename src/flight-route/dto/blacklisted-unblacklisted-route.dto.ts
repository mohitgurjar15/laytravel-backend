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
    @IsArray()
	@ValidateNested({ each: true })
	@Type(() => blackListedArray)
	@ApiProperty({
		description: `blackListedArray`,
		example: [{ "code": "Amd","isBlackListed":true }]
	})
 blackListedArray:blackListedArray[];
}

class blackListedArray {

	@ApiProperty({
		description: `Enter code`,
		example: `AMD`
	})
	code: string;
	@ApiProperty({
		description: `Enter status`,
		example: true
	})
	isBlackListed: boolean;
}