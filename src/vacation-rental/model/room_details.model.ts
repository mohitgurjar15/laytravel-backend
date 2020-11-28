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
    net_rate: number;
    rate_plan_code:string;
    selling_price: number;
    start_price: number;
    description: string;
    amenities: [];
    meal_type: string;
}

export class Images{
    url:string
}