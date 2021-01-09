import { NotFoundException } from "@nestjs/common";
import { collect } from "collect.js";
import { errorMessage } from "src/config/common.config";

export class Book{
    processBookResult(res) {
        
        let results = res.data['getHotelExpress.Book'];

        if (results.error) {
            return {
                status: 'fail'
            }
        }

        if (results.results.status && results.results.status === "Success") { 
            
            let res = results.results
            let book_data = res.book_data;
            let itinerary = book_data.itinerary;
            let itinerary_details = book_data.itinerary_details;
            let room_data = collect(itinerary_details.room_data);
            let room_confirmation_ids = room_data.pluck('confirmation_code');
            let cancellation_policy = room_data.pluck('policy_data');

            return {
                status: 'success',
                details: {   
                    booking_id: itinerary.id,
                    hotel_confirmation_id: itinerary.confirmation_number,
                    room_confirmation_ids,
                    cancellation_policy,
                    supplier: itinerary.code
                }
            }
        }
    }
}