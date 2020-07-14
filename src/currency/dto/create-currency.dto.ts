import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCurrencyDto{

    @IsNotEmpty({
		message: `Please enter country.&&&country`,
	})
    @ApiProperty({
        description:`Country Name`,
        example:`USA`
    })
    country:string;

    @IsNotEmpty({
		message: `Please enter currency code.&&&currency_code`,
	})
    @ApiProperty({
        description:`Currency Code`,
        example:`USD`
    })
    currency_code:string;

    @IsNotEmpty({
		message: `Please enter live rate.&&&rate`,
	})
    @ApiProperty({
        description:`Live rate compare to USD (1 USD to EUR = .88, so rate for EUR is 0.88)`,
        example:0.88
    })
    rate:string;
}