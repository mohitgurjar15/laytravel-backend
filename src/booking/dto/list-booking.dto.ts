import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    ValidateIf,
    ValidationArguments,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { errorMessage } from "src/config/common.config";
import { BookingType } from "src/enum/booking-type.enum";
import { BookingStatus } from "src/enum/booking-status.enum";
import { ModulesName } from "src/enum/module.enum";
import { PaymentType } from "src/enum/payment-type.enum";
import { Type } from "class-transformer";
import { Role } from "src/enum/role.enum";
import { combineStatus } from "src/enum/booking-new-status.enum";
import { CancellationReason } from "src/enum/cancellation-reason.enum";
export class ListBookingDto {
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
               description: "search for date",
               example: "",
           })
           start_date: Date;

           @ApiPropertyOptional({
               description: "booking date",
               example: "",
           })
           booking_date: Date;

           @ApiPropertyOptional({
               description: "depature date",
               example: "",
           })
           depature_date: Date;

           @ApiPropertyOptional({
               description: "search for date",
               example: "",
           })
           end_date: Date;

           @ApiPropertyOptional({
               description: "Booking type search",
           })
           booking_type: BookingType[];

           @ApiPropertyOptional({
               description: "category name",
           })
           category_name: string[];

           @ApiPropertyOptional({
               description: "Customer name",
               example: "steave",
           })
           customer_name: string;

           @ApiPropertyOptional({
               description: "Booking status",
           })
           booking_status: BookingStatus[];

           @ApiPropertyOptional({
               description: "module id",
           })
           module_id: ModulesName[];

           @ApiPropertyOptional({
               description: "Payment type",
           })
           payment_type: PaymentType[];

           @ApiPropertyOptional({
               description: "Product id",
               example: "",
           })
           product_id: string;

           @ApiPropertyOptional({
               description: "booking id",
               example: "",
           })
           booking_id: string;

           @ApiPropertyOptional({
               description: "supplier id",
               example: "",
           })
           supplier_id: number;

           @ApiPropertyOptional({
               description: "search with keyword",
               example: "",
           })
           search: string;

           @ApiPropertyOptional({
               description: "search with transaction token",
               example: "",
           })
           transaction_token: string;

           @ValidateIf((o) => o.email != "undefined")
           @ApiPropertyOptional({
               type: "string",
               description: "user email id",
           })
           email: string;
           @ApiPropertyOptional({
               description: `enter valid booking through`,
               example: ``,
           })
           booking_through: string[];

           @ApiPropertyOptional({
               description: "reservation id",
           })
           reservationId: string;

           @ApiPropertyOptional({
               description: "update By",
           })
           update_by: Role[];
           @ApiPropertyOptional({
               description: "cancelationDate",
           })
           order_by_cancelation_date: string;

           @ApiPropertyOptional({
               description: "cancelationDate",
           })
           order_by_booking_date: string;

           @ApiPropertyOptional({
               description: "cancelationDate",
           })
           order_by_depature_date: string;

           @ApiPropertyOptional({
               description: "status",
           })
           status: combineStatus[];

           @ApiPropertyOptional({
               description: "cantiallation reasons",
           })
           cancellation_reasons: CancellationReason[];

           @ApiPropertyOptional({
               description: "search with transaction token",
               example: "",
           })
           supplier_booking_id: string;
       }

// class OrderBy {
//     @ApiPropertyOptional({
//         description: "cancelation date",
//     })
//     cancelationDate: string;

//     @ApiPropertyOptional({
//         description: "booking date",
//     })
//     bookingDate: string;

//     @ApiPropertyOptional({
//         description: "booking date",
//     })
//     depatureDate: string;
// }
