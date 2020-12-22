import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { InternalDto } from "./internal.dto";

export class BookDto extends InternalDto{
    
    payment_type: string;
    
    laycredit_points: number;
    
    card_token: string;
    
    instalment_type: string;
    
    additional_amount: number;
    
    custom_instalment_amount: null;

    custom_instalment_no: null;
    
    route_code: string;
    
    booking_through: string;
    
    travelers: Traveler[];

    siteUrl?: string;
    
}

export class Traveler {

    traveler_id: string;
    
}

