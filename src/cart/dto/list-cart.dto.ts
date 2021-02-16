import {  ApiPropertyOptional } from '@nestjs/swagger';

export class ListCartDto {

	@ApiPropertyOptional({
		description: "Enter live availiblity",
		example: 'yes'
	})
	live_availiblity: string;

	@ApiPropertyOptional({
		description: "enter guest id ",
		example: "25f56893-3759-46f1-a845-b90c2c3c488a"
	})
	guest_id: string;
}
