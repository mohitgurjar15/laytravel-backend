import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateLangunageDto{

    @IsNotEmpty({
		message: `Please enter iso 1 code.&&&iso_1_code`,
	})
    @ApiProperty({
        description:`ISO 1 code`,
        example:`en`
    })
    iso_1_code:string;

    @IsNotEmpty({
		message: `Please enter iso 2 code.&&&iso_2_code`,
	})
    @ApiProperty({
        description:`ISO 2 code`,
        example:`eng`
    })
    iso_2_code:string;
}