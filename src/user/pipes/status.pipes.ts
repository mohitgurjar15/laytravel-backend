import { PipeTransform, BadRequestException } from "@nestjs/common";
import { statusEnum } from "../status.enum";




export class statusPipe implements PipeTransform 
{
    readonly allowedStatus = [
        'Active',
        'Deactive',
    ]

    transform(data: {status : string}){

        const value = data.status
        if(this.statusValid(value))
        {
            if(value == 'Active')
            {
                return {status : statusEnum.Active};
            }
            else
            {
                return {status : statusEnum.Deactive};
            }    
        }
        else
        {
            throw new BadRequestException(`${value} is Not a Valid status`);
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