import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class ActiveInactiveGameDto{

    @IsNotEmpty({
		message: `Please enter game status&&&status`,
	})
    @ApiProperty({
        description:`enter game status`,
        example: true
    })
    status:boolean;
}