import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, ValidateIf, ValidateNested, ValidationArguments } from 'class-validator';
import { errorMessage } from 'src/config/common.config';
import { InstalmentType } from 'src/enum/instalment-type.enum';
import { ModulesName } from 'src/enum/module.enum';
import { PaymentType } from 'src/enum/payment-type.enum';
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
