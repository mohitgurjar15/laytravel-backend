import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class AddWheelDto{
    @IsNotEmpty({
		message: `Please select option value.&&&option&&&Please select option value.`,
	})
    @ApiProperty({
        description:`option`,
        example:``
    })
    option:string

    @IsNotEmpty({
		message: `Please enter reword point.&&&option&&&Please enter reword point.`,
	})
    @ApiProperty({
        description:`reword point`,
        example: 10
    })
    rewordPoint:number
}
