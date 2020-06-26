import { IsNotEmpty, IsEmail, MinLength, MaxLength, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdatePasswordDto {
    @IsNotEmpty()
    @ApiProperty({
        description:'Enter Token ',
        example:'23ce5ba4785bbbe9e2e72640f061587c20b3f7ef8816842cd466fd238a9b5370eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN1cmVzaEBpdG9uZWNsaWNrLmNvbSIsInRva2VuIjoiMjNjZTViYTQ3ODViYmJlOWUyZTcyNjQwZjA2MTU4N2MyMGIzZjdlZjg4MTY4NDJjZDQ2NmZkMjM4YTliNTM3MCIsImlhdCI6MTU4OTM4MjYzNywiZXhwIjoxNTg5Mzg2MjM3fQ.QrsG6vs_9gYqtw7_iojAIuqWPTB7FlS0WFj_xdZ48rM'
    })
    token:string;
}