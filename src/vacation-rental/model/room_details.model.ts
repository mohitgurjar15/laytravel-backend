export class HotelDetails {
    property_id: number;
    property_name: string;
    description: string;
    images:Images[];
    amenities: []
    rooms: Room[]
}

export class Room {
    name: string;
    id: number;
    net_price: number;
    rate_plan_code:string;
    selling_price: number;
    start_price: number;
    secondary_start_price:number;
    secondary_selling_price : number;
    instalment_details:{};
    description: string;
    is_refundable:boolean;
    amenities: [];
    meal_type: string;
}

export class Images{
    url:string
}