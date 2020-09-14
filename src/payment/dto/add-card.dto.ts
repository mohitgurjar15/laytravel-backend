import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { errorMessage } from "src/config/common.config";

export class AddCardDto{

    @IsNotEmpty({
		message: `Please enter your card number.&&&card_number&&&${errorMessage}`,
	})
    @ApiProperty({
        description:`Card Number`,
        example:`1234123412341234`
    })
    card_number:string;

    @IsNotEmpty({
		message: `Please enter card holder name.&&&first_name&&&${errorMessage}`,
	})
    @ApiProperty({
        description:`Card holder name`,
        example:`Jon Doe`
    })
    first_name:string;

    @IsNotEmpty({
		message: `Please enter card holder name.&&&last_name&&&${errorMessage}`,
	})
    @ApiProperty({
        description:`Card holder name`,
        example:`Jon Doe`
    })
    last_name:string;

    @IsNotEmpty({
		message: `Please enter card cvv.&&&card_cvv&&&${errorMessage}`,
	})
    @ApiProperty({
        description:`Card CVV`,
        example:`123`
    })
    card_cvv:string;

    @IsNotEmpty({
		message: `Please enter card expiry.&&&expiry&&&${errorMessage}`,
	})
    @ApiProperty({
        description:`Card expiry`,
        example:`12/2022`
    })
    expiry:string;
}