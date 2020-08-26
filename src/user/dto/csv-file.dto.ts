import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class csvFileDto {
	@IsNotEmpty()
	@ApiProperty({
		description: "import csv file&&&csv_file",
		example: "user.csv",
	})
	file: any;
}
