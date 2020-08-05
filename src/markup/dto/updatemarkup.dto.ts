import { IsNotEmpty, IsEnum, ValidationArguments } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Role } from "src/enum/role.enum";
import { errorMessage } from "src/config/common.config";

export class UpdateMarkupDto{

    @IsNotEmpty({
		message: `Please enter Module Id.&&&rate`,
	})
    @ApiProperty({
        description:`Please enter Module ID&&module`,
        example:1
    })
    module_Id:number;


    @IsNotEmpty({
		message: `Please enter Supplier Id.&&&rate`,
	})
    @ApiProperty({
        description:`Please enter Supplier Id`,
        example:221
    })
    supplier_id:number;

    @IsNotEmpty({
        message : `Please select your User Type.&&&User_type`
    })
    @IsEnum([Role.FREE_USER,Role.GUEST_USER,Role.PAID_USER],{
        message : (args: ValidationArguments) => {
            if (typeof args.value == "undefined" || args.value == "") {
                return `Please select your User Type.&&&User Type`;
            } else {
                return `Please select User Type.&&&User_Type&&&${errorMessage}`
            }
        }
    })
    
    @ApiProperty({
        description:`Please enter user type&&user_type`,
        example:6
    })
    user_type:Role;


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