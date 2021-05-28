import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { errorMessage } from "src/config/common.config";
export class ReverceIntialCancelBookingDto {
           @IsNotEmpty({
               message: `Please enter booking id &&&limit&&&${errorMessage}`,
           })
           @ApiProperty({
               description: "booking id",
               example: "",
           })
           product_id: string[];

           @ApiPropertyOptional({
               description: "note",
               example: "",
           })
           message: string;
       }
