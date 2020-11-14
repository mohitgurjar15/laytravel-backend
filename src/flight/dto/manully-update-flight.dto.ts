import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class ManullyBookingDto {
    @IsNotEmpty({
        message: `Please enter supplier booking id.&&&id`,
    })
    @ApiProperty({
        description: `supplier booking id`,
        example: `MF15663221`
    })
    supplier_booking_id: string;
}