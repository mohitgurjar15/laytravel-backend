import { ApiPropertyOptional } from "@nestjs/swagger";
import { ValidateIf } from "class-validator";
import { BookingStatus } from "src/enum/booking-status.enum";
import { BookingType } from "src/enum/booking-type.enum";
import { ModulesName } from "src/enum/module.enum";
import { PaymentType } from "src/enum/payment-type.enum";
import { Role } from "src/enum/role.enum";

export class ExportBookingDto {
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

           @ApiPropertyOptional({
               type: "string",
               description: "user email id",
           })
           email: string;

           // @ValidateIf((o) => o.booking_through != "undefined")
           // @IsEnum(['ios','web','android'],{
           //     message : (args: ValidationArguments) => {
           //         if (typeof args.value != "undefined" || args.value != "") {
           //             return `Please enter valid booking through up type('ios','web','android').&&&signup_via&&&Please enter valid booking through ('ios','web','android')`
           //         }
           //     }
           // })
           @ApiPropertyOptional({
               description: `enter valid booking through`,
               example: ``,
           })
           booking_through: string[];

           @ApiPropertyOptional({
               description: "reservation id",
           })
           reservationId: string;

           userId?: string;

           @ApiPropertyOptional({
               description: "category name",
           })
           category_name: string[];

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
       }
