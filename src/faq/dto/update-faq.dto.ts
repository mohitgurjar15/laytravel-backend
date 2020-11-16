import { IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFaqDto {

    @IsNotEmpty({
        message : `Please enter category id&&&category`
    })
    @ApiProperty({
        description: `Enter category id`,
        example: `1`
    })
    categoryId: number;

    @IsNotEmpty({
        message : `Please enter question.&&&question`
    })
    @ApiProperty({
        description: `Enter question`,
        example: `At what time is check-in?`
    })
    question: string;


    @IsNotEmpty({
        message : `Please enter answer.&&&answer`
    })
    @ApiProperty({
        description: `Enter answer`,
        example: `In Evening 5:00 am`
    })
    answer: string;
}