import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, ValidationArguments } from "class-validator";

export class UpdateAppleUserDto {
  @IsEmail(
    {},
    {
      message: (args: ValidationArguments) => {
        if (typeof args.value == "undefined" || args.value == "") {
          return `Please enter your email address.&&&email`;
        } else {
          return `Please Enter valid email address.&&&email`;
        }
      },
    }
  )
  @ApiProperty({
    description: `Enter Email Id`,
    example: `jon.doe@gmail.com`,
  })
  email: string;

  @IsNotEmpty({
    message: `Please enter your first name.&&&first_name`,
  })
  @ApiProperty({
    description: `Enter First Name`,
    example: `Jon`,
  })
  first_name: string;

  @IsNotEmpty({
    message: `Please enter your last name.&&&last_name`,
  })
  @ApiProperty({
    description: `Enter Last Name`,
    example: `Doe`,
  })
  last_name: string;
}
