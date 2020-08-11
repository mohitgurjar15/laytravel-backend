import { Stop } from "./stop.model";

export class Route{

    type            :  string;
    routes          :  RouteType[]=[];
    route_code      :  string;
    net_rate        :  string;
    stop_count      :  number;
    departure_code  : string;
    arrival_code    : string;
    departure_date  : string;
    departure_time  : string;
    arrival_date    : string;
    arrival_time    : string;
    total_duration  : string;
    airline         : string;
    is_refundable   : boolean;
    start_price     : string;
}

export class RouteType{

    type    :  string;
    stops   :  Stop[]
}