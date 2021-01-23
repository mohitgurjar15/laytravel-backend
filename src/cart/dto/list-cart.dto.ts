import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, ValidateIf, ValidateNested, ValidationArguments } from 'class-validator';
import { errorMessage } from 'src/config/common.config';
import { InstalmentType } from 'src/enum/instalment-type.enum';
import { ModulesName } from 'src/enum/module.enum';
import { PaymentType } from 'src/enum/payment-type.enum';
export class ListCartDto {

	@IsEnum(['yes', 'no'], {
		message: (args: ValidationArguments) => {
			if (typeof args.value == "undefined" || args.value == "") {
				return `Please select your live aviliblity.&&&live_aviliblity`;
			} else {
				return `Please select valid live aviliblity('yes','no').&&&live_aviliblity&&&${errorMessage}`
			}
		}
	})
	@ApiProperty({
		description: "Enter live availiblity",
		example: 'yes'
	})
	live_availiblity: string;
}
