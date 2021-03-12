import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsNotEmpty,
    ValidateIf,
    ValidateNested,
    ValidationArguments,
} from "class-validator";
import { errorMessage } from "src/config/common.config";
import { InstalmentType } from "src/enum/instalment-type.enum";
import { ModulesName } from "src/enum/module.enum";
export class updateBookingDto {
    @IsNotEmpty({
        message: `Please enter module id &&&module_id`,
    })
    @ApiProperty({
        description: `Enter module id`,
        example: 1,
    })
    module_id: number;

    
    @ValidateIf((o) => o.module_id == ModulesName.FLIGHT)
    @IsNotEmpty({
        message: `Please select route code.&&&route_code`,
    })
    @ApiProperty({
        description: `Select route code`,
        example: ``,
    })
    route_code: string;

    @ValidateIf((o) => o.module_id == ModulesName.VACATION_RENTEL)
    @IsNotEmpty({
        message: `Please enter property_id.&&&property_id`,
    })
    @ApiProperty({
        description: "Enter a property id",
        example: 42945378516991,
    })
    property_id: number;

    @ValidateIf((o) => o.module_id == ModulesName.VACATION_RENTEL)
    @IsNotEmpty({
        message: `Please enter room_id.&&&room_id`,
    })
    @ApiProperty({
        description: `Enter room id`,
        example: 42945378451569,
    })
    room_id: number;

    @ApiProperty({
        description: "Enter rate plan selected for price check.  ",
        example: "ThisUnitTypeHasDepositsPaidOnArrivalAmount",
    })
    rate_plan_code: string;

    @ApiProperty({
        description: "Enter a check in date",
        example: "2021-01-05",
    })
    check_in_date: string;

    @ApiProperty({
        description: "Enter a check out date",
        example: "2021-01-15",
    })
    check_out_date: string;

    @ApiProperty({
        description: "Enter a adult count",
        example: 2,
    })
    adult_count: number;

    @Type(() => Number)
    @ApiProperty({
        description: `Children ages collection`,
        example: [10, 12, 15],
    })
    number_and_children_ages: Array<Number>;
}
