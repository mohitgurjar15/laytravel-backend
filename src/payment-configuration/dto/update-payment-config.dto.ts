import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, ValidateIf, ValidateNested, ValidationArguments } from "class-validator";
import { DownPaymentType } from "src/enum/down-payment-type.enum";
import { ModulesName } from "src/enum/module.enum";
import { PaymentType } from "src/enum/payment-type.enum";

export class UpdatePaymentConfigurationDto {
    @IsNotEmpty({
        message: `Please enter module id.&&&module id`,
    })
    @ApiProperty({
        description: `Enter module id`,
        example: 1,
    })
    module_id: number;

    @ValidateIf((o) => o.module_id == ModulesName.FLIGHT)
    @IsNotEmpty({
        message: `Please select category name.&&&category id`,
    })
    @ApiPropertyOptional({
        description: 'category name',
        example: 1
    })
    category_name: string;

    @IsNotEmpty({
        message: `Please enter days config id.`,
    })
    @ApiProperty({
        description: `Enter days config id`,
        example: 1,
    })
    days_config_id: number;

    @ValidateIf((o) => o.allow_installment == 'true')
    @IsArray()
    @ValidateNested({ each: true })
    @IsNotEmpty({
        message: `Please enter days down payment option.`,
    })
    @ApiProperty({
        description: `Enter days down payment option`,
        example: 1,
    })
    down_payment_option: number[];

    @ValidateIf((o) => o.allow_installment == 'true')
    @IsArray()
    @ValidateNested({ each: true })
    @IsNotEmpty({
        message: `Please enter payment frequency.`,
    })
    @ApiProperty({
        description: `Enter  payment frequency`,
        example: 1,
    })
    payment_frequency: PaymentType[];

    @ValidateIf((o) => o.allow_installment == 'true')
    @IsEnum([DownPaymentType.PERCENTAGE, DownPaymentType.FLAT], {
    	message: (args: ValidationArguments) => {
    		if (typeof args.value == "undefined" || args.value == "") {
                return `Please select down payment type`;
    		} else {
                return `Please select down payment type('${DownPaymentType.PERCENTAGE}','${DownPaymentType.FLAT}')`;
    		}
    	},
    })
    @ApiProperty({
        description: `Enter down payment type`,
        example: 1,
    })
    down_payment_type: DownPaymentType;

    @IsNotEmpty({
        message: `Please enter value of allow installment.`,
    })
    @ApiProperty({
        description: `Enter days allow installment`,
        example: 1,
    })
    allow_installment: boolean;
}