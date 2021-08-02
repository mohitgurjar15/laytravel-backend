import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, ValidateIf, ValidateNested, ValidationArguments } from "class-validator";
import { DownPaymentType } from "src/enum/down-payment-type.enum";
import { InstalmentType } from "src/enum/instalment-type.enum";
import { ModulesName } from "src/enum/module.enum";
import { PaymentType } from "src/enum/payment-type.enum";

export class UpdateInstallmentAvailblityDto {
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
        example: "Gold"
    })
    category_name: string;

    @IsNotEmpty({
        message: `Please enter value of allow installment.`,
    })
    @ApiProperty({
        description: `Enter days allow installment`,
        example: true,
    })
    allow_installment: boolean;
}