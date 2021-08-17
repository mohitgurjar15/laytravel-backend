import { Stop } from "./stop.model";
import { FareInfo } from "./fare.model";

export class FlightSearchResult {
    items: Route[];
    price_range: PriceRange;
    partial_payment_price_range: PriceRange;
    stop_data: any;
    inbound_stop_data: any;
    airline_list: AirlineDetails[];
    depature_time_slot: any;
    arrival_time_slot: any;
    inbound_depature_time_slot: any;
    inbound_arrival_time_slot: any;
    category_name?: string;
    
}
export class Route {
    type: string;
    routes: RouteType[] = [];
    route_code: string;
    net_rate: string;
    stop_count: number;
    inbound_stop_count: number;
    departure_code: string;
    arrival_code: string;
    departure_date: string;
    departure_time: string;
    arrival_date: string;
    arrival_time: string;
    total_duration: string;
    airline: string;
    is_refundable: boolean;
    start_price: number;
    secondary_start_price: number;
    selling_price: number;
    discounted_selling_price: number;
    secondary_selling_price: number;
    airline_name: string;
    airline_logo: string;
    is_passport_required: boolean;
    departure_info: {};
    arrival_info: {};
    adult_count: number;
    child_count: number;
    infant_count: number;
    fare_break_dwon: FareInfo[];
    secondary_fare_break_down: FareInfo[];
    cabin_class: string;
    fare_type: string;
    instalment_details: {};
    unique_code: string;
    no_of_weekly_installment: number;
    /* biweekly_down_payment:number;
    biweekly_installment:number;
    no_of_biweekly_installment:number;
    monthly_down_payment:number;
    monthly_installment:number;
    no_of_monthly_installment:number; */
    secondary_start_price_2: number;
    secondary_start_price_3: number;
    second_down_payment: number;
    no_of_weekly_installment_2: number;
    third_down_payment: number;
    no_of_weekly_installment_3: number;
    instalment_avail_after: number;
    category_name?: string;
    log_file?: string;
    markUpDetails?: string;
    offer_data:any;
    discounted_start_price:number;
    discounted_secondary_start_price:number;
    discounted_no_of_weekly_installment?:any
    is_installment_available?: boolean
    payment_config?:any
    payment_object?:any
}

export class RouteType {
    type: string;
    stops: Stop[];
    duration: string;
}

export class PriceRange {
    min_price: string;
    max_price: string;
}

export class StopData {
    non_stop: StopDetails;
    one_stop: StopDetails;
    two_plus: StopDetails;
}

export class AirlineDetails {
    airline_name: string;
    airline_code: string;
    selling_price: number;
    count: number;
}

export class StopDetails {
    count: number;
    min_price: string;
}
