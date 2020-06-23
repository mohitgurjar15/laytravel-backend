import { IsNotEmpty, IsEmail,MinLength,MaxLength,Matches} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';


export class ChangePasswordDto {

    @IsNotEmpty()
    @ApiProperty({
        description:'Enter Old Password',
        example:'Jon@Doe'
    })
    oldPassword:string;

    @IsNotEmpty()
    @ApiProperty({
        description:'Enter New Password',
        example:'JonNew@Doe'
    })
    @MinLength(8)
    @MaxLength(20)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,{ message :'Password Too weak'})
    newPassword:string;
}