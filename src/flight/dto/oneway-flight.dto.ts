import { IsEnum, IsNotEmpty,  MaxLength,   ValidationArguments } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsValidDate } from "src/decorator/is-valid-date.decorator";
import { errorMessage } from "src/config/common.config";
import { flightClass } from '../strategy/mystifly'
export class OneWaySearchFlightDto{
    
    @IsNotEmpty({
		message: `Please enter source location.&&&source_location`,
    })
    @MaxLength(3,{message:'Departure code should not be more then 3 characters'})
    @ApiProperty({
        description:`From Airport Location`,
        example:`JAI`
    })
    source_location:string;

    @IsNotEmpty({
		message: `Please enter destination location.&&&destination_location`,
    })
    @MaxLength(3,{message:'Arrival code should not be more then 3 characters'})
    @ApiProperty({
        description:`To Airport Location`,
        example:`DEL`
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

	
    @IsEnum(['Economy', 'Business', 'First','Premium'],{
        message : (args: ValidationArguments) => {
            if (typeof args.value == "undefined" || args.value == "" || args.value == null) {
                return `Please enter flight class.&&&flight_class`
            }
            else{
                return `Please enter valid flight class(Y=Economy, C=Business, F=First and S=Premium).&&&flight_class&&&${errorMessage}`
            }
        }
    })
    @ApiProperty({
        description:`Flight class (Economy, Business, First,Premium)`,
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

}