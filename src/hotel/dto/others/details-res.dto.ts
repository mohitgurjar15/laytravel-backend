import { IsOptional } from "class-validator";

export class DetailsDto {
    
    filter: boolean;
    
    check_in: string;
    
    check_out: string;
    
    latitude: string;
    
    longitude: string;
    
    occupancies: Occupancy[];
    
    token: string;
    
    total: number;
    
    rooms?: number;
}

export class Occupancy {
    
    adults: number;
    
    children: number[];
}
