import { IsOptional, IsIn, IsNotEmpty } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
export class ListUserDto {

    @IsNotEmpty()
    @ApiProperty({
        description:'NoOfResult',
        example:20
    })
    NoOfResult:number;

    @IsNotEmpty()
    @ApiProperty({
        description:'page',
        example:20
    })
    page:number;


    @IsOptional()
    @ApiProperty({
        description:'search',
        example:"xyz"
    })
    search: string;
}