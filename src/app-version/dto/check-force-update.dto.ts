import { IsNotEmpty } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
export class CheckForceUpdateDto {

    @IsNotEmpty({
        message: `Please enter device type&&&limit&&&Please enter device type`
    })
    @ApiProperty({
        description: 'Device type',
        example: 1
    })
    device_type: number;


    @IsNotEmpty({
        message: `Please enter version&&&page&&&Please enter version`
    })
    @ApiProperty({
        description: 'version name',
        example: ''
    })
    version: string;
}