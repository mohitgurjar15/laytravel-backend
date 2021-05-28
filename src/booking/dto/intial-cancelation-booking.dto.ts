import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { errorMessage } from "src/config/common.config";
export class IntialCancelBookingDto {
           @IsNotEmpty({
               message: `Please enter booking id &&&limit&&&${errorMessage}`,
           })
           @ApiProperty({
               description: "booking id",
               example: ['LTFKMAM5Z29'],
           })
           product_id: string[];

           @IsNotEmpty({
               message: `Please enter cart booking id &&&limit&&&${errorMessage}`,
           })
           @ApiProperty({
               description: "cart booking id",
               example: "",
           })
           booking_id: string;

           @ApiPropertyOptional({
               description: "note",
               example: "",
           })
           message: string;
       }
