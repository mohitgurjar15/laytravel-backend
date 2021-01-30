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

    static convertKGtoLB(weight) {
        return Number((weight * 2.20).toFixed(2))
    }

    static  getDateWithMonthName(fullDate) {
        let dateArr = fullDate.split('/');
        let month = this.getMonthName(dateArr[0]);
        let date = dateArr[1];
        let year = dateArr[2];

        return `${date} ${month}, ${year}`;
    }

    static getMonthName(month) {
        let monthName = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
        ];

        return monthName[parseInt(month)-1];

    }

}