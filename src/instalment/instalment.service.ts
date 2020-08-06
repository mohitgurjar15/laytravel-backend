import { Injectable } from '@nestjs/common';
import { InstalmentDto } from './dto/instalment.dto';
import { InstalmentType } from 'src/enum/instalment-type.enum';
import { Instalment } from 'src/utility/instalment.utility';
import { InstalmentAvailabilityDto } from './dto/instalment-availability.dto';

@Injectable()
export class InstalmentService {

    async calculateInstalemnt(instalmentDto:InstalmentDto){

        const { 
            instalment_type, amount,
            checkin_date, booking_date, additional_amount
        } = instalmentDto;

        if(instalment_type==InstalmentType.WEEKLY){

            return Instalment.weeklyInstalment(amount,checkin_date,booking_date,additional_amount);
        }
        
        else if(instalment_type==InstalmentType.BIWEEKLY)
            return Instalment.biWeeklyInstalment(amount,checkin_date,booking_date);
        
        else if(instalment_type==InstalmentType.MONTHLY)
            return Instalment.monthlyInstalment(amount,checkin_date,booking_date);
        
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
