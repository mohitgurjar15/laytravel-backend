import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateCmsDto{

    @IsNotEmpty({
		message: `Please select page type.&&&page_type`,
	})
    @ApiProperty({
        description:`Page type`,
        example:`about`
    })
    page_type:string;

    @IsNotEmpty({
		message: `Please enter title.&&&title`,
	})
    @ApiProperty({
        description:`Page title`,
        example:`About Us`
    })
    title:string;

    @IsNotEmpty({
		message: `Please enter english content.&&&en_content`,
	})
    @ApiProperty({
        description:`Abount info`,
        example:`We are travel solution company`
    })
    en_content:string;
}