import { collect } from "collect.js";
import * as moment from 'moment';
import { DateTime } from "src/utility/datetime.utility";
import { Instalment } from "src/utility/instalment.utility";
import { RateHelper } from "./rate.helper";

export class RoomHelper{
    
    private rateHelper: RateHelper;

    constructor() {
        this.rateHelper = new RateHelper();
    }

    processRoom(hotel: any, roomsReqDto: any,inputData=null) {
        
        let roomData = hotel.room_data;
        let rooms = collect(roomData).pluck('rate_data').map((rates: any) => {
            
            let newItem: any = {};
            let bookingDate = moment(new Date()).format("YYYY-MM-DD");
            collect(rates).map((rate: any) => {
                
                let beddings = collect(rate.bedding_data).pluck('bed_type').values().toArray();

                let cancellation_policies = this.processCancellationPolicies(rate.cancellation_details);

                let { retail, selling, saving_percent } = this.rateHelper.getRates(rate, roomsReqDto,inputData);
                let board_type = rate.board_type != 'NONE' ? rate.board_type : '';
                let start_price=0; let secondary_start_price=0;let no_of_weekly_installment=0;
                let second_down_payment=0; let secondary_start_price_2=0; let no_of_weekly_installment_2=0;
                let third_down_payment=0; let secondary_start_price_3=0;
                let no_of_weekly_installment_3=0;
                let instalmentDetails = Instalment.weeklyInstalment(
                    selling.total,
                    inputData.check_in,
                    bookingDate,0,null,null,0
                );
                let instalmentDetails2 = Instalment.biWeeklyInstalment(
                    selling.total,
                    inputData.check_in,
                    bookingDate,0,null,null,0
                );
                let instalmentDetails3 = Instalment.monthlyInstalment(
                    selling.total,
                    inputData.check_in,
                    bookingDate,0,null,null,0
                );
                if (instalmentDetails.instalment_available) {
                    start_price =
                        instalmentDetails.instalment_date[0].instalment_amount;

                    secondary_start_price =
                        instalmentDetails.instalment_date[1].instalment_amount;
                    no_of_weekly_installment =
                        instalmentDetails.instalment_date.length - 1;

                    second_down_payment =
                        instalmentDetails2.instalment_date[0].instalment_amount;
                    secondary_start_price_2 =
                        instalmentDetails2.instalment_date[1].instalment_amount;
                    no_of_weekly_installment_2 =
                        instalmentDetails2.instalment_date.length - 1;

                    third_down_payment =
                        instalmentDetails3.instalment_date[0].instalment_amount;
                    secondary_start_price_3 =
                        instalmentDetails3.instalment_date[1].instalment_amount;
                    no_of_weekly_installment_3 =
                        instalmentDetails3.instalment_date.length - 1;
                }

                newItem = {
                    hotel_id : hotel.id,
                    hotel_name : hotel.name,
                    input_data  : inputData?inputData:{},
                    amenity_data:hotel.amenity_data,
                    address : hotel.address,
                    room_id: rate.room_id,
                    title: rate.title,
                    occupancy:rate.occupancy_limit,
                    night_rate:(selling.total)/rate.price_details.night_price_data.length,
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
                    bundle: rate.ppn_bundle,
                    start_price,
                    secondary_start_price,
                    no_of_weekly_installment,
                    second_down_payment,
                    secondary_start_price_2,
                    no_of_weekly_installment_2,
                    third_down_payment,
                    secondary_start_price_3,
                    no_of_weekly_installment_3
                }
                
            });

            return newItem;
        });

        let data =  rooms.sort(function (a, b) {
            return a.night_rate - b.night_rate;
        });
        return data;
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