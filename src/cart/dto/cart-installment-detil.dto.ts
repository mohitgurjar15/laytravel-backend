import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, ValidateIf, ValidateNested, ValidationArguments } from 'class-validator';
import { errorMessage } from 'src/config/common.config';
import { InstalmentType } from 'src/enum/instalment-type.enum';
import { ModulesName } from 'src/enum/module.enum';
import { PaymentType } from 'src/enum/payment-type.enum';
export class cartInstallmentsDto {

    @IsNotEmpty({
        message: `Please enter cart id &&&cart_id`,
    })
    @ApiProperty({
        description: `Enter cart id`,
        example: '',
    })
    cartId: string;

    @IsNotEmpty({
        message: `Please enter user id &&&user_id`,
    })
    @ApiProperty({
        description: `Enter user id`,
        example: '',
    })
    userId: string;


}
