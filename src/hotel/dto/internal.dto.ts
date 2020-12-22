import { IsOptional, IsString } from "class-validator";

export class InternalDto{

    @IsString()
    @IsOptional()
    bundle?: string;
    
    @IsOptional()
    token?: string;

    /* Added this property for Public/retail  */
    @IsOptional()
    rooms?: string;
}