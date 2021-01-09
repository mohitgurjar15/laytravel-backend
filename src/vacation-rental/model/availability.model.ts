import { integer } from "aws-sdk/clients/cloudfront";
import { double } from "aws-sdk/clients/lightsail";

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
    amenities:[];
    fixed_amenities:[];
    check_in_date:string;
    check_out_date:string;
    latitude: string;
    longintude: string;
    near_distance:NearDistance[];
}

export class NearDistance{
    ditance:double;
    near_by:string;
    location:string;

}

export class PriceRange{
    min_price : string;
    max_price : string;
}