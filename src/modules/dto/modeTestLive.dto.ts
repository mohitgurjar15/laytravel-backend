import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ModeTestLive {
	@IsNotEmpty({
		message: `Please enter mode`,
	})
	@ApiProperty({
		description: `Enter mode`,
		example: true,
	})
	mode: boolean;
}
