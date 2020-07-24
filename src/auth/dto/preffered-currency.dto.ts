import { IsNotEmpty} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Currency } from "src/entity/currency.entity";

export class PrefferedCurrencyDto {
    @IsNotEmpty()
    @ApiProperty({
        description:'Enter Currency ID ',
        example:'1'
    })
    currencyId :number;
}