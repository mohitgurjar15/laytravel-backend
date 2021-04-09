import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, ValidationArguments } from "class-validator";
import { errorMessage } from "src/config/common.config";
import { FlightRouteType } from "src/enum/flight-route-type.enum";

export class UpdateFlightRouteDto {
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
                return `Please select valid flight route type (${FlightRouteType.DOMESTIC},${FlightRouteType.INTERNATIONAL}).&&&type&&&${errorMessage}`;
            }
        },
    })
    @ApiPropertyOptional({
        description: `Select flight route type.(${FlightRouteType.DOMESTIC},${FlightRouteType.INTERNATIONAL})`,
        example: FlightRouteType.DOMESTIC,
    })
    type: string;
}
