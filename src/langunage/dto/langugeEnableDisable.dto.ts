import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class LanguageStatusDto {
	@IsNotEmpty({
		message: `Please enter status`,
	})
	@ApiProperty({
		description: `Enter status`,
		example: `true`,
	})
	status: boolean;
}
