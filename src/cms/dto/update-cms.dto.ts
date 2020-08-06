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

    @IsNotEmpty({
		message: `Please enter Italian content.&&&it_content`,
	})
    @ApiProperty({
        description:`Abount info`,
        example:`We are travel solution company`
    })
    it_content:string;

    @IsNotEmpty({
		message: `Please enter spanish content.&&&es_content`,
	})
    @ApiProperty({
        description:`Abount info`,
        example:`We are travel solution company`
    })
    es_content:string;

    @IsNotEmpty({
		message: `Please enter dutch content.&&&de_content`,
	})
    @ApiProperty({
        description:`Abount info`,
        example:`We are travel solution company`
    })
    de_content:string;

    @IsNotEmpty({
		message: `Please enter french content.&&&fr_content`,
	})
    @ApiProperty({
        description:`Abount info`,
        example:`We are travel solution company`
    })
    fr_content:string;
}