import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UpdateRewordMarkupDto{
    @IsNotEmpty({
		message: `Please enter reword point.&&&reword`,
	})
    @ApiProperty({
        description:`reword point`,
        example:1
    })
    reword_point:number;

}