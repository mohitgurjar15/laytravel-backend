import { ApiProperty } from "@nestjs/swagger";

export class AddCartQuery {
    
    @ApiProperty({
		description: "Enter payment type",
		example: "installment/no-installment"
	})
	payment_type: string;

	@ApiProperty({
		description: "Enter payment frequency",
		example: "weekly/biweekly/monthly"
	})
	payment_frequency: string;

	@ApiProperty({
		description: "Enter downpayment",
		example: "20"
	})
	downpayment: number;
}