export interface Locations {
    Location;
}

export class Location {
    title: string;
    city: string;
    state: string;
    country: string;
    type: string;
    hotel_id: string;
    geo_codes: GeoCode;
}

export class GeoCode {
    lat: number;
    long: number;
}