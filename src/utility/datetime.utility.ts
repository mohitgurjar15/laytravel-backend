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
}