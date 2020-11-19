import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, Min, ValidateIf, ValidationArguments } from "class-validator";
import { errorMessage } from "src/config/common.config";
import { LaytripPointSubscriptionType } from "src/enum/laytrip-point-subscription-type.emum";
import { LaytripPointsType } from "src/enum/laytrip-point-type.enum";

export class AddLaytripPoint {

    @IsNotEmpty({
        message : `Please enter points&&&point&&&Please enter points`
    })
    @ApiProperty({
        description:'Please enter points',
        example:10
    })
    points:number;

    @IsNotEmpty({
        message : `Please enter card Token&&&point&&&Please select your card`
    })
    @ApiProperty({
        description:`Card token`,
        example:`XXXXXX-XXXXX-XXXXXX`
    })
    card_token:string;

    @IsEnum([LaytripPointsType.ONETIME,LaytripPointsType.RECURRING],{
        message : (args: ValidationArguments) => {
            if (typeof args.value == "undefined" || args.value == "") {
                return `Please enter type.&&&type&&&${errorMessage}`;
            } else {
                return `Please enter valid type.&&&type&&&${errorMessage}`
            }
        }
    })
    @ApiProperty({
        description:`type`,
        example:1
    })
    type:number;


    @ValidateIf(o => o.type == LaytripPointsType.RECURRING)
    @IsEnum([LaytripPointSubscriptionType.WEEKLY,LaytripPointSubscriptionType.BIWEEKLY,LaytripPointSubscriptionType.MONTHLY],{
        message : (args: ValidationArguments) => {
            if (typeof args.value != "undefined" || args.value != "") {
                return `Please enter valid subscription type('${LaytripPointSubscriptionType.WEEKLY,LaytripPointSubscriptionType.BIWEEKLY,LaytripPointSubscriptionType.MONTHLY}').&&&payment_type&&&${errorMessage}`
            }
        }
    })
    @ApiProperty({
        description:`subscription type`,
        example:LaytripPointSubscriptionType.WEEKLY
    })
    subscription_type:string;
    
    @ValidateIf(o => o.type == LaytripPointsType.RECURRING)
    @IsNotEmpty({ message: `Please enter number of payment cycle.&&&app_version&&&Please enter number of payment cycle.` })
    @Min(2)
    @ApiProperty({
        description:`number_of_cycle`,
        example: 2
    })
	number_of_cycle:number;

}