import * as moment from 'moment';
export class DateTime{

    static convertSecondsToHourMinutesSeconds(seconds){

        let totalSeconds= parseInt(seconds);
        let hours= Math.floor(totalSeconds/3600);

        let remainigSecond = totalSeconds-(hours*3600);
        let minutes = remainigSecond/60;
        
        remainigSecond = remainigSecond - (minutes*60);

        return {
            hours,
            minutes,
            seconds:remainigSecond
        }

    }

    /**
     * Description: convert date format to new format
     * @param date Description
     */
    static convertDateFormat(date,currentFormat,newFormat){

       return  moment(date, currentFormat).format(newFormat)
    }
    
    static convertFormat(date: string, format: string = 'YYYY-MM-DD hh:mm:ss') {
        
        return moment(date).format(format);

    }
}