import { IsString } from "class-validator";
import { card } from "src/config/common.config";

export class BookDto{
    
    @IsString()
    initials: string;

    @IsString()
    name_first: string;

    @IsString()
    name_last: string;

    @IsString()
    email: string;

    @IsString()
    phone_number: string;

    @IsString()
    card_type?: string = card.type;

    @IsString()
    card_number?: string = card.number;

    @IsString()
    expires?: string = card.exp_month+''+card.exp_year;

    @IsString()
    cvc_code?: string = card.cvv;

    @IsString()
    card_holder?: string = card.name;

    @IsString()
    address_line_one?: string = card.address.line_one;

    @IsString()
    address_city?: string = card.address.city;

    @IsString()
    address_state_code?: string = card.address.state_code;

    @IsString()
    country_code?: string = card.address.country_code;

    @IsString()
    address_postal_code?: string = card.address.postal_code;

    @IsString()
    ppn_bundle?: string;

    
    constructor(book) {
        Object.assign(this, book);
    }
}