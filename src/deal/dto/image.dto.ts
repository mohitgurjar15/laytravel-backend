import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ImageDto {
	@IsNotEmpty()
	@ApiProperty({
		description: "image",
		example: "abc.jpg",
	})
	image: any;
}
