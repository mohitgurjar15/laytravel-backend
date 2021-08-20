import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, ValidateIf, ValidateNested, ValidationArguments } from "class-validator";
import { DownPaymentType } from "src/enum/down-payment-type.enum";
import { InstalmentType } from "src/enum/instalment-type.enum";
import { ModulesName } from "src/enum/module.enum";
import { OfferCriteriaVariables } from "src/enum/offer-criteria-variables.enum";
import { OfferCriterias } from "src/enum/offer-criteria.enum";
import { PaymentType } from "src/enum/payment-type.enum";

export class ListDownPaymentDto {
    @IsNotEmpty({
        message: `Please enter module id.&&&module id`,
    })
    @ApiProperty({
        description: `Enter module id`,
        example: 1,
    })
    module_id: number;

    @IsNotEmpty({
        message: `Please enter landing page id.`,
    })
    @ApiProperty({
        description: `Enter days landing page id.`,
        example: 'dww1131qqd-13weweqwe21-21312eqeqwe2q22',
    })
    landing_page_id: string;

   
}