import { IsNotEmpty, IsEmail } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AuthCredentialDto{
    
    @IsEmail()
    @ApiProperty({
        description:'User Email',
        example:'suresh@itoneclick.com'
    })
    email:string;

    @IsNotEmpty()
    @ApiProperty({
        description:'Password',
        example:'123'
    })
    password:string;
}