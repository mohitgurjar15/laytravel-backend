import { InternalServerErrorException } from "@nestjs/common";
import { collect } from "collect.js";
import { ApiHelper } from "../helpers/api.helper";

export class Search{
    
    private item: any;
    
    private rate: any;
    
    private supplierName: string = 'priceline';

    private apiHelper: ApiHelper;

    private searchParameters: any;

    constructor() {
        this.apiHelper = new ApiHelper();
    }

    processSearchResults(res, parameters) {
        
        this.searchParameters = parameters;
        
        let results = res.data['getHotelExpress.Results'];
        
        if (results.error) {
            throw new InternalServerErrorException(results.error.status);
        }
        
        if (results.results.status && results.results.status === "Success") { 
            
            let hotels = collect(results.results.hotel_data).map((item) => {
                this.item = item;
                this.rate = item['room_data'][0]['rate_data'][0];

                let { retail, selling, saving_percent, markup } = this.getRates();
                
                let details = this.apiHelper.getHotelDetails(item);

                let newItem = {
                    ...details,
                    retail,
                    selling,
                    saving_percent,
                    markup,
                    refundable: this.rate['is_cancellable'],
                    card_required: this.rate['cvc_required']
                };

                return newItem;
            });
            
            return {
                hotels,
                details: {
                    total: hotels.count(),
                    token: ""
                }
            };
        } else {
            throw new InternalServerErrorException(results.error.status);
        }
    }

    getRates() {

        let retail = this.apiHelper.getPublicPriceBreakUp(this.rate, this.searchParameters);
        
        let selling = this.apiHelper.getSellingPriceBreakUp(this.rate);

        let saving_percent = +(100 - ((selling.total * 100) / retail.total)).toFixed(2);
        
        let markup = 0;

        return {
            retail,
            selling,
            saving_percent,
            markup
        }
    }
}