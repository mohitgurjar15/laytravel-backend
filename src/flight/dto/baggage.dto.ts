import { IsNotEmpty, IsEmail, ValidationArguments, IsInt, ValidateNested } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class BaggageDetailsDto{
    
    @IsNotEmpty({
		message: `Please enter routes ids.&&&source_location`,
	})
    @ApiProperty({
        description:`Route ids`,
        example:[1,3]
    })
    //@ValidateNested({ each: true })
    routes: number[]
}

class Baggage{

    @IsInt()
    @IsNotEmpty({
		message: `Please enter source location.&&&source_location`,
	})
    flight_id: number;
}
