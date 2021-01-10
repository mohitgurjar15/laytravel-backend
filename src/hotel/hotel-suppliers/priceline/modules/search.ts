import { NotFoundException } from "@nestjs/common";
import { collect } from "collect.js";
import { DetailHelper } from "../helpers/detail.helper";
import { RateHelper } from "../helpers/rate.helper";
import { errorMessage } from "src/config/common.config";


export class Search{
    
    private item: any;
    
    private rate: any;
    
    private supplierName: string = 'priceline';

    private detailHelper: DetailHelper;
    
    private rateHelper: RateHelper;

    constructor() {
        this.detailHelper = new DetailHelper();
        this.rateHelper = new RateHelper();
    }

    processSearchResult(res, parameters) {
        
        let results = res.data['getHotelExpress.Results'];

        if (results.error) {

            throw new NotFoundException("No result found &&&search&&&"+errorMessage);
        }
        
        if (results.results.status && results.results.status === "Success") { 
            // return results.results.hotel_data;
            let hotels = collect(results.results.hotel_data).map((item) => {

                this.item = item;
                
                this.rate = item['room_data'][0]['rate_data'][0];

                let { retail, selling, saving_percent } = this.rateHelper.getRates(this.rate, parameters);
                
                let details = this.detailHelper.getHotelDetails(item, 'list');

                let newItem = {
                    ...details,
                    retail,
                    selling,
                    saving_percent,
                    refundable: this.rate.is_cancellable,
                    card_required: this.rate.cvc_required,
                    available_rooms: this.rate.available_rooms,
                    bundle: this.rate.ppn_bundle
                };

                return newItem;
            });
            
            return hotels;
            
        } else {
            throw new NotFoundException(results.error.status);
        }
    }

}
