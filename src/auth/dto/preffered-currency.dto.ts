import { IsNotEmpty} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PrefferedCurrencyDto {
    @IsNotEmpty()
    @ApiProperty({
        description:'Enter Currency ID ',
        example:'1'
    })
    currencyId :number;
}