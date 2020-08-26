import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateMarkupDto{

    @IsNotEmpty({
		message: `Please enter operator.&&&operator`,
	})
    @ApiProperty({
        description:`Please enter Operater && operator`,
        example:'*'
    })
    operator:string;


    @IsNotEmpty({
		message: `Please enter Operand && operand`,
	})
    @ApiProperty({
        description:`Please enter Operand && operand`,
        example:'1.25'
    })
    operand:string;

}