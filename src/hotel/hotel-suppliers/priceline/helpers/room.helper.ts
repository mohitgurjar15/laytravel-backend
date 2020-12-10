import { collect } from "collect.js";
import { retry } from "rxjs/operators";

export class RoomHelper{
    
    processRoom(hotel: any) {
        
        let roomData = hotel.room_data;

        let rooms = collect(roomData).pluck('rate_data').map((rates: any) => {
            
            let newItem: any = {};
            
            collect(rates).map((rate: any) => {
                
                newItem = {
                    title: rate.title,
                    description: rate.description,
                    supplier_id: rate.source,
                    distribution_type: rate.distribution_type,
                    payment_type: rate.payment_type,
                    is_refundable: rate.is_cancellable,
                }
                
            });

            return newItem;
        });

        return rooms;
    }    
}