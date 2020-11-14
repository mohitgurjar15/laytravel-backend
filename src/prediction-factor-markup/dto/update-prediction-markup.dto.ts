import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdatePredictionMarkupDto{

    @IsNotEmpty({
		message: `Please enter prediction markup percentage.&&&markup&&&Please enter prediction markup percentage`,
	})
    @ApiProperty({
        description:`Please enter markup percentage`,
        example:''
    })
    markup_percentage:number;


    @IsNotEmpty({
		message: `Please enter max rate percentage&&&max rate&&&Please enter max rate percentage`,
	})
    @ApiProperty({
        description:`Please enter max rate percentage`,
        example:''
    })
    max_rate_percentage:number;

    @IsNotEmpty({
		message: `Please enter min rate percentage&&&max rate&&&Please enter min rate percentage`,
	})
    @ApiProperty({
        description:`Please enter min rate percentage`,
        example:''
    })
    min_rate_percentage:number;

}