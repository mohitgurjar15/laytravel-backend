import { collect } from "collect.js";

export class HotelBookingParam{
    
    full_name: string;
    
    amount: string;
    
    book_id: string;
    
    guest_names: string[];

    check_in: string;
    
    check_out: string;
    
    adults: number;
    
    child: number;
    
    rooms: number;
    
    lay_credits?: number = 0;

    hotel: HotelDetail;
    
    room: RoomDetail;
    
    card: Card;
    
    constructor(detail: any) {
        
        this.full_name = detail.user.full_name;
        this.book_id = detail.laytripBookingId;
        this.check_in = detail.checkInDate;
        this.check_out = detail.checkOutDate;
        this.amount = `${detail.currency2.symbol}${detail.totalAmount} ${detail.currency2.code}`;
        
        let occupancies = collect(detail.moduleInfo.details.occupancies);
        this.rooms = occupancies.count();
        this.adults = +occupancies.sum('adults');
        this.child = occupancies.flatMap((value) => value['children']).count();

        this.guest_names = collect(detail.travelers).pluck('userData.full_name').toArray();
        this.hotel = new HotelDetail(detail.moduleInfo.hotel);
        
        this.room = new RoomDetail(detail.moduleInfo.room);
        
        this.card = new Card(detail.card);
        
    }
}

export class HotelDetail{
    
    name: string;
    
    full_address: string;
    
    latitude: string;

    longitude: string;

    constructor(detail: any) {
        this.name = detail.name;
        this.full_address = detail.full_address;
        this.latitude = detail.geocodes.latitude;
        this.longitude = detail.geocodes.longitude;
    }
}

export class RoomDetail{
    
    name: string;
    
    cancellation_policies: any;
    
    policies: any;
    
    constructor(room: any) {
        this.name = room.title;
        this.cancellation_policies = room.cancellation_policies;
        this.policies = room.policies;
    }
}

export class Card{
    
    digits: string;
    
    holder_name: string;
    
    type: string;

    constructor(card: any){
        this.digits = card.cardDigits;
        this.holder_name = card.cardHolderName;
        this.type = card.cardType;
    }
}