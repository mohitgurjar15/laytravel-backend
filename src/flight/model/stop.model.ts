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
    duration            : string;
    airline             : string;
    remaining_seat      : number;
    below_minimum_seat  : boolean;
    is_layover          : boolean;
    layover_duration    : string;
    meal                : string;
    cabin_baggage       : string;
    checkin_baggage     : string;
    layover_airport_name: string;
    airline_name        : string;
    airline_logo        : string;
    layover_city_name   : string;
    cabin_class         : string;
    departure_info   : {};
    arrival_info     : {};
}