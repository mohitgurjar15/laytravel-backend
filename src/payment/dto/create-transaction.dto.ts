import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, Max, Min } from "class-validator";
import { errorMessage } from "src/config/common.config";

export class CreteTransactionDto {
  @ApiProperty({
    description: `booking Id`,
    example: ``,
  })
  bookingId: string;

  @ApiProperty({
    description: `booking Id`,
    example: ``,
  })
  productId: string;

  @IsNotEmpty({
    message: `Please enter user id.&&&user_id&&&${errorMessage}`,
  })
  @ApiProperty({
    description: `user id`,
    example: ``,
  })
  userId: string;

  @IsNotEmpty({
    message: `Please enter card token.&&&user_id&&&${errorMessage}`,
  })
  @ApiProperty({
    description: `card token`,
    example: ``,
  })
  card_token: string;

  @IsNotEmpty({
    message: `Please enter currency id.&&&currency_id&&&${errorMessage}`,
  })
  @ApiProperty({
    description: `currency id`,
    example: 1,
  })
  currencyId: number;

  @IsNotEmpty({
    message: `Please enter amount.&&&amount&&&${errorMessage}`,
  })
  @Max(9999999)
  @Min(0)
  @ApiProperty({
    description: `amount`,
    example: 123,
  })
  amount: number;

  @ApiProperty({
    description: `paid for`,
    example: ``,
  })
  paidFor: string;

  @ApiProperty({
    description: `traveler info id`,
    example: ``,
  })
  travelerInfoId: number;

  @ApiProperty({
    description: `note`,
    example: ``,
  })
  note: string;
}
