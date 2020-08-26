import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { errorMessage } from "src/config/common.config";

export class SaveCardDto{

    @IsNotEmpty({
		message: `Please enter your card type.&&&card_type&&&${errorMessage}`,
	})
    @ApiProperty({
        description:`Card type`,
        example:`master`
    })
    card_type:string;

    @IsNotEmpty({
		message: `Please enter card holder name.&&&card_holder_name&&&${errorMessage}`,
	})
    @ApiProperty({
        description:`Card holder name`,
        example:`Jon Doe`
    })
    card_holder_name:string;

    @IsNotEmpty({
		message: `Please enter card token.&&&card_token&&&${errorMessage}`,
	})
    @ApiProperty({
        description:`Card token`,
        example:`xxxxxxxxxxxxx`
    })
    card_token:string;

    @IsNotEmpty({
		message: `Please enter card last (4 or 6) digit.&&&card_last_digit&&&${errorMessage}`,
	})
    @ApiProperty({
        description:`Card token`,
        example:`xxxxxxxxxxxxx`
    })
    card_last_digit:string;
}