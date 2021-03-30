import { IsNotEmpty } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { errorMessage } from "src/config/common.config";
export class ListPaymentUserDto {
           @IsNotEmpty({
               message: `Please enter limit&&&limit&&&${errorMessage}`,
           })
           @ApiProperty({
               description: "Limit",
               example: 10,
           })
           limit: number;

           @IsNotEmpty({
               message: `Please enter page number&&&page&&&${errorMessage}`,
           })
           @ApiProperty({
               description: "Page number",
               example: 1,
           })
           page_no: number;

           @ApiPropertyOptional({
               description: "search from start date",
               example: "",
           })
           start_date: Date;

           @ApiPropertyOptional({
               description: "search to end date",
               example: "",
           })
           end_date: Date;

           @ApiPropertyOptional({
               description: "Payment module type",
               example: "",
           })
           module_id: number;

           @ApiPropertyOptional({
               description: "instalment status",
               example: "",
           })
           status: number;

           @ApiPropertyOptional({
               description: "instalment type",
               example: "",
           })
           instalment_type: string;

           @ApiPropertyOptional({
               description: "Booking id",
               example: "",
           })
           booking_id: string;


           @ApiPropertyOptional({
               description: "product id",
               example: "",
           })
           product_id: string;
       }
