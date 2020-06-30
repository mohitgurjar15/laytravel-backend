import { IsNotEmpty, IsEmail, ValidationArguments } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SearchFlightDto{
    
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
	
	@IsNotEmpty({
		message: `Please enter departure date.&&&departure_date`,
	})
    @ApiProperty({
        description:`Departure date`,
        example:`2020-11-06`
    })
	departure_date:string;

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

}