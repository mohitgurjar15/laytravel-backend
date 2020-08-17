import { IsNotEmpty,  ValidationArguments, IsEnum, IsEmail, IsArray, ValidateNested, ValidateIf, IsOptional, IsInt, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsValidDate } from "src/decorator/is-valid-date.decorator";
import { errorMessage } from "src/config/common.config";
import { Type } from 'class-transformer';
import { FlightJourney } from "src/enum/flight-journey.enum";
import { PaymentType } from "src/enum/payment-type.enum";

export class BookFlightDto{
	
	
	@IsEnum([FlightJourney.ONEWAY,FlightJourney.ROUNDTRIP,FlightJourney.MULTICITY],{
        message : (args: ValidationArguments) => {
            if (typeof args.value == "undefined" || args.value == "") {
                return `Please enter journey type.&&&journey_type&&&${errorMessage}`;
            } else {
                return `Please enter valid journey type('${FlightJourney.ONEWAY}','${FlightJourney.ROUNDTRIP}','${FlightJourney.MULTICITY}').&&&journey_type&&&${errorMessage}`
            }
        }
    })
    @ApiProperty({
        description:`Journey type`,
        example:`oneway`
    })
    journey_type:string;
	
    @IsNotEmpty({
		message: `Please enter source location.&&&source_location`,
	})
    @ApiProperty({
        description:`From Airport Location`,
        example:`ADS`
    })
    source_location:string;

    @IsNotEmpty({
		message: `Please enter destination location.&&&destination_location`,
	})
    @ApiProperty({
        description:`To Airport Location`,
        example:`CHI`
    })
	destination_location:string;

    
    @IsValidDate('',{
        message: (args: ValidationArguments) => {
            if (typeof args.value == "undefined" || args.value == "") {
                return `Please enter departure date.&&&departure_date`;
            } else {
                return `Please enter valid departure date format(YYYY-MM-DD)&&&departure_date`;
            }
        },
    })
    @ApiProperty({
        description:`Departure date`,
        example:`2020-11-06`
    })
	departure_date : string;
	
	@ValidateIf(o=>o.journey_type=='round-trip')
	@IsValidDate('',{
        message: (args: ValidationArguments) => {
            if (typeof args.value == "undefined" || args.value == "") {
                return `Please enter arrival date.&&&arrival_date`;
            } else {
                return `Please enter valid arrival date format(YYYY-MM-DD)&&&arrival_date`;
            }
        },
    })
    @ApiProperty({
        description:`Arrival date`,
        example:`2020-11-06`
    })
    arrival_date : string;

	@IsNotEmpty({
		message: `Please enter flight class.&&&departure_date`,
	})
    @ApiProperty({
        description:`Flight class (Economy, Business, First)`,
        example:`Economy`
    })
	flight_class:string;

	@IsNotEmpty({
		message: `Please enter destination location.&&&adult_count`,
	})
    @ApiProperty({
        description:`Total Number of adult`,
        example:1
    })
	adult_count:number;

	@IsNotEmpty({
		message: `Please enter child count, pass 0 if no child.&&&child_count`,
	})
    @ApiProperty({
        description:`Total Number of child`,
        example:0
    })
	child_count:number;

	@IsNotEmpty({
		message: `Please enter infant count, pass 0 if no infant.&&&infant_count`,
	})
    @ApiProperty({
        description:`Total Number of child`,
        example:0
    })
	infant_count:number;

	@IsEnum([PaymentType.INSTALMENT,PaymentType.NOINSTALMENT,PaymentType.FULLPOINTS,PaymentType.PARTIALPOINTS],{
        message : (args: ValidationArguments) => {
            if (typeof args.value == "undefined" || args.value == "") {
                return `Please enter payment type.&&&payment_type&&&${errorMessage}`;
            } else {
                return `Please enter valid payment type('${PaymentType.INSTALMENT, PaymentType.NOINSTALMENT, PaymentType.FULLPOINTS, PaymentType.PARTIALPOINTS}').&&&journey_type&&&${errorMessage}`
            }
        }
    })
    @ApiProperty({
        description:`Payment type`,
        example:PaymentType.INSTALMENT
    })
	payment_type:string;

	
	@IsNumber({},{
        message: (args: ValidationArguments) => {
            if (typeof args.value == "undefined" || args.value == "") {
                return `Please enter net rate.&&&net_rate&&&${errorMessage}`;
            } else {
                return `Please enter net rate in decimal format.&&&net_rate&&&${errorMessage}`;
            }
        }
    })
    @ApiProperty({
        description:`Net rate`,
        example:100.00
    })
	net_rate:number;

	
    @IsNumber({},{
        message: (args: ValidationArguments) => {
            if (typeof args.value == "undefined" || args.value == "") {
                return `Please enter selling price.&&&selling_price&&&${errorMessage}`;
            } else {
                return `Please enter selling price in decimal format.&&&selling_price&&&${errorMessage}`;
            }
        }
    })
    @ApiProperty({
        description:`Selling price`,
        example:105.00
    })
    selling_price:number;

    @IsOptional()
    @ApiProperty({
        description:`Laycredit point to redeem`,
        example:10
    })
    laycredit_points:number;
    
    @IsNotEmpty({
		message: `Please enter route code.&&&route_code${errorMessage}`,
	})
    @ApiProperty({
        description:`Flight route code`,
        example:`lkjekje82r2rfwjef99304933sfff44`
    })
    route_code:string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Traveler)
    @ApiProperty({
        description:`Traveler ids`,
        example:[
            {
                traveler_id : `c5944389-53f3-4120-84a4-488fb4e94d87`
			},
			{
                traveler_id : `3e37b423-f67e-4c92-bd7c-1f62ed134540`
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
}

/* class Traveler{

    @IsEnum(["ADT", "CHD", "INF"], {
		message: (args: ValidationArguments) => {
			if (typeof args.value == "undefined" || args.value == "") {
				return `Please select traveler type.&&&traveler_type`;
			} else {
				return `Please select valid traveler type('ADT','CHD','INF').&&&traveler_type&&&${errorMessage}`;
			}
		},
	})
	@ApiProperty({
		description: `Enter traveler type`,
		example: `Jon`,
	})
    traveler_type: string;
    
    @IsEnum(["mr", "ms", "mrs"], {
		message: (args: ValidationArguments) => {
			if (typeof args.value == "undefined" || args.value == "") {
				return `Please select your title.&&&gender`;
			} else {
				return `Please select valid title('mr','ms','mrs').&&&title&&&${errorMessage}`;
			}
		},
	})
	@ApiProperty({
		description: `Select Title ('mr','ms','mrs')`,
		example: `mr`,
	})
    title   :   string;

    @IsNotEmpty({
		message: `Please enter your first name.&&&first_name`,
	})
	@ApiProperty({
		description: `Enter First Name`,
		example: `Jon`,
	})
	first_name: string;

	@IsNotEmpty({
		message: `Please enter your last name.&&&last_name`,
	})
	@ApiProperty({
		description: `Enter Last Name`,
		example: `Doe`,
	})
    last_name: string;
    
    @IsEmail(
		{},
		{
			message: (args: ValidationArguments) => {
				if (typeof args.value == "undefined" || args.value == "") {
					return `Please enter your email address.&&&email`;
				} else {
					return `Please Enter valid email address.&&&email`;
				}
			},
		}
	)
	@ApiProperty({
		description: `Enter Email Id`,
		example: `jon.doe@gmail.com`,
	})
    email: string;

    @IsNotEmpty({
		message: `Please select country code.&&&country_code`,
	})
	@ApiProperty({
		description: `Select country code`,
		example: `+1`,
	})
	country_code: string;
    
    @IsNotEmpty({
		message: `Please enter your contact number.&&&phone_no`,
	})
	@ApiProperty({
		description: `Enter phone number`,
		example: `8452456712`,
	})
    phone_no: string;
    
    @IsNotEmpty({
		message: `Please enter your zipcode.&&&zip_code`,
	})
	@ApiProperty({
		description: `Enter your zipcode`,
		example: `H7623`,
	})
    zip_code: string;
    
    @IsNotEmpty({
		message: `Please enter your area code.&&&area_code`,
	})
	@ApiProperty({
		description: `Enter your area code`,
		example: `7623`,
	})
    area_code: string;
    
    @IsNotEmpty({
		message: `Please enter your country code.&&&country`,
	})
	@ApiProperty({
		description: `Enter your area code`,
		example: `US`,
	})
	country: string;
} */