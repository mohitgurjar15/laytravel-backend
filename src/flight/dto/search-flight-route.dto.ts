import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class SearchRouteDto{
    
    @IsNotEmpty({
		message: `Please enter search keyword.&&&source_location`,
	})
    @ApiProperty({
        description:`Airport Location`,
        example:`JAI`
    })
    search:string;

    @IsNotEmpty({
		message: `Please enter is from location.&&&source_location`,
	})
    @ApiProperty({
        description:`is from location`,
        example: 'yes'
    })
    is_from_location:string;

    @ApiPropertyOptional({
        description:`alternet location`,
        example: 'DEL'
    })
    alternet_location:string;
}