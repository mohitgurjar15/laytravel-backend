import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, ValidateIf, ValidateNested, ValidationArguments } from 'class-validator';
import { IsValidDate } from 'src/decorator/is-valid-date.decorator';
export class ManullyTakePaymentDto {

    @IsNotEmpty({
        message: `Please enter cart id &&&cart_id`,
    })
    @ApiProperty({
        description: `Enter cart id`,
        example: '',
    })
    cart_id: string;

    @IsNotEmpty({
        message: `Please enter user id &&&user_id`,
    })
    @ApiProperty({
        description: `Enter user id`,
        example: '',
    })
    user_id: string;

    @IsNotEmpty({
        message: `card token`,
    })
    @ApiProperty({
        description: `Enter card token`,
        example: '',
    })
    card_token: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InstallmentDates)
    @ApiProperty({
        description: `Installment dates`,
        example: [
            {
                installment_date: `1995-06-22`
            },
            {
                installment_date: `1995-06-22`
            }
        ]
    })
    installmentDates: InstallmentDates[];

}

class InstallmentDates {

    @IsValidDate('', {
        message: (args: ValidationArguments) => {
            if (typeof args.value == "undefined" || args.value == "") {
                return `Please enter date of installment.&&&installment`;
            } else {
                return `Please enter valid date of installment format(YYYY-MM-DD)&&&installment`;
            }
        },
    })
    @ApiProperty({
        description: `Enter your installment date`,
        example: `1995-06-22`
    })
    installment_date: string;
}
