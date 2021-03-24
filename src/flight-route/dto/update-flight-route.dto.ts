import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UpdateFlightRouteDto {

    @IsNotEmpty({
        message: `Please enter category id`,
    })
    @ApiProperty({
        description: `category id`,
        example: 1
    })
    category_id: number;
}