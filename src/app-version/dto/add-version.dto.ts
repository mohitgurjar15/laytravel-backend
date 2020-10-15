import { IsNotEmpty } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { errorMessage } from "src/config/common.config";
export class AddVersionDto {

    @IsNotEmpty({
        message : `Please enter device type&&&limit&&&Please enter device type`
    })
    @ApiProperty({
        description:'Device type',
        example: 1 
    })
    device_type:number;

    @IsNotEmpty({
        message : `Please enter force update&&&page&&&Please enter force update`
    })
    @ApiProperty({
        description:'force update',
        example:''
    })
    force_update:boolean;


    @IsNotEmpty({
        message : `Please enter version&&&page&&&Please enter version`
    })
    @ApiProperty({
        description:'version name',
        example:''
    })
    version:string;

    @ApiPropertyOptional({
        description:'enter name',
        example:""
    })
    name: string;

    @ApiPropertyOptional({
        description:'enter url',
        example:""
    })
    url:string;
}