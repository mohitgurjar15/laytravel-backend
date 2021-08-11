import {
    IsNotEmpty,
    IsEmail,
    MinLength,
    MaxLength,
    Matches,
    ValidationArguments,
    IsEnum,
    notContains,
    IsArray,
    ValidateNested,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Gender } from "src/enum/gender.enum";
import { errorMessage } from "src/config/common.config";
import { IsEqualTo } from "src/auth/password.decorator";
import { NewLandingPageDownPaymentConfigDto } from "./down-payment-config.dto";
import { Type } from "class-transformer";

export class CreateLandingPageDto {
    @IsNotEmpty({
        message: `Please enter your page name.`,
    })
    @ApiProperty({
        description: `Enter Name`,
        example: `AS-410`,
    })
    name: string;

    @IsNotEmpty({
        message: `Please enter your templet name.&&&first_name`,
    })
    @ApiProperty({
        description: `Enter First templet`,
        example: `Blu-boostrap`,
    })
    templet: string;

    @IsNotEmpty({

    })
    default_setting_applied : boolean


    @ValidateNested({ each: true })
    @Type(() => NewLandingPageDownPaymentConfigDto)
    @ApiProperty({
        description: `landing_page_configuration`,
        example: {
            "module_id": [1,3],
            "days_config_id": 2,
            "landing_page_id": "53559f02-3394-4dd8-9488-5684b6f10eb9",
            "offer_criteria": [
              {
                "flight": {
                  "offer_criteria_type": "arrival",
                  "offer_criteria_variable": "airport_code",
                  "offer_criteria_value": [
                    "AMD"
                  ]
                },
                "hotel": {
                  "offer_criteria_type": "city",
                  "offer_criteria_variable": "city",
                  "offer_criteria_value": [
                    "Ahmedabad"
                  ]
                }
              }
            ],
            "down_payment_option": [
              20,
              30,
              40
            ],
            "payment_frequency": [
              "monthly",
              "weekly",
              "biweekly"
            ],
            "down_payment_type": "percentage"
          }
    })
    config :NewLandingPageDownPaymentConfigDto
}
