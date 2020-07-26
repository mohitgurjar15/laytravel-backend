import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ImportUserDto {

	@ApiPropertyOptional({
		type: "string",
		format: "binary",
		description: "csv file url (Allow Only 'csv')",
		example: "user.csv",
	})
	file: string;
}
