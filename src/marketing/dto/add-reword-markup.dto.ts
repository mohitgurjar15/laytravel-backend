import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class addRewordMarkupDto{

    @IsNotEmpty({
		message: `Please enter game id.&&&id`,
	})
    @ApiProperty({
        description:`game id`,
        example:1
    })
    game_id:number;

    @IsNotEmpty({
		message: `Please enter answer value.&&&answer`,
	})
    @ApiProperty({
        description:`Enater answer value`,
        example: `1`

    })
    answer_value:string;

    @IsNotEmpty({
		message: `Please enter reword point.&&&reword`,
	})
    @ApiProperty({
        description:`reword point`,
        example:1
    })
    reword_point:number;

}