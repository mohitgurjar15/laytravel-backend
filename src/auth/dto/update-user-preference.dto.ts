import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, ValidationArguments } from "class-validator";
import { errorMessage } from "src/config/common.config";
import { UserPreference } from "src/enum/user-preference.enum";

export class updateUserPreference {
    
    @IsEnum([UserPreference.Email,UserPreference.SMS],{
        message : (args: ValidationArguments) => {
            if (typeof args.value == "undefined" || args.value == "") {
                return `Please enter preference type.&&&type&&&${errorMessage}`;
            } else {
                return `Please enter preference type(email or sms).&&&type&&&${errorMessage}`
            }
        }
    })
    @ApiProperty({
        description: `User preference type (email or sms)`,
        example: `email`
    })
    type: string;

    @ApiProperty({
        description:"update preference value",
        example:false
    })
    value:boolean
}