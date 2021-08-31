import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Language } from 'src/entity/language.entity';

export class InsertFaqDto {

    @IsNotEmpty({
        message : `Please enter category id&&&category`
    })
    @ApiProperty({
        description: `Enter category id`,
        example: `1`
    })
    categoryId: number;

    @IsArray()
    @ValidateNested({ each: true })
    @ApiProperty({
        description: `faq`,
        example: [
            {
                question:"What is laytrip",
                answer : "Laytrip is travel agency.",
                language_id : 1
            }
        ]
    })
    faqs: Faq[]

}

class Faq {
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
    @ApiProperty({
        description: `Enter lanfuage_id`,
        example: `1`
    })
    language_id : Language;
}