import { IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';

export class InsertFaqDto {

    @IsNotEmpty({
        message : `Please enter category&&&category`
    })
    @ApiProperty({
        description: `Enter category`,
        example: `facility`
    })
    category: string;

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