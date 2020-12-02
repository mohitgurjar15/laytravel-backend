export class SearchResDto {
    hotels: Hotel[];
}

export class Hotel {
    id:             string;
    name:           string;
    hotel_zone:     string;
    description:    string;
    rating:         number;
    thumbnail:      string;
    address:        Address;
    geocodes:       Geocodes;
    hotel_chain:    HotelChain;
    amenities:      string[];
    distance:       number;
    retail:         Retail;
    selling:        Retail;
    saving_percent: number;
    card_required:  boolean;
    refundable:     boolean;
}

export class Address {
    city_name:        string;
    address_line_one: string;
    state_code:       null;
    state_name:       null;
    country_code:     string;
    country_name:     string;
    zip:              string;
}

export class Geocodes {
    latitude: string;
    longitude: string;
}

export class HotelChain {
    name: string;
    code: string;
}

export class Retail {
    sub_total: number;
    taxes:     number;
    total:     number;
    supplier:  string;
}
