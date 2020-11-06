import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsEmail, IsNotEmpty, ValidateNested, ValidationArguments } from "class-validator";
import { errorMessage } from "src/config/common.config";

export class QuizResultDto {

    @IsNotEmpty({
        message: `Please enter user id.&&&id&&&${errorMessage}`,
    })
    @ApiProperty({
        description: `user id`,
        example: 1
    })
    user_id: number;

    
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => quiz)
    @ApiProperty({
        description: `options`,
        example: [
            {
                option_id: 1,
                quetion_id: 1
            },
            {
                option_id: 1,
                quetion_id: 1
            }
        ]
    })
    quiz_answer: quiz[]
}


class quiz {

    @IsNotEmpty({
        message: `Please select option Id.&&&option&&&${errorMessage}`,
    })
    @ApiProperty({
        description: `option id`,
        example: 1
    })
    option_id: number

    @IsNotEmpty({
        message: `Please enter quetion ID &&&quetion&&&${errorMessage}`,
    })
    @ApiProperty({
        description: `Enater quetion id`,
        example: ``

    })
    quetion_id: number;
}
