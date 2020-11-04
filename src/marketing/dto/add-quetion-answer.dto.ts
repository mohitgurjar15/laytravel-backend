import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, ValidateNested } from "class-validator";

export class AddQuetionDto{

    @IsNotEmpty({
		message: `Please enter quetion &&&quetion`,
	})
    @ApiProperty({
        description:`Enater quetion`,
        example: ``

    })
    quetion :string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => option)
    @ApiProperty({
        description:`options`,
        example:[
            {
                option : ``,
                is_right : true
			},
			{
                option : ``,
                is_right : false
			}
        ]
    })
    options:option[]
}


class option{

    @IsNotEmpty({
		message: `Please select option value.&&&option&&&Please select option value.`,
	})
    @ApiProperty({
        description:`option`,
        example:``
    })
    option:string

    @IsNotEmpty({
		message: `Please select answer value &&&option&&&Please select answer value.`,
	})
    @ApiProperty({
        description:`is right answer`,
        example: true
    })
    is_right:boolean
}
