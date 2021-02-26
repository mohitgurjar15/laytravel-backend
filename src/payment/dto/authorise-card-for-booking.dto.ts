import { IsNotEmpty, ValidationArguments, IsEnum, IsArray, ValidateNested, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { errorMessage } from "src/config/common.config";
import { Type } from 'class-transformer';
import { PaymentType } from "src/enum/payment-type.enum";
import { InstalmentType } from "src/enum/instalment-type.enum";

export class AuthoriseCartDto {

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
        example: 0
    })
    laycredit_points: number;

    @IsOptional()
    @ApiProperty({
        description: `Card token`,
        example: `aFulDTtYbr9ifg7diCEzO6lIVhE`
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
        example: 0
    })
    additional_amount: number;

    
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
    cart: Cart[];

    @IsNotEmpty({
        message: `enter browser_info`,
    })
    @ApiProperty({
        description: `browser_info `,
        example: `eyJ3aWR0aCI6MTQ0MCwiaGVpZ2h0Ijo4MTAsImRlcHRoIjoyNCwidGltZXpvbmUiOi0zMzAsInVzZXJfYWdlbnQiOiJNb3ppbGxhLzUuMCAoWDExOyBMaW51eCB4ODZfNjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS84MC4wLjM5ODcuMTA2IFNhZmFyaS81MzcuMzYiLCJqYXZhIjpmYWxzZSwibGFuZ3VhZ2UiOiJlbi1HQiIsImJyb3dzZXJfc2l6ZSI6IjAxIiwiYWNjZXB0X2hlYWRlciI6InRleHQvaHRtbCxhcHBsaWNhdGlvbi94aHRtbCt4bWwsYXBwbGljYXRpb24veG1sO3E9MC45LCovKjtxPTAuOCJ9`
    })
    browser_info: string

    @IsNotEmpty({
        message: `enter site_url`,
    })
    @ApiProperty({
        description: `site_url `,
        example: `https://demo.eztoflow.com`
    })
    site_url: string
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