import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LangunageStatusDto{

    @IsNotEmpty({
		message: `Please enter status.&&&rate`,
	})
    @ApiProperty({
        description:`Please enter status(true,false)`,
        example:true
    })
    status:boolean;
}