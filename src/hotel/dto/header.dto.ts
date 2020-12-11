import { ApiHeader } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsDefined, IsString } from "class-validator";

export class HotelHeaderDto{
    // @ApiHeader({
    //     name: 'token',
    //     description: 'Hotel ID for which details are required'
    // })
    @IsDefined()
    @Expose({ name: 'token' })
    @IsString()
    token: string;
}