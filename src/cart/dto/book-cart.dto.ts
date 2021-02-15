import { IsNotEmpty, ValidationArguments, IsEnum, IsArray, ValidateNested, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { errorMessage } from "src/config/common.config";
import { Type } from 'class-transformer';
import { PaymentType } from "src/enum/payment-type.enum";
import { InstalmentType } from "src/enum/instalment-type.enum";

export class CartBookDto {

    @IsEnum([PaymentType.INSTALMENT, PaymentType.NOINSTALMENT, PaymentType.FULLPOINTS, PaymentType.PARTIALPOINTS], {
        message: (args: ValidationArguments) => {
            if (typeof args.value == "undefined" || args.value == "") {
                return `Please enter payment type.&&&payment_type&&&${errorMessage}`;
            } else {
                return `Please enter valid payment type('${PaymentType.INSTALMENT, PaymentType.NOINSTALMENT}').&&&payment_type&&&${errorMessage}`
            }
        }
    })
    @ApiProperty({
        description: `Payment type`,
        example: PaymentType.INSTALMENT
    })
    payment_type: string;

    @IsOptional()
    @ApiProperty({
        description: `Laycredit point to redeem`,
        example: 10
    })
    laycredit_points: number;

    @IsOptional()
    @ApiProperty({
        description: `Card token`,
        example: `XXXXXX-XXXXX-XXXXXX`
    })
    card_token: string;

    @IsOptional()
    @ApiProperty({
        description: `selected down payment`,
        example: 0
    })
    selected_down_payment: number

    @IsOptional({
        message: (args: ValidationArguments) => {
            if (typeof args.value != "undefined" && ![InstalmentType.WEEKLY, InstalmentType.BIWEEKLY, InstalmentType.MONTHLY].includes(args.value)) {
                return `Please enter valid instalment type.&&&instalment_type&&&${errorMessage}`;
            }
        }
    })
    @ApiProperty({
        description: `Instalment type`,
        example: `weekly`
    })
    instalment_type: string;

    @IsOptional()
    @ApiProperty({
        description: `Additional with payment with instalement`,
        example: 10
    })
    additional_amount: number;

    @IsOptional()
    @ApiProperty({
        description: `Booking Through (web,android,ios)`,
        example: `web`
    })
    booking_through: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Cart)
    @ApiProperty({
        description: `cart ids`,
        example: [
            {
                cart_id: 1
            },
            {
                cart_id: 2
            }
        ]
    })
    cart: Cart[]
}

class Cart {

    @IsNotEmpty({
        message: `Please select cart.&&&cart_id`,
    })
    @ApiProperty({
        description: `cart id`,
        example: 1
    })
    cart_id: number
}