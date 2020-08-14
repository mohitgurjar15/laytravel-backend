import { IsNotEmpty, IsEnum, ValidationArguments } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Role } from "src/enum/role.enum";
import { errorMessage } from "src/config/common.config";

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