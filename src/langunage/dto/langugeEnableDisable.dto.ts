import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { langugeStatusEnum } from "../language-status.enum";


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
