import { InternalServerErrorException } from "@nestjs/common";
import { collect } from "collect.js";
import { DetailHelper } from "../helpers/detail.helper";
import { RateHelper } from "../helpers/rate.helper";


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
            throw new InternalServerErrorException(results.error.status);
        }
        
        if (results.results.status && results.results.status === "Success") { 
            
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
                    bundle: this.rate.ppn_bundle
                };

                return newItem;
            });
            
            return hotels;
            
        } else {
            throw new InternalServerErrorException(results.error.status);
        }
    }
    getRates() {
        
        let retail = this.detailHelper.getPublicPriceBreakUp(this.rate, this.searchParameters);

        let selling = this.detailHelper.getSellingPriceBreakUp(this.rate);
        
        let saving_percent = +(100 - ((selling.total * 100) / retail.total)).toFixed(2);
        
        let markup = 0;

        return {
            retail,
            selling,
            saving_percent
        }
    }
}

