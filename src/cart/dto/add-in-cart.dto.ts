import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, ValidateIf } from 'class-validator';
import { ModulesName } from 'src/enum/module.enum';
export class AddInCartDto {

    @IsNotEmpty({
		message: `Please enter module id &&&module_id`,
	})
	@ApiProperty({
		description: `Enter module id`,
		example: 1,
	})
	module_id: number;

    @ValidateIf((o) => o.module_id == ModulesName.FLIGHT)	
	@IsNotEmpty({
		message: `Please select route code.&&&route_code`,
	})
	@ApiProperty({
		description: `Select route code`,
		example: ``,
	})
	route_code: string;

}