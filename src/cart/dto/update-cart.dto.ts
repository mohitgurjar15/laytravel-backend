import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, ValidateIf, ValidateNested, ValidationArguments } from 'class-validator';
import { errorMessage } from 'src/config/common.config';
import { InstalmentType } from 'src/enum/instalment-type.enum';
import { ModulesName } from 'src/enum/module.enum';
import { PaymentType } from 'src/enum/payment-type.enum';
export class UpdateCartDto {

	@IsNotEmpty({
		message: `Please enter cart id &&&cart_id`,
	})
	@ApiProperty({
		description: `Enter cart id`,
		example: 1,
	})
	cart_id: number;

	
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => Traveler)
	@ApiProperty({
		description: `Traveler ids`,
		example: [
			{
                traveler_id: `c5944389-53f3-4120-84a4-488fb4e94d87`,
                baggage_service_code:''
			},
			{
                traveler_id: `3e37b423-f67e-4c92-bd7c-1f62ed134540`,
                baggage_service_code:''
			}
		]
	})
    travelers: Traveler[];

	@ApiPropertyOptional({
		description: "enter guest id ",
		example: "25f56893-3759-46f1-a845-b90c2c3c488a"
	})
	guest_id: string;
    
}

class Traveler {

	@IsNotEmpty({
		message: `Please select traveler.&&&traveler_id&&&${errorMessage}`,
	})
	@ApiProperty({
		description: `Traveler id`,
		example: `1a600f6e-6775-4266-8dbd-a8a3ad390aed`
	})
    traveler_id: string
    
    @ApiPropertyOptional({
		description: "Enter baggage service code",
		example: ''
	})
	baggage_service_code: string;
}