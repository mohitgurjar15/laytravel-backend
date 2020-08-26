import {
	IsNotEmpty,
	IsEmail,
	MinLength,
	MaxLength,
	Matches,
	ValidationArguments,
	IsEnum,
	ValidateIf
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Gender } from "src/enum/gender.enum";
import { errorMessage } from "src/config/common.config";
import { IsEqualTo } from "src/auth/password.decorator";

export class SaveUserDto {
	@IsEnum(["mr", "ms", "mrs"], {
		message: (args: ValidationArguments) => {
			if (typeof args.value == "undefined" || args.value == "") {
				return `Please select your title.&&&gender`;
			} else {
				return `Please select valid title('mr','ms','mrs').&&&title&&&${errorMessage}`;
			}
		},
	})
	@ApiProperty({
		description: `Select Title ('mr','ms','mrs')`,
		example: `mr`,
	})
	title: string;

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
		message: `Please enter your password.&&&password`,
	})
	@ApiProperty({
		description: `Enter Password`,
		example: `Jondoe123@`,
	})
	@MaxLength(20)
	@MinLength(8, {
		message: `Password is too short. It should be minimum 8 characters.&&&password`,
	})
	@Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: `Your password must be 8 characters long, should contain at least 1 uppercase, 1 lowercase, 1 numeric or special character.&&&password`,
	})
	password: string;

	@ApiProperty({
		description: `Enter confirm password`,
		example: `Jondoe123@`,
	})
	@IsEqualTo(`password`)
	@IsNotEmpty({
		message: `Please enter your confirm password.&&&confirm_password`,
	})
	confirm_password: string;

	@IsNotEmpty({
		message: `Please select country code.&&&country_code`,
	})
	@ApiProperty({
		description: `Select country code`,
		example: `+1`,
	})
	country_code: string;

	@IsNotEmpty({
		message: `Please enter your contact number.&&&phone_no`,
	})
	@ApiProperty({
		description: `Enter phone number`,
		example: `8452456712`,
	})
	phone_no: string;

	@IsNotEmpty({
		message: `Please enter your address.&&&address`,
	})
	@ApiProperty({
		description: `Enter Your address`,
		example: `12 street, las vegas`,
	})
	address: string;

	@IsNotEmpty({
		message: `Please enter your zipcode.&&&zip_code`,
	})
	@ApiProperty({
		description: `Enter your zipcode`,
		example: `H7623`,
	})
	zip_code: string;

	@IsNotEmpty({
		message: `Please select your country.&&&country_id`,
	})
	@ApiProperty({
		description: `Enter your country id`,
		example: 233,
	})
	country_id: number;

	@IsNotEmpty({
		message: `Please select your state.&&&state_id`,
	})
	@ApiProperty({
		description: `Enter your state id`,
		example: 1452,
	})
	state_id: number;

	@IsNotEmpty({
		message: `Please enter your city name.&&&city_name`,
	})
	@ApiProperty({
		description: `Enter your city name`,
		example: `Las vegas`,
	})
	city_name: string;

	@IsNotEmpty({
		message: `Please select your gender.&&&gender`,
	})
	@IsEnum(["M", "F"], {
		message: (args: ValidationArguments) => {
			if (typeof args.value == "undefined" || args.value == "") {
				return `Please select your gender.&&&gender`;
			} else {
				return `Please select valid gender(M,F).&&&gender&&&${errorMessage}`;
			}
		},
	})
	@ApiProperty({
		description: `Select Gender (M,F)`,
		example: `M`,
	})
	gender: Gender;

	@IsNotEmpty({
		message: `Please select user Type&&&user_type&&&${errorMessage}`,
	})
	@ValidateIf((o) => o.type >= 5)
	@ValidateIf((o) => o.type <= 7)
	@ApiProperty({
		description: `Select user type (5/6/7)`,
		example: `6`,
	})
	user_type: number;

	@ApiPropertyOptional({
		description: `Select user prefer Language `,
		example: `1`,
	})
	prefer_language: number;

	@ApiPropertyOptional({
		type: "string",
		format: "binary",
		description: "profile Picture Url (Allow Only 'JPG,JPEG,PNG')",
		example: "profile.jpg",
	})
	profile_pic: string;


	
}
