import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsEmail, IsNotEmpty, ValidateNested, ValidationArguments } from "class-validator";
import { errorMessage } from "src/config/common.config";

export class QuizResultDto {
    
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => quiz)
    @ApiProperty({
        description: `options`,
        example: [
            {
                option_id: 1,
                question_id: 1
            },
            {
                option_id: 1,
                question_id: 1
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
    question_id: number;
}

