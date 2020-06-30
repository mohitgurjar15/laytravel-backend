import { PipeTransform, BadRequestException } from "@nestjs/common";

export class MinCharPipe implements PipeTransform 
{
    transform(value: any){

        if(value.length<3)
            throw new BadRequestException(`Please enter minimum 3 characters.&&&name`)
        else    
            return value;
    }
}