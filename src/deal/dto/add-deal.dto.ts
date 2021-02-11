import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class AddDealDto {

    @IsNotEmpty({
        message: `Please enter module id&&&subject&&&Please enter module id.`
    })
    @ApiProperty({
        description: 'Enter module id',
        example: ''
    })
    module_id: number;

    @ApiPropertyOptional({
        type: "string",
        format: "binary",
        description: "deal image (Allow Only 'JPG,JPEG,PNG')",
        example: "",
    })
    image: string;

    @IsNotEmpty({
        message: `Please enter location &&&subject&&&Please enter location.`
    })
    @ApiProperty({
        description: 'Enter location',
        example: ''
    })
    location: string;

}