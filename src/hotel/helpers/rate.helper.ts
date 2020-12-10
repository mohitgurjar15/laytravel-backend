import * as moment from 'moment';
import { Instalment } from "src/utility/instalment.utility";

export class RateHelper{
    
    static getInstalmentBreakup(selling_total, check_in) {
        
        let bookingDate = moment(new Date()).format("YYYY-MM-DD");
        
        let instalment_details = Instalment.weeklyInstalment(selling_total, check_in, bookingDate, 0);

        let start_price = 0, secondary_start_price = 0;
        
        if (instalment_details.instalment_available) {

            start_price = instalment_details.instalment_date[0].instalment_amount;
            
            secondary_start_price = instalment_details.instalment_date[1].instalment_amount;
        }

        return { detail:instalment_details, start_price, secondary_start_price };
    }
}