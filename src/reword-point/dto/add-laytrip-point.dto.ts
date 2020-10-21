import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class AddLaytripPoint {

    @IsNotEmpty({
        message : `Please enter points&&&point&&&Please enter points`
    })
    @ApiProperty({
        description:'Please enter points',
        example:10
    })
    points:number;

    @IsNotEmpty({
        message : `Please enter card Token&&&point&&&Please select your card`
    })
    @ApiProperty({
        description:`Card token`,
        example:`XXXXXX-XXXXX-XXXXXX`
    })
    card_token:string;
}