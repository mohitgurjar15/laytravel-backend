import { IsNotEmpty } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateLaytripCategoryDto{

    @IsNotEmpty({
		message: `Please enter category name`,
	})
    @ApiProperty({
        description:`category name`,
        example:`Golden`
    })
    name:string;

    @ApiPropertyOptional({
        description:`Installment available after`,
        example: 30
    })
    instalmentAfter:number;
}