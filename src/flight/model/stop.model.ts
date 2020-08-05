export class Stop{

    departure_code      : string;
    departure_date      : string;
    departure_time      : string;
    departure_date_time : string;
    arrival_code        : string;
    arrival_date        : string;
    arrival_time        : string;
    arrival_date_time   : string;
    eticket             : boolean;
    flight_number       : string;
    duration            : number;
    airline             : string;
    remaining_seat      : number;
    below_minimum_seat  : boolean;
    is_layover          : boolean;
    layover_duration    : string;
    layover_airport_name: string;
}