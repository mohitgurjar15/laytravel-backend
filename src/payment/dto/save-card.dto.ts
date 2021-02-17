import { IsNotEmpty } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SaveCardDto{

    @IsNotEmpty({
		message: `Please enter your card type.&&&card_type&&&Please enter your card type.`,
	})
    @ApiProperty({
        description:`Card type`,
        example:`master`
    })
    card_type:string;

    @IsNotEmpty({
		message: `Please enter card holder name.&&&card_holder_name&&&Please enter card holder name.`,
	})
    @ApiProperty({
        description:`Card holder name`,
        example:`Jon Doe`
    })
    card_holder_name:string;

    @IsNotEmpty({
		message: `Please enter card token.&&&card_token&&&Please enter card token.`,
	})
    @ApiProperty({
        description:`Card token`,
        example:`xxxxxxxxxxxxx`
    })
    card_token:string;

    @IsNotEmpty({
		message: `Please enter card last (4 or 6) digit.&&&card_last_digit&&&Please enter card last (4 or 6) digit.`,
	})
    @ApiProperty({
        description:`Card last digit`,
        example:`xxxxxxxxxxxxx`
    })
    card_last_digit:string;

    @ApiProperty({
        description:`Card meta`,
        example:`{}`
    })
    card_meta:{};
}