import {
    IsNotEmpty,
    ValidationArguments,
    IsEnum,
    IsArray,
    ValidateNested,
    IsOptional,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { errorMessage } from "src/config/common.config";
import { Type } from "class-transformer";
import { PaymentType } from "src/enum/payment-type.enum";
import { InstalmentType } from "src/enum/instalment-type.enum";

export class BookFlightDto {
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

           @IsOptional()
           @ApiProperty({
               description: `Card token`,
               example: `XXXXXX-XXXXX-XXXXXX`,
           })
           card_token: string;

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

           @IsNotEmpty({
               message: `Please enter route code.&&&route_code&&&${errorMessage}`,
           })
           @ApiProperty({
               description: `Flight route code`,
               example: `lkjekje82r2rfwjef99304933sfff44`,
           })
           route_code: string;

           @IsOptional()
           @ApiProperty({
               description: `Booking Through (web,android,ios)`,
               example: `web`,
           })
           booking_through: string;

           @IsArray()
           @ValidateNested({ each: true })
           @Type(() => Traveler)
           @ApiProperty({
               description: `Traveler ids`,
               example: [
                   {
                       traveler_id: `c5944389-53f3-4120-84a4-488fb4e94d87`,
                       is_primary_traveler: false,
                   },
                   {
                       traveler_id: `3e37b423-f67e-4c92-bd7c-1f62ed134540`,
                       is_primary_traveler: false,
                   },
               ],
           })
           travelers: Traveler[];

           @ApiPropertyOptional({
               description: "total cart count",
               example: false,
           })
           cartCount?: number;

           @ApiPropertyOptional({
               description: "reservation id",
               example: 1,
           })
           reservationId?: string;
       }

class Traveler {
    @IsNotEmpty({
        message: `Please select traveler.&&&traveler_id&&&${errorMessage}`,
    })
    @ApiProperty({
        description: `Traveler id`,
        example: `1a600f6e-6775-4266-8dbd-a8a3ad390aed`,
    })
    traveler_id: string;

    @ApiPropertyOptional({
        description: "is primary traveler",
        example: false,
    })
    is_primary_traveler?: boolean;

    
}
