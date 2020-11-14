import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class moduleStatusDto {
	@IsNotEmpty({
		message: `Please enter status`,
	})
	@ApiProperty({
		description: `Enter status`,
		example: true,
	})
	status: boolean;
}
