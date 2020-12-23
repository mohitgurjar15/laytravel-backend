import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AddWebNotificationDto {
    @ApiProperty({
		description: "Enter end point",
		example: "",
	})
	@IsNotEmpty({
		message: "Please enter your end point.&&&end_end",
	})
    end_point: string;
    
    @ApiProperty({
		description: "Enter auth keys",
		example: "",
	})
	@IsNotEmpty({
		message: "Please enter your auth keys.&&&auth_keys",
	})
    auth_keys: string;
    
    @ApiProperty({
		description: "Enter p256dh keys",
		example: "",
	})
	@IsNotEmpty({
		message: "Please enter your p256dh keys.&&&p256dh_keys",
	})
	p256dh_keys: string;
}

