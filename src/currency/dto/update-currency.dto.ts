import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateCurrencyDto{

    @IsNotEmpty({
		message: `Please enter live rate.&&&rate`,
	})
    @ApiProperty({
        description:`Live rate compare to USD (1 USD to EUR = .88, so rate for EUR is 0.88)`,
        example:0.88
    })
    rate:string;
}