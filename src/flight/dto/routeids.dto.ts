import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { errorMessage } from "src/config/common.config";

export class RouteIdsDto{
    
    @IsNotEmpty({
		message: `Please enter route code.&&&source_location&&&${errorMessage}`,
	})
    @ApiProperty({
        description:`Route code`,
        example:`h687a0asad00llgf45`
    })
    route_code: string
}
