import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class MultipleInventryDeleteFromCartDto {
    @IsNotEmpty({
        message: `Please select cart.&&&cart_id`,
    })
    @ApiProperty({
        description: `cart id`,
        example: 1
    })
    id: number[]

}