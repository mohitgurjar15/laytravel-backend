import {  ApiPropertyOptional } from '@nestjs/swagger';

export class ListCartDto {

	@ApiPropertyOptional({
		description: "Enter live availiblity",
		example: 'yes'
	})
	live_availiblity: string;

}
