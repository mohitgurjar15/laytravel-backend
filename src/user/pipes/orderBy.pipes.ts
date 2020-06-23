import { PipeTransform, ArgumentMetadata, NotFoundException, BadRequestException } from "@nestjs/common";
import { OrderByEnum } from "../orderby.enum";




export class OrderByPipe implements PipeTransform 
{
    readonly allowedStatus = [
        OrderByEnum.ASC,
        OrderByEnum.DESC,
    ]

    transform(value: any){

        value = value.toUpperCase();
        if(this.statusValid(value))
        {
            return value;    
        }
        else
        {
            throw new BadRequestException(`${value} is Not a Valid OrderBy`);
        }
    }

    private statusValid(status:any)
    {
       const idx = this.allowedStatus.indexOf(status);
       if(idx == -1)
       {
           return false;
       }
       else
       {
            return true;
       }
    }
}