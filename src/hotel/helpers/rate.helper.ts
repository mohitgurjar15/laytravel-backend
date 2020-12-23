import { collect } from 'collect.js';
import * as moment from 'moment';
import { Instalment } from "src/utility/instalment.utility";

export class RateHelper{
    
    private getInstalmentBreakup(selling_total, check_in) {
        
        let bookingDate = moment(new Date()).format("YYYY-MM-DD");
        
        let instalment_details = Instalment.weeklyInstalment(selling_total, check_in, bookingDate, 0);

        let start_price = 0, secondary_start_price = 0;
        
        if (instalment_details.instalment_available) {

            start_price = instalment_details.instalment_date[0].instalment_amount;
            
            secondary_start_price = instalment_details.instalment_date[1].instalment_amount;
        }

        return { detail:instalment_details, start_price, secondary_start_price };
    }

    generateInstalments(eles: any, check_in: string, all_breakups: boolean = false) {

        eles = collect(eles).map((ele: any) => {

            let instalment = this.getInstalmentBreakup(ele.selling.total, check_in);

            ele.instalment_details = instalment.detail;
            ele.start_price = instalment.start_price;
            ele.secondary_start_price = instalment.secondary_start_price;

            return ele;

        });

        return eles;
    }
}