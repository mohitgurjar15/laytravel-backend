import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { moduleStatusEnum } from "../module-status.enum";

export class moduleStatusDto {
	@IsNotEmpty({
		message: `Please enter status`,
	})
	@ApiProperty({
		description: `Enter status`,
		example: `Enable/Disable`,
	})
	status: moduleStatusEnum;
}
