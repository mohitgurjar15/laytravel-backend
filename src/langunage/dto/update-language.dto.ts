import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateLangunageDto{

    @IsNotEmpty({
		message: `Please enter languge name.&&&name`,
	})
    @ApiProperty({
        description:`name`,
        example:`English`
    })
    name:string;
}