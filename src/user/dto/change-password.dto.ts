import { IsNotEmpty, IsEmail,MinLength,MaxLength,Matches} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';
import { IsEqualTo } from 'src/auth/password.decorator';


export class ChangePasswordDto {

    @IsNotEmpty({
        message : `Please enter old password.`
    })
    @ApiProperty({
        description:`Enter Old Password`,
        example:`Jon@Doe`
    })
    old_password:string;


    @ApiProperty({
		description: `Enter password`,
		example: `Jondoe123@`,
	})
    @MaxLength(20)
	@MinLength(8, { message: `Password is too short. It should be minimum 8 characters.&&&password` })
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
}