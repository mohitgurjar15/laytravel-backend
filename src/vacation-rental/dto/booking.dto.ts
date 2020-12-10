import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, IsOptional, ValidateNested, ValidationArguments } from "class-validator";
import { errorMessage } from "src/config/common.config";
import { InstalmentType } from "src/enum/instalment-type.enum";
import { PaymentType } from "src/enum/payment-type.enum";

export class BookingDto{

    @ApiProperty({
        description:"Enter room id",
        example:7110442417410
    })
    property_id:number;

    @ApiProperty({
        description:"Enter room id",
        example:7111514346492
    })
    room_id:number;

    @ApiProperty({
        description:"Enter rate plan selected for price check.",
        example:'186PNPNX01'
    })
    rate_plan_code:string;

    @ApiProperty({
        description:"Enter a check in date",
        example:'2021-01-05'
    })
    check_in_date:string;

    
    @ApiProperty({
        description:"Enter a check out date",
        example:'2021-01-15'
    })
    check_out_date:string;

    @ApiProperty({
        description:"Enter a adult count",
        example: 2
    })
    adult_count:number;

    @Type(() => Number)
    @ApiProperty({
        description:`Children ages collection`,
        example:[10,12,15]
    })
    number_and_children_ages:Array<Number>;

    @IsEnum([PaymentType.INSTALMENT,PaymentType.NOINSTALMENT,PaymentType.FULLPOINTS,PaymentType.PARTIALPOINTS],{
        message : (args: ValidationArguments) => {
            if (typeof args.value == "undefined" || args.value == "") {
                return `Please enter payment type.&&&payment_type&&&${errorMessage}`;
            } else {
                return `Please enter valid payment type('${PaymentType.INSTALMENT, PaymentType.NOINSTALMENT}').&&&payment_type&&&${errorMessage}`
            }
        }
    })
    @ApiProperty({
        description:`Payment type`,
        example:PaymentType.INSTALMENT
    })
	payment_type:string;

    @IsOptional()
    @ApiProperty({
        description:`Laycredit point to redeem`,
        example:10
    })
    laycredit_points:number;

    @IsOptional()
    @ApiProperty({
        description:`Card token`,
        example:`XXXXXX-XXXXX-XXXXXX`
    })
    card_token:string;

    @IsOptional({
        message: (args: ValidationArguments) => {
            if (typeof args.value != "undefined" && ![InstalmentType.WEEKLY,InstalmentType.BIWEEKLY,InstalmentType.MONTHLY].includes(args.value)) {
                return `Please enter valid instalment type.&&&instalment_type&&&${errorMessage}`;
            }
        }
    })
    @ApiProperty({
        description:`Instalment type`,
        example:`weekly`
    })
    instalment_type:string;

    @IsOptional()
    @ApiProperty({
        description:`Additional with payment with instalement`,
        example:10
    })
    additional_amount:number;

    @IsOptional()
    @ApiProperty({
        description:`Additional with payment with instalement`,
        example:null
    })
    custom_instalment_amount:number | null;

    @IsOptional()
    @ApiProperty({
        description:`Additional with payment with instalement`,
        example:null
    })
    custom_instalment_no:number | null;

    @IsOptional()
    @ApiProperty({
        description:`Booking Through (web,android,ios)`,
        example:`web`
    })
    booking_through:string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Traveler)
    @ApiProperty({
        description:`Traveler ids`,
        example:[
            {
                traveler_id : `c5944389-53f3-4120-84a4-488fb4e94d87`,
                is_customer:true
            },
			{
                traveler_id : `3e37b423-f67e-4c92-bd7c-1f62ed134540`,
                is_customer:false
            }
        ]
    })
    travelers:Traveler[]
}

class Traveler{

    @IsNotEmpty({
		message: `Please select traveler.&&&traveler_id&&&${errorMessage}`,
	})
    @ApiProperty({
        description:`Traveler id`,
        example:`1a600f6e-6775-4266-8dbd-a8a3ad390aed`
    })
    traveler_id:string

    @IsNotEmpty({
        message:``
    })
    
    @ApiProperty({
        description:`select custsomer or not`,
        example:true
    })
    is_customer:boolean;
}
