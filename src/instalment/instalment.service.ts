import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InstalmentDto } from './dto/instalment.dto';
import { InstalmentType } from 'src/enum/instalment-type.enum';
import { Instalment } from 'src/utility/instalment.utility';
import { InstalmentAvailabilityDto } from './dto/instalment-availability.dto';
import { AllInstalmentDto } from './dto/all-instalment.dto';

@Injectable()
export class InstalmentService {

    async calculateInstalemnt(instalmentDto:InstalmentDto){

        const { 
            instalment_type, amount,
            checkin_date, booking_date, additional_amount, down_payment,selected_down_payment,custom_down_payment
        } = instalmentDto;

        if(selected_down_payment >= 3){
            throw new NotAcceptableException(`selected down payment option must be 2 or below`)
        }

        if(instalment_type==InstalmentType.WEEKLY){
            return Instalment.weeklyInstalment(amount,checkin_date,booking_date,additional_amount,down_payment,null,selected_down_payment,false,custom_down_payment);
        }
        
        else if(instalment_type==InstalmentType.BIWEEKLY)
            return Instalment.biWeeklyInstalment(amount,checkin_date,booking_date,additional_amount,down_payment,null,selected_down_payment,false,custom_down_payment);
        
        else if(instalment_type==InstalmentType.MONTHLY)
            return Instalment.monthlyInstalment(amount,checkin_date,booking_date,additional_amount,down_payment,null,selected_down_payment,false,custom_down_payment);
        
    }

    async calculateAllInstalemnt(allInstalmentDto:AllInstalmentDto){

        const { 
            amount,
            checkin_date, booking_date, additional_amount,down_payment,selected_down_payment,custom_down_payment
        } = allInstalmentDto;

        if(selected_down_payment >= 3){
            throw new NotAcceptableException(`selected down payment option must be 2 or below`)
        }
        
        let weeklyInstalments = Instalment.weeklyInstalment(amount,checkin_date,booking_date,additional_amount,down_payment,null,selected_down_payment,false,custom_down_payment);
        if(weeklyInstalments.instalment_available==true){

            let biWeeklyInstalments = Instalment.biWeeklyInstalment(amount,checkin_date,booking_date,additional_amount,down_payment,null,selected_down_payment,false,custom_down_payment);
            let monthlyInstalments = Instalment.monthlyInstalment(amount,checkin_date,booking_date,additional_amount,down_payment,null,selected_down_payment,false,custom_down_payment);

            return {
                instalment_available : true,
                weekly_instalments : weeklyInstalments.instalment_date,
                weekly_down_payment : weeklyInstalments.down_payment,
                biweekly_instalments : biWeeklyInstalments.instalment_date,
                bi_weekly_down_payment : biWeeklyInstalments.down_payment,
                monthly_instalments : monthlyInstalments.instalment_date,
                monthly_down_payment : monthlyInstalments.down_payment,
            }
        }
        else{
            return {
                instalment_available : false
            }
        }
        
        
        
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
