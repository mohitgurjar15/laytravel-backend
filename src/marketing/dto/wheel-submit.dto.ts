import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { errorMessage } from "src/config/common.config";

export class SubmitWheelDto{

    @IsNotEmpty({
		message: `Please enter user Id&&&name&&&${errorMessage}`,
	})
    @ApiProperty({
        description:`user id`,
        example:``
    })
    user_id:number;

    @IsNotEmpty({
		message: `Please enter reword point&&&reword point&&&${errorMessage}`,
	})
    @ApiProperty({
        description:`reword point`,
        example:1

    })
    reword_point:number;
}