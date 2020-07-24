import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { CurrencyStatusEnum } from "../currency-status.enum";

export class CurrencyEnableDisableDto {
	@IsNotEmpty({
		message: `Please enter status`,
	})
	@ApiProperty({
		description: `Enter status`,
		example: "Enable/Disable",
	})
	status: CurrencyStatusEnum;
}
