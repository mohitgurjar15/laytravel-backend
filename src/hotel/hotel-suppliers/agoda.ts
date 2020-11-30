import { HotelInterface } from "./hotel.interface";

export class Agoda implements HotelInterface{

    autoComplete(term: string) {
        console.log('agoda', term);
    }
}