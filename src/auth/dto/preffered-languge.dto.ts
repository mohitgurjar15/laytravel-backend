import { IsNotEmpty} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PrefferedLanguageDto {
    @IsNotEmpty()
    @ApiProperty({
        description:'Enter Language ID ',
        example:'1'
    })
    langugeId :number;
}