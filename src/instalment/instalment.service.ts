import { Injectable, BadRequestException } from '@nestjs/common';
import { InstalmentDto } from './dto/instalment.dto';
import { InstalmentType } from 'src/enum/instalment-type.enum';
import { Instalment } from 'src/utility/instalment.utility';
import { InstalmentAvailabilityDto } from './dto/instalment-availability.dto';
import { errorMessage } from 'src/config/common.config';

@Injectable()
export class InstalmentService {

    async calculateInstalemnt(instalmentDto:InstalmentDto){

        const { 
            instalment_type, amount,
            checkin_date, booking_date, additional_amount, custom_instalment_no, custom_amount
        } = instalmentDto;

        if(custom_amount && custom_instalment_no){

            throw new BadRequestException(`Please select either custom amount or custom instalment number&&&type&&&${errorMessage}`)
        }
        if(instalment_type==InstalmentType.WEEKLY){
            return Instalment.weeklyInstalment(amount,checkin_date,booking_date,additional_amount,custom_amount,custom_instalment_no);
        }
        
        else if(instalment_type==InstalmentType.BIWEEKLY)
            return Instalment.biWeeklyInstalment(amount,checkin_date,booking_date,additional_amount,custom_amount,custom_instalment_no);
        
        else if(instalment_type==InstalmentType.MONTHLY)
            return Instalment.monthlyInstalment(amount,checkin_date,booking_date,additional_amount,custom_amount,custom_instalment_no);
        
    }

    async instalmentAvailbility(instalmentAvailabilityDto:InstalmentAvailabilityDto){
        const { 
            checkin_date, booking_date
        } = instalmentAvailabilityDto;

        const availability = Instalment.instalmentAvailbility(checkin_date,booking_date);
        
        return {
            instalment_availability:availability
        }
    }
}
