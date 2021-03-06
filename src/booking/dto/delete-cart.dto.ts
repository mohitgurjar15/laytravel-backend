import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { errorMessage } from "src/config/common.config";
import { CancellationReason } from "src/enum/cancellation-reason.enum";
export class DeleteBookingDto {
           @IsNotEmpty({
               message: `Please enter booking id &&&limit&&&${errorMessage}`,
           })
           @ApiProperty({
               description: "booking id",
               example: "",
           })
           booking_id: string;

           @ApiPropertyOptional({
               description: "product id",
               example: "",
           })
           product_id: string;

           @ApiPropertyOptional({
               description: "note",
               example: "",
           })
           message: string;

           @ApiPropertyOptional({
               description: "note",
               example: "",
           })
           reason: CancellationReason;
       }
