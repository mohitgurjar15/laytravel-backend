import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UpdateGameDto{

    @IsNotEmpty({
		message: `Please enter available cron time.&&&time`,
	})
    @ApiProperty({
        description:`Enater avilble cron time in hrs`,
        example:1
    })
    available_after:number;
}