import { ApiProperty , ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UpdateDealDto {

    @IsNotEmpty({
        message: `Please enter id&&&subject&&&Please enter id`
    })
    @ApiProperty({
        description: 'Enter id',
        example: ''
    })
    id: number;

    @ApiPropertyOptional({
		type: "string",
		format: "binary",
		description: "deal image (Allow Only 'JPG,JPEG,PNG')",
		example: "",
	})
    image: string;
    
    @ApiPropertyOptional({
        description: 'Enter location',
        example: ''
    })
    location: string;   
}