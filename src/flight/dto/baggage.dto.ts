import { IsNotEmpty, IsEmail, ValidationArguments, IsInt, ValidateNested } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class BaggageDetailsDto{
    
    @IsNotEmpty({
		message: `Please enter source location.&&&source_location`,
	})
    @ApiProperty({
        description:`From Airport Location`,
        example:`ADS`
    })
    @ValidateNested({ each: true })
    flights: Baggage[]
}

class Baggage{

    @IsInt()
    @IsNotEmpty({
		message: `Please enter source location.&&&source_location`,
	})
    flight_id: number;
}