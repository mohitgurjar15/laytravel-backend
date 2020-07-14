import * as moment from 'moment';

export class Instalment{

    static weeklyInstalment(amount,ckeckInDate,bookingDate){
        let lastInstalmentDate = moment(ckeckInDate).subtract(7, 'days').format('YYYY-MM-DD');
        let dayDiffernce = moment(lastInstalmentDate).diff(moment(bookingDate), 'days')
        
        let instalmentsDates = [];
        let nextInstalmentsDate;
        let instalmentAmount=amount;
        if(dayDiffernce>0){
        
            nextInstalmentsDate = bookingDate;
            while(dayDiffernce>-7){
                
                dayDiffernce = dayDiffernce-7;         
                instalmentsDates.push(nextInstalmentsDate);
                
                if(dayDiffernce>1){
                nextInstalmentsDate = moment(nextInstalmentsDate).add(7,'days').format('YYYY-MM-DD')
                }
                else{
                // here last instalment date will be added
                nextInstalmentsDate = moment(nextInstalmentsDate).add(7+dayDiffernce,'days').format('YYYY-MM-DD')
                }
            }
        
            let amountPerInstalment = amount / instalmentsDates.length;
            let percentageAmount = (amount * 20 )/100;
        
            let instalmentAmount = amountPerInstalment > percentageAmount ? amountPerInstalment : percentageAmount;
        }

        return {

            'instalment_date' : instalmentsDates,
            'price_per_instalemnt':instalmentAmount,
            'instalment_available': (instalmentsDates.length) ? true:false
        }
    
    }
    
    static biWeeklyInstalment(amount,ckeckInDate,bookingDate){
        let lastInstalmentDate = moment(ckeckInDate).subtract(7, 'days').format('YYYY-MM-DD');
        let dayDiffernce = moment(lastInstalmentDate).diff(moment(bookingDate), 'days')
        
        let instalmentsDates = [];
        let nextInstalmentsDate;
        let instalmentAmount=amount;
        if(dayDiffernce>0){
        
            nextInstalmentsDate = bookingDate;
            while(dayDiffernce>-14){
                
                dayDiffernce = dayDiffernce-14;         
                instalmentsDates.push(nextInstalmentsDate);
                
                if(dayDiffernce>1){
                nextInstalmentsDate = moment(nextInstalmentsDate).add(14,'days').format('YYYY-MM-DD')
                }
                else{
                // here last instalment date will be added
                nextInstalmentsDate = moment(nextInstalmentsDate).add(14+dayDiffernce,'days').format('YYYY-MM-DD')
                }
            }
        
            let amountPerInstalment = amount / instalmentsDates.length;
            let percentageAmount = (amount * 20 )/100;
        
            let instalmentAmount = amountPerInstalment > percentageAmount ? amountPerInstalment : percentageAmount;
            console.log(instalmentAmount)
        }
        return {

            'instalment_date' : instalmentsDates,
            'price_per_instalemnt':instalmentAmount,
            'instalment_available': (instalmentsDates.length) ? true:false
        }
    }
    
    static monthlyInstalment(amount,ckeckInDate,bookingDate){
        let lastInstalmentDate = moment(ckeckInDate).subtract(7, 'days').format('YYYY-MM-DD');
        let dayDiffernce = moment(lastInstalmentDate).diff(moment(bookingDate), 'days')
        
        let instalmentsDates = [];
        let nextInstalmentsDate;
        let instalmentAmount=amount;
        if(dayDiffernce>0){
        
            nextInstalmentsDate = bookingDate;
            while(dayDiffernce>-30){
                
                dayDiffernce = dayDiffernce-30;         
                instalmentsDates.push(nextInstalmentsDate);
                
                if(dayDiffernce>1){
                nextInstalmentsDate = moment(nextInstalmentsDate).add(30,'days').format('YYYY-MM-DD')
                }
                else{
                // here last instalment date will be added
                nextInstalmentsDate = moment(nextInstalmentsDate).add(30+dayDiffernce,'days').format('YYYY-MM-DD')
                }
            }
        
            let amountPerInstalment = amount / instalmentsDates.length;
            let percentageAmount = (amount * 20 )/100;
        
            let instalmentAmount = amountPerInstalment > percentageAmount ? amountPerInstalment : percentageAmount;
        }
        
        return {

            'instalment_date' : instalmentsDates,
            'price_per_instalemnt':instalmentAmount,
            'instalment_available': (instalmentsDates.length) ? true:false
        }
    
    }
}