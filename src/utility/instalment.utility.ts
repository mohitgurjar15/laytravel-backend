import * as moment from 'moment';
import TrustedComms = require('twilio/lib/rest/preview/TrustedComms');
import { Generic } from './generic.utility';

const checkInDayDiffernce = 90;
const firstInstalmentPercentage1 = 40;
const firstInstalmentPercentage2 = 20;
export class Instalment {


    static weeklyInstalment(amount, ckeckInDate, bookingDate, additionalAmount = null, downPayment = null, customInstalmentNo = null, selected_down_payment = null , ignore5DollerCase : boolean = false, customDownPayment=null) {
        let instalmentData = { 'instalment_available': false, 'instalment_date': [], 'percentage': 0, 'down_payment': [] }
        let isAvailable = this.instalmentAvailbility(ckeckInDate, bookingDate);

        if (!isAvailable)
            return instalmentData;

        let lastInstalmentDate = moment(ckeckInDate).subtract(14, 'days').format('YYYY-MM-DD');
        let totalDayDiffernce = moment(ckeckInDate).diff(moment(bookingDate), 'days')
        let dayDiffernce = moment(lastInstalmentDate).diff(moment(bookingDate), 'days')
        let instalmentsDates = [];
        let nextInstalmentsDate;
        let instalmentDatewithAmount = [];
        if (dayDiffernce > 0) {

            nextInstalmentsDate = bookingDate;
            while (dayDiffernce > 0) {

                dayDiffernce = dayDiffernce - 7;
                instalmentsDates.push(nextInstalmentsDate);

                nextInstalmentsDate = moment(nextInstalmentsDate).add(7, 'days').format('YYYY-MM-DD')

                /* else{
                    // here last instalment date will be added
                    nextInstalmentsDate = moment(nextInstalmentsDate).add(7+dayDiffernce,'days').format('YYYY-MM-DD')
                } */
            }

            let amountPerInstalment = amount / instalmentsDates.length;
            let percentage = totalDayDiffernce <= checkInDayDiffernce ? firstInstalmentPercentage1 : firstInstalmentPercentage2;
            let percentageAmount = (amount * percentage) / 100;

            //let amountPerInstalmentPercentage = amountPerInstalment/amount*100;

            instalmentData.down_payment = this.calculateDownPayment(amountPerInstalment, percentageAmount, amount, additionalAmount,customDownPayment)
            selected_down_payment = selected_down_payment || 0;
            downPayment = instalmentData.down_payment[selected_down_payment];

            instalmentDatewithAmount = this.calculateInstalment(amountPerInstalment, percentageAmount, instalmentsDates, amount, additionalAmount, downPayment, customInstalmentNo,customDownPayment)
            instalmentData.percentage = percentage;
        }

        instalmentData.instalment_available = (instalmentsDates.length) ? true : false;
        instalmentData.instalment_date = instalmentDatewithAmount;

        if (instalmentData.instalment_date[1].instalment_amount < 5 && additionalAmount == 0 && ignore5DollerCase != true) {
            instalmentData.instalment_date = this.adjustInstalment(amount, instalmentDatewithAmount);
        }

        instalmentData.instalment_date = this.adjustFractionAmount(amount, instalmentData.instalment_date);

        return instalmentData;

    }

    static biWeeklyInstalment(amount, ckeckInDate, bookingDate, additionalAmount = null, downPayment = null, customInstalmentNo = null, selected_down_payment = null , ignore5DollerCase : boolean = false, customDownPayment=null) {
        let instalmentData = { 'instalment_available': false, 'instalment_date': [], 'percentage': 0, 'down_payment': [] }
        let isAvailable = this.instalmentAvailbility(ckeckInDate, bookingDate);
        if (!isAvailable)
            return instalmentData;

        let lastInstalmentDate = moment(ckeckInDate).subtract(14, 'days').format('YYYY-MM-DD');
        let dayDiffernce = moment(lastInstalmentDate).diff(moment(bookingDate), 'days')
        let totalDayDiffernce = moment(ckeckInDate).diff(moment(bookingDate), 'days')
        let instalmentsDates = [];
        let nextInstalmentsDate;
        let instalmentDatewithAmount = [];
        if (dayDiffernce > 0) {

            nextInstalmentsDate = bookingDate;
            while (dayDiffernce > -14) {

                dayDiffernce = dayDiffernce - 14;
                instalmentsDates.push(nextInstalmentsDate);

                if (dayDiffernce > 1) {
                    nextInstalmentsDate = moment(nextInstalmentsDate).add(14, 'days').format('YYYY-MM-DD')
                }
                else {
                    // here last instalment date will be added
                    nextInstalmentsDate = moment(nextInstalmentsDate).add(14 + dayDiffernce, 'days').format('YYYY-MM-DD')
                }
            }

            let amountPerInstalment = amount / instalmentsDates.length;
            let percentage = totalDayDiffernce <= checkInDayDiffernce ? firstInstalmentPercentage1 : firstInstalmentPercentage2;
            let percentageAmount = (amount * percentage) / 100;

            instalmentData.down_payment = this.calculateDownPayment(amountPerInstalment, percentageAmount, amount, additionalAmount, customDownPayment)
            selected_down_payment = selected_down_payment || 0;
            downPayment = instalmentData.down_payment[selected_down_payment];

            instalmentDatewithAmount = this.calculateInstalment(amountPerInstalment, percentageAmount, instalmentsDates, amount, additionalAmount, downPayment, customInstalmentNo,customDownPayment)
            instalmentData.percentage = percentage;
        }

        instalmentData.instalment_available = (instalmentsDates.length) ? true : false;
        instalmentData.instalment_date = instalmentDatewithAmount;

        if (
            instalmentData.instalment_date[1].instalment_amount < 5 &&
            additionalAmount == 0 &&
            ignore5DollerCase != true
        ) {
            instalmentData.instalment_date = this.adjustInstalment(
                amount,
                instalmentDatewithAmount
            );
        }

        instalmentData.instalment_date = this.adjustFractionAmount(amount, instalmentData.instalment_date);
        
        return instalmentData;
    }

    static monthlyInstalment(amount, ckeckInDate, bookingDate, additionalAmount = null, downPayment = null, customInstalmentNo = null, selected_down_payment = null , ignore5DollerCase : boolean = false, customDownPayment=null) {
        let instalmentData = { 'instalment_available': false, 'instalment_date': [], 'percentage': 0, 'down_payment': [] }
        let isAvailable = this.instalmentAvailbility(ckeckInDate, bookingDate);
        if (!isAvailable)
            return instalmentData;

        let lastInstalmentDate = moment(ckeckInDate).subtract(14, 'days').format('YYYY-MM-DD');
        let dayDiffernce = moment(lastInstalmentDate).diff(moment(bookingDate), 'days')
        let totalDayDiffernce = moment(ckeckInDate).diff(moment(bookingDate), 'days')
        let instalmentsDates = [];
        let nextInstalmentsDate;
        let instalmentDatewithAmount = [];
        if (dayDiffernce > 0) {

            nextInstalmentsDate = bookingDate;
            while (dayDiffernce > -30) {

                dayDiffernce = dayDiffernce - 30;
                instalmentsDates.push(nextInstalmentsDate);

                if (dayDiffernce > 1) {
                    nextInstalmentsDate = moment(nextInstalmentsDate).add(30, 'days').format('YYYY-MM-DD')
                }
                else {
                    // here last instalment date will be added
                    nextInstalmentsDate = moment(nextInstalmentsDate).add(30 + dayDiffernce, 'days').format('YYYY-MM-DD')
                }
            }

            let amountPerInstalment = amount / instalmentsDates.length;
            let percentage = totalDayDiffernce <= checkInDayDiffernce ? firstInstalmentPercentage1 : firstInstalmentPercentage2;
            let percentageAmount = (amount * percentage) / 100;

            instalmentData.down_payment = this.calculateDownPayment(amountPerInstalment, percentageAmount, amount, additionalAmount, customDownPayment)
            selected_down_payment = selected_down_payment || 0;
            downPayment = instalmentData.down_payment[selected_down_payment];

            instalmentDatewithAmount = this.calculateInstalment(amountPerInstalment, percentageAmount, instalmentsDates, amount, additionalAmount, downPayment, customInstalmentNo,customDownPayment)
            instalmentData.percentage = percentage;
        }

        instalmentData.instalment_available = (instalmentsDates.length) ? true : false;
        instalmentData.instalment_date = instalmentDatewithAmount;
        
        if (
            instalmentData.instalment_date[1].instalment_amount < 5 &&
            additionalAmount == 0 &&
            ignore5DollerCase != true
        ) {
            instalmentData.instalment_date = this.adjustInstalment(
                amount,
                instalmentDatewithAmount
            );
        }

        instalmentData.instalment_date = this.adjustFractionAmount(amount, instalmentData.instalment_date);

        return instalmentData;

    }

    static adjustInstalment(amount, instalment_date) {
        amount = amount.toFixed(2)
        let downPayment = instalment_date[0].instalment_amount;
        let remaingAmount = amount - downPayment;
        let totalInstalmentDates = instalment_date.length - 1;
        let secondary_price = instalment_date[1].instalment_amount;

        let newInstalmentDateWithAmount = [];

        while (secondary_price < 5) {
            secondary_price = remaingAmount / totalInstalmentDates;
            totalInstalmentDates -= 1;
        }

        newInstalmentDateWithAmount.push({
            instalment_date: instalment_date[0].instalment_date,
            instalment_amount: Generic.formatPriceDecimal(downPayment)
        });

        let amountTemp = downPayment;

        let instalment: any;

        for (let i = 1; i < instalment_date.length; i++) {
            instalment = {};
            instalment.instalment_date = instalment_date[i].instalment_date;
            instalment.instalment_amount = Generic.formatPriceDecimal(secondary_price);
            amountTemp += secondary_price;
            // console.log("inside amounttemp",amountTemp);

            if (amountTemp.toFixed(2) == amount) {
                newInstalmentDateWithAmount.push(instalment);
                break;
            }else{
                newInstalmentDateWithAmount.push(instalment);
            }
            
            // if(amountTemp <= remaingAmount){
            //     newInstalmentDateWithAmount.push(instalment);
            // }
        
        }

        return newInstalmentDateWithAmount;
    }

    static adjustFractionAmount(totalAmount, instalmentDateWithAmount) {
        let lastInstalmentLength = instalmentDateWithAmount.length-1;
        let downPayment = instalmentDateWithAmount[0].instalment_amount;
        let remaingAmount = totalAmount - downPayment;
        let newSecondaryPrice = instalmentDateWithAmount[1].instalment_amount;
        let instalmentAmount = newSecondaryPrice * lastInstalmentLength;
        let adjustLastInstalment = instalmentDateWithAmount[lastInstalmentLength].instalment_amount + remaingAmount - instalmentAmount;

        instalmentDateWithAmount[lastInstalmentLength] = {
            instalment_date: instalmentDateWithAmount[lastInstalmentLength].instalment_date,
            instalment_amount: Generic.formatPriceDecimal(adjustLastInstalment)
        }

        return instalmentDateWithAmount;

    }
    static calculateInstalment(amountPerInstalment, percentageAmount, instalmentsDates, amount, additionalAmount = null, downPayment = null, customInstalmentNo = null,customDownPayment=null) {

        let instalmentDatewithAmount = [];
        let firstInstalment;
        let firstInstalmentTemp;
        let remainingPerInstalmentAmount
        /* if (amountPerInstalment > percentageAmount) {
            firstInstalment = amountPerInstalment;
            firstInstalmentTemp = amountPerInstalment;
            if (additionalAmount) {
                firstInstalment = amountPerInstalment + additionalAmount;
            }
        }
        else {
            firstInstalment = firstInstalmentTemp = percentageAmount;
            if (additionalAmount) {
                firstInstalment = percentageAmount + additionalAmount;
            }
        } */

        firstInstalment = firstInstalmentTemp = percentageAmount;
        if (additionalAmount) {
            firstInstalment = percentageAmount + additionalAmount;
        }

        if(customDownPayment){
            firstInstalment = customDownPayment + additionalAmount;
            let remainingInstalmentAmount = amount - firstInstalment;
            remainingPerInstalmentAmount = remainingInstalmentAmount / (instalmentsDates.length - 1);
        }
        else if (downPayment) {
                //firstInstalment=customAmount+additionalAmount;
            firstInstalment = downPayment + additionalAmount;
            if (firstInstalment < firstInstalmentTemp) {
                firstInstalment = firstInstalmentTemp;
            }
            let remainingInstalmentAmount = amount - firstInstalment;
            remainingPerInstalmentAmount = remainingInstalmentAmount / (instalmentsDates.length - 1);
        }
        else if (customInstalmentNo && customInstalmentNo < instalmentsDates.length) {
            instalmentsDates = instalmentsDates.slice(0, -(instalmentsDates.length - customInstalmentNo));
            //firstInstalment = (amount / instalmentsDates.length)+additionalAmount;
            let remainingInstalmentAmount = amount - firstInstalment;
            remainingPerInstalmentAmount = remainingInstalmentAmount / (instalmentsDates.length - 1);
        }
        else {
            let remainingInstalmentAmount = amount - firstInstalment;
            remainingPerInstalmentAmount = remainingInstalmentAmount / (instalmentsDates.length - 1);
        }

        instalmentDatewithAmount.push({
            instalment_date: instalmentsDates[0],
            instalment_amount: Generic.formatPriceDecimal(firstInstalment)
        })

        let instalment: any;
        let amountTemp = firstInstalment;
        for (let i = 1; i < instalmentsDates.length; i++) {
            instalment = {};
            instalment.instalment_date = instalmentsDates[i];
            instalment.instalment_amount = Generic.formatPriceDecimal(remainingPerInstalmentAmount);
            amountTemp += remainingPerInstalmentAmount;

            if (amountTemp >= amount && downPayment) {
                instalment.instalment_amount = (amount - (amountTemp - remainingPerInstalmentAmount));
                instalmentDatewithAmount.push(instalment)
                break;
            }
            else {

                instalmentDatewithAmount.push(instalment)
            }

        }

        return instalmentDatewithAmount;
    }

    static instalmentAvailbility(checkinDate, bookingDate) {
        let dayDiffernce = moment(checkinDate).diff(moment(bookingDate), 'days')
        let available = true;
        if (dayDiffernce <= 30)
            available = false;

        return available;

    }

    static calculateDownPayment(amountPerInstalment, percentageAmount, amount, additionalAmount = null,customDownPayment=null) {

        let downPayments = [];
        if(customDownPayment==null){

            let additionalAmt = additionalAmount || 0;
            let netAmount = amount - additionalAmt;
            let activePercent;
            if (percentageAmount > amountPerInstalment) {
                activePercent = (percentageAmount * 100) / amount;
            }
            else {
                activePercent = (amountPerInstalment * 100) / amount;
            }
            let instalment = Number((netAmount * activePercent / 100).toFixed(2))
            downPayments.push(instalment);

            instalment = Number((netAmount * (activePercent + 10) / 100).toFixed(2))
            downPayments.push(instalment);
            
            instalment = Number((netAmount * (activePercent + 20) / 100).toFixed(2))
            downPayments.push(instalment);
            
            return downPayments;
        }
        else{
            downPayments.push(customDownPayment)
            return downPayments;
        }
    }
}