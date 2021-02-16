import { IsNotEmpty } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AddCardDto{

    @IsNotEmpty({
		message: `Please enter your card number.&&&card_number&&&Please enter your card number.`,
	})
    @ApiProperty({
        description:`Card Number`,
        example:`1234123412341234`
    })
    card_number:string;

    @IsNotEmpty({
		message: `Please enter card holder name.&&&first_name&&&Please enter card holder name.`,
	})
    @ApiProperty({
        description:`Card holder name`,
        example:`Jon Doe`
    })
    first_name:string;

    @IsNotEmpty({
		message: `Please enter card holder name.&&&last_name&&&Please enter card holder name.`,
	})
    @ApiProperty({
        description:`Card holder name`,
        example:`Jon Doe`
    })
    last_name:string;

    @IsNotEmpty({
		message: `Please enter card cvv.&&&card_cvv&&&Please enter card cvv.`,
	})
    @ApiProperty({
        description:`Card CVV`,
        example:`123`
    })
    card_cvv:string;

    @IsNotEmpty({
		message: `Please enter card expiry.&&&expiry&&&Please enter card expiry.`,
	})
    @ApiProperty({
        description:`Card expiry`,
        example:`12/2022`
    })
    expiry:string;

    @ApiPropertyOptional({
        description: `guest user id`,
        example: ``
    })
    guest_id: string;
}