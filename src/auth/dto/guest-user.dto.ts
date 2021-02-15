import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GuestUserDto {
    @ApiProperty({
		description: "Enter guest user Id",
		example: "",
	})
	@IsNotEmpty({
		message: "Please enter guest user Id.",
	})
    guest_id: string;
}
