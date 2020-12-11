export class HotelSearchResult{
    items:HotelDetail[];
    price_range : PriceRange;
    partial_payment_price_range:PriceRange;
    amenties:[];
}

export class HotelDetail {
    property_name: string;
    property_id: number;
    city: string;
    country: string;
    net_price: number;
    selling_price: number;
    start_price: number;
    secondary_start_price: number;
    secondary_selling_price: number;
    instalment_details: {};
    display_image: string;
    amenties:[];
    date:string;
    latitude: string;
    longintude: string;
}

export class PriceRange{
    min_price : string;
    max_price : string;
}