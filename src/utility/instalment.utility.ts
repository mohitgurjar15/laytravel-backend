import * as moment from 'moment';

export class Instalment{

    static weeklyInstalment(amount,ckeckInDate,bookingDate){
        let instalmentData={'instalment_available':false,'instalment_date':[]}
        let isAvailable = this.instalmentAvailbility(ckeckInDate, bookingDate);
        if(!isAvailable)
            return instalmentData;

        let lastInstalmentDate = moment(ckeckInDate).subtract(7, 'days').format('YYYY-MM-DD');
        let dayDiffernce = moment(lastInstalmentDate).diff(moment(bookingDate), 'days')
        
        let instalmentsDates = [];
        let nextInstalmentsDate;
        let instalmentDatewithAmount=[];
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
        
            instalmentDatewithAmount = this.calculateInstalment(amountPerInstalment,percentageAmount,instalmentsDates,amount)
        }

        instalmentData.instalment_available=(instalmentsDates.length) ? true:false;
        instalmentData.instalment_date=instalmentDatewithAmount;
        return instalmentData;
    
    }
    
    static biWeeklyInstalment(amount,ckeckInDate,bookingDate){
        let instalmentData={'instalment_available':false,'instalment_date':[]}
        let isAvailable = this.instalmentAvailbility(ckeckInDate, bookingDate);
        if(!isAvailable)
            return instalmentData;
            
        let lastInstalmentDate = moment(ckeckInDate).subtract(7, 'days').format('YYYY-MM-DD');
        let dayDiffernce = moment(lastInstalmentDate).diff(moment(bookingDate), 'days')
        
        let instalmentsDates = [];
        let nextInstalmentsDate;
        let instalmentDatewithAmount=[];
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
        
            instalmentDatewithAmount = this.calculateInstalment(amountPerInstalment,percentageAmount,instalmentsDates,amount)
        }
        
        instalmentData.instalment_available=(instalmentsDates.length) ? true:false;
        instalmentData.instalment_date=instalmentDatewithAmount;
        return instalmentData;
    }
    
    static monthlyInstalment(amount,ckeckInDate,bookingDate){
        let instalmentData={'instalment_available':false,'instalment_date':[]}
        let isAvailable = this.instalmentAvailbility(ckeckInDate, bookingDate);
        if(!isAvailable)
            return instalmentData;

        let lastInstalmentDate = moment(ckeckInDate).subtract(7, 'days').format('YYYY-MM-DD');
        let dayDiffernce = moment(lastInstalmentDate).diff(moment(bookingDate), 'days')
        
        let instalmentsDates = [];
        let nextInstalmentsDate;
        let instalmentDatewithAmount=[];
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
        
            instalmentDatewithAmount = this.calculateInstalment(amountPerInstalment,percentageAmount,instalmentsDates,amount)
        }
        
        instalmentData.instalment_available=(instalmentsDates.length) ? true:false;
        instalmentData.instalment_date=instalmentDatewithAmount;
        return instalmentData;
    
    }

    static calculateInstalment(amountPerInstalment,percentageAmount,instalmentsDates,amount){

        let instalmentDatewithAmount=[];
        if(amountPerInstalment > percentageAmount){

            for(let instalmentsDate of instalmentsDates){
                instalmentDatewithAmount.push({
                    instalment_date:instalmentsDate,
                    instalment_amount:amountPerInstalment
                })
            }
        }
        else{
            let firstInstalment = percentageAmount;
            let remainingInstalmentAmount = amount-firstInstalment;
            let remainingPerInstalmentAmount = remainingInstalmentAmount/(instalmentsDates.length-1);
            instalmentDatewithAmount.push({
                instalment_date:instalmentsDates[0],
                instalment_amount:firstInstalment
            })

            for(let i=1; i < instalmentsDates.length; i++){
                instalmentDatewithAmount.push({
                    instalment_date:instalmentsDates[i],
                    instalment_amount:remainingPerInstalmentAmount
                })
            }
        }

        return instalmentDatewithAmount;
    }

    static instalmentAvailbility(checkinDate, bookingDate){
        let dayDiffernce = moment(checkinDate).diff(moment(bookingDate), 'days')
        let available=true;

        if(dayDiffernce<30)
            available=false;
        
        return available;

    }
}