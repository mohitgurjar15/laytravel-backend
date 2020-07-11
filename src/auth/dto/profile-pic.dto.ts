import { IsNotEmpty, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ProfilePicDto {
	@IsNotEmpty()
	@ApiProperty({
		description: "User profile pic&&&profile_pic",
		example: "abc.jpg",
	})
	profile_pic: any;
}
