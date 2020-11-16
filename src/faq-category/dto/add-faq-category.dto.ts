import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class AddFaqCategoryDto {

    @IsNotEmpty({
        message: `Please enter name&&&subject&&&Please enter name`
    })
    @ApiProperty({
        description: 'Enter name',
        example: ''
    })
    name: string;
}