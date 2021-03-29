import { collect } from "collect.js";
import * as moment from 'moment';
import { DateTime } from "src/utility/datetime.utility";
import { RateHelper } from "./rate.helper";

export class RoomHelper{
    
    private rateHelper: RateHelper;

    constructor() {
        this.rateHelper = new RateHelper();
    }

    processRoom(hotel: any, roomsReqDto: any,inputData=null) {
        
        let roomData = hotel.room_data;
        //console.log("Hotel",hotel)
        // return roomData;
        let rooms = collect(roomData).pluck('rate_data').map((rates: any) => {
            
            let newItem: any = {};
            
            collect(rates).map((rate: any) => {
                
                let beddings = collect(rate.bedding_data).pluck('bed_type').values().toArray();

                let cancellation_policies = this.processCancellationPolicies(rate.cancellation_details);

                let { retail, selling, saving_percent } = this.rateHelper.getRates(rate, roomsReqDto);

                let board_type = rate.board_type != 'NONE' ? rate.board_type : '';
                newItem = {
                    hotel_id : hotel.id,
                    hotel_name : hotel.name,
                    input_data  : inputData?inputData:{},
                    amenity_data:hotel.amenity_data,
                    address : hotel.address,
                    room_id: rate.room_id,
                    title: rate.title,
                    description: rate.description,
                    beddings,
                    available_rooms: rate.available_rooms,
                    board_type,
                    retail,
                    selling,
                    saving_percent,
                    amenities: rate.rate_amenity_data ?? [],
                    supplier_id: rate.source,
                    distribution_type: rate.distribution_type,
                    payment_type: rate.payment_type,
                    is_refundable: rate.is_cancellable,
                    cancellation_policies,
                    policies: rate.policy_data,
                    bundle: rate.ppn_bundle
                }
                
            });

            return newItem;
        });

        return rooms;
    }    

    processCancellationPolicies(policies) {
        
        let res = collect(policies).map((item: any) => {
            return {
                description: item.description,
                after: DateTime.convertFormat(item.date_after),
                before: DateTime.convertFormat(item.date_before),
                cancellation_fee: item.display_cancellation_fee,
                refund: item.display_refund,
                total_charges: item.display_total_charges,
            }
        });

        return res;
    }

    processAvailability(hotel, roomsReqDto) {
        
    }
    
}