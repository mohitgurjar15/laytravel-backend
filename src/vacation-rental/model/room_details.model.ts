import { FeesType } from "./verify-availability.model";

export class HotelDetails {
    property_id: number;
    property_name: string;
    description: string;
    images:Images[];
    amenities: []
    rooms: Room[];
    city:string;
    country:string;
    hotel_name:string;
}

export class Room {
    name: string;
    id: number;
    net_price: number;
    rate_plan_code:string;
    room_name:string;
    selling_price: number;
    start_price: number;
    secondary_start_price:number;
    secondary_selling_price : number;
    instalment_details:{};
    description: string;
    cancellation_policy:CancellationPolicy;
    deposite_policy:string;
    feesType: FeesType;
    amenities: [];
    meal_type: string;
}

export class Images{
    url:string
}

export class CancellationPolicy{
    is_refundable:boolean;
    penalty_info:[]
}