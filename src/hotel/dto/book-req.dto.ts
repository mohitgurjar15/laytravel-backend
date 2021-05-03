import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsObject, IsOptional, IsString, ValidationArguments } from "class-validator";
import { errorMessage } from "src/config/common.config";
import { User } from "src/entity/user.entity";
import { InstalmentType } from "src/enum/instalment-type.enum";
import { PaymentType } from "src/enum/payment-type.enum";
import { InternalDto } from "./internal.dto";

export class BookDto extends InternalDto {
           @ApiProperty({
               description: "User ID of Primary guest",
               required: true,
           })
           @IsString()
           primary_guest: string;

           @ApiProperty({
               description:
                   "Array of User ID's for whom is booking is to be made",
               required: true,
           })
           @IsArray()
           guests: string[];

           @ApiProperty({
               description: "Card Token",
               required: true,
           })
           @IsString()
           card_token: string;

           @ApiProperty({
               description: "Room ID which is selected for booking",
               required: true,
           })
           @IsString()
           room_id: string;

           @ApiProperty({
               description: "Hotel ID for which details are required",
               required: true,
           })
           @IsString()
           hotel_id: string;

           @IsEnum(
               [
                   PaymentType.INSTALMENT,
                   PaymentType.NOINSTALMENT,
                   PaymentType.FULLPOINTS,
                   PaymentType.PARTIALPOINTS,
               ],
               {
                   message: (args: ValidationArguments) => {
                       if (
                           typeof args.value == "undefined" ||
                           args.value == ""
                       ) {
                           return `Please enter payment type.&&&payment_type&&&${errorMessage}`;
                       } else {
                           return `Please enter valid payment type('${(PaymentType.INSTALMENT,
                           PaymentType.NOINSTALMENT)}').&&&payment_type&&&${errorMessage}`;
                       }
                   },
               }
           )
           @ApiProperty({
               description: `Payment type`,
               example: PaymentType.INSTALMENT,
           })
           payment_type: string;

           @IsOptional()
           @ApiProperty({
               description: `Laycredit point to redeem`,
               example: 10,
           })
           laycredit_points: number;

           @IsOptional({
               message: (args: ValidationArguments) => {
                   if (
                       typeof args.value != "undefined" &&
                       ![
                           InstalmentType.WEEKLY,
                           InstalmentType.BIWEEKLY,
                           InstalmentType.MONTHLY,
                       ].includes(args.value)
                   ) {
                       return `Please enter valid instalment type.&&&instalment_type&&&${errorMessage}`;
                   }
               },
           })
           @ApiProperty({
               description: `Instalment type`,
               example: `weekly`,
           })
           instalment_type: string;

           @IsOptional()
           @ApiProperty({
               description: `Additional with payment with instalement`,
               example: 10,
           })
           additional_amount: number;

           @IsOptional()
           @ApiProperty({
               description: `Additional with payment with instalement`,
               example: null,
           })
           custom_instalment_amount: number | null;

           @IsOptional()
           @ApiProperty({
               description: `Additional with payment with instalement`,
               example: null,
           })
           custom_instalment_no: number | null;

           @IsOptional()
           @ApiProperty({
               description: `Booking Through (web,android,ios)`,
               example: `web`,
           })
           booking_through: string;

           /* Internally used properties */
           @IsOptional()
           @IsObject()
           primary_guest_detail?: User;

           @IsOptional()
           @IsObject()
           guest_detail?: User;
       }
