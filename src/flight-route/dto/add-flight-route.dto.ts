import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, ValidateNested, ValidationArguments } from "class-validator";
import { errorMessage } from "src/config/common.config";
import { FlightRouteType } from "src/enum/flight-route-type.enum";

export class AddFlightRouteDto {
           @IsNotEmpty({
               message: `Please enter category id`,
           })
           @ApiProperty({
               description: `category id`,
               example: 1,
           })
           category_id: number;

           @IsEnum([FlightRouteType.DOMESTIC, FlightRouteType.INTERNATIONAL], {
               message: (args: ValidationArguments) => {
                   if (typeof args.value == "undefined" || args.value == "") {
                       return `Please select flight route type.`;
                   } else {
                       return `Please select valid flight route type.(${FlightRouteType.DOMESTIC},${FlightRouteType.INTERNATIONAL}).&&&type&&&${errorMessage}`;
                   }
               },
           })
           @ApiPropertyOptional({
               description: `Select flight route type.(${FlightRouteType.DOMESTIC},${FlightRouteType.INTERNATIONAL})`,
               example: FlightRouteType.DOMESTIC,
           })
           type: string;

           @IsArray()
           @ValidateNested({ each: true })
           @Type(() => fromAirportCode)
           @ApiProperty({
               description: `airport code`,
               example: [
                   {
                       is_parent: true,
                       airport_code: `DEL`,
                   },
                   {
                       is_parent: false,
                       airport_code: `LWS`,
                   },
               ],
           })
           from_airport_codes: fromAirportCode[];

           @IsArray()
           @ValidateNested({ each: true })
           @Type(() => toAirportCode)
           @ApiProperty({
               description: `airport code`,
               example: [
                   {
                       is_parent: false,
                       airport_code: `DEL`,
                   },
                   {
                       is_parent: true,
                       airport_code: `LWS`,
                   },
               ],
           })
           to_airport_codes: toAirportCode[];
       }
class fromAirportCode {
    // @IsEnum(airports, {
    //     message: (args: ValidationArguments) => {
    //         if (typeof args.value == "undefined" || args.value == "") {
    //             return `Please enter airport code`;
    //         } else {
    //             return `Please enter valid airport code`
    //         }
    //     }
    // })
    @IsNotEmpty({
        message: `Please enter airport_code`,
    })
    @ApiProperty({
        description: `airport code`,
        example: 'LWS'
    })
    airport_code: string;

    @ApiPropertyOptional({
        description: `is parent`,
        example: true
    })
    is_parent: boolean
}

class toAirportCode {
    // @IsEnum(airports, {
    //     message: (args: ValidationArguments) => {
    //         if (typeof args.value == "undefined" || args.value == "") {
    //             return `Please enter airport code`;
    //         } else {
    //             return `Please enter valid airport code`
    //         }
    //     }
    // })
    @IsNotEmpty({
        message: `Please enter airport_code`,
    })
    @ApiProperty({
        description: `airport code`,
        example: 'LWS'
    })
    airport_code: string;

    @ApiPropertyOptional({
        description: `is parent`,
        example: true
    })
    is_parent: boolean
}