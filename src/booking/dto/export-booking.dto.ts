import {  ApiPropertyOptional } from '@nestjs/swagger';
export class ExportBookingDto {
           @ApiPropertyOptional({
               description: "search for date",
               example: "",
           })
           start_date: Date;

           @ApiPropertyOptional({
               description: "userId",
               example: "",
           })
           userId: string;
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
               example: 1,
           })
           booking_type: number;

           @ApiPropertyOptional({
               description: "Customer name",
               example: "steave",
           })
           customer_name: string;

           @ApiPropertyOptional({
               description: "Booking status",
               example: 0,
           })
           booking_status: number;

           @ApiPropertyOptional({
               description: "module id",
               example: "",
           })
           module_id: number;

           @ApiPropertyOptional({
               description: "Payment type",
               example: 1,
           })
           payment_type: number;

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
               description: "Product id",
               example: "",
           })
           product_id: string;
       }