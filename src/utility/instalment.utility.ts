import * as moment from 'moment';
import { Generic } from './generic.utility';

export class Instalment{

    static weeklyInstalment(amount,ckeckInDate,bookingDate,additionalAmount=null,customAmount=null,customInstalmentNo=null){
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
            while(dayDiffernce>0){
                
                dayDiffernce = dayDiffernce-7;         
                instalmentsDates.push(nextInstalmentsDate);
                
                nextInstalmentsDate = moment(nextInstalmentsDate).add(7,'days').format('YYYY-MM-DD')
                
                /* else{
                    // here last instalment date will be added
                    nextInstalmentsDate = moment(nextInstalmentsDate).add(7+dayDiffernce,'days').format('YYYY-MM-DD')
                } */
            }
        
            let amountPerInstalment = amount / instalmentsDates.length;
            let percentageAmount = (amount * 20 )/100;
        
            instalmentDatewithAmount = this.calculateInstalment(amountPerInstalment,percentageAmount,instalmentsDates,amount,additionalAmount,customAmount,customInstalmentNo)
        }

        instalmentData.instalment_available=(instalmentsDates.length) ? true:false;
        instalmentData.instalment_date=instalmentDatewithAmount;
        return instalmentData;
    
    }
    
    static biWeeklyInstalment(amount,ckeckInDate,bookingDate,additionalAmount=null,customAmount=null,customInstalmentNo=null){
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
        
            instalmentDatewithAmount = this.calculateInstalment(amountPerInstalment,percentageAmount,instalmentsDates,amount,additionalAmount,customAmount,customInstalmentNo)
        }
        
        instalmentData.instalment_available=(instalmentsDates.length) ? true:false;
        instalmentData.instalment_date=instalmentDatewithAmount;
        return instalmentData;
    }
    
    static monthlyInstalment(amount,ckeckInDate,bookingDate,additionalAmount=null,customAmount=null,customInstalmentNo=null){
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
        
            instalmentDatewithAmount = this.calculateInstalment(amountPerInstalment,percentageAmount,instalmentsDates,amount,additionalAmount,customAmount,customInstalmentNo)
        }
        
        instalmentData.instalment_available=(instalmentsDates.length) ? true:false;
        instalmentData.instalment_date=instalmentDatewithAmount;
        return instalmentData;
    
    }

    static calculateInstalment(amountPerInstalment,percentageAmount,instalmentsDates,amount,additionalAmount=null,customAmount=null,customInstalmentNo=null){
        
        let instalmentDatewithAmount=[];
        let firstInstalment;
        let firstInstalmentTemp;
        let remainingPerInstalmentAmount
        if(amountPerInstalment > percentageAmount){
            firstInstalment= amountPerInstalment;
            firstInstalmentTemp=amountPerInstalment;
            if(additionalAmount){
                firstInstalment = amountPerInstalment+additionalAmount;
            }
        }
        else{
            firstInstalment =firstInstalmentTemp= percentageAmount;
            if(additionalAmount){
                firstInstalment = percentageAmount+additionalAmount;
            }
        }
  
        if(customAmount){
            //firstInstalment=customAmount+additionalAmount;
            remainingPerInstalmentAmount=customAmount;
        }
        else if(customInstalmentNo && customInstalmentNo < instalmentsDates.length){
            instalmentsDates= instalmentsDates.slice(0, -(instalmentsDates.length-customInstalmentNo));
            firstInstalment = (amount / instalmentsDates.length)+additionalAmount;
            let remainingInstalmentAmount = amount-firstInstalment;
            remainingPerInstalmentAmount = remainingInstalmentAmount/(instalmentsDates.length-1);
        }
        else{
          let remainingInstalmentAmount = amount-firstInstalment;
          remainingPerInstalmentAmount = remainingInstalmentAmount/(instalmentsDates.length-1);
        }
        
        instalmentDatewithAmount.push({
            instalment_date:instalmentsDates[0],
            instalment_amount:Generic.formatPriceDecimal(firstInstalment)
        })
  
        let instalment:any; 
        let amountTemp=firstInstalment;
        for(let i=1; i < instalmentsDates.length; i++){
            instalment={};
            instalment.instalment_date=instalmentsDates[i];
            instalment.instalment_amount=Generic.formatPriceDecimal(remainingPerInstalmentAmount);
            amountTemp+=remainingPerInstalmentAmount;
  
            if(amountTemp >= amount && customAmount){
              instalment.instalment_amount=(amount-(amountTemp-remainingPerInstalmentAmount));
              instalmentDatewithAmount.push(instalment)
              break;
            }
            else{
  
              instalmentDatewithAmount.push(instalment)
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