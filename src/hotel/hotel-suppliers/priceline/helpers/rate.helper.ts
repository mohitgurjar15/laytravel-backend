export class RateHelper{
    
    getPublicPriceBreakUp(rate, searchParameters) {
        
        let nights = (rate['price_details']['night_price_data']).length;

        let rooms = searchParameters.rooms;

        let sub_total = 0;

        let publicPrice = sub_total = (rate['benchmark_price_details']['display_price'] * nights) * rooms;
        
        let net = rate['price_details'];

        let percent = net['display_taxes'] / net['display_sub_total'];
        
        let taxes = +(publicPrice * percent).toFixed(2);
        
        let total = +(publicPrice + taxes).toFixed(2);

        return {
            sub_total,
            total,
            taxes
        };
    }

    getSellingPriceBreakUp(rate) {
        
        let nights = (rate['price_details']['night_price_data']).length;

        let displayRates = rate['price_details'];

        let sub_total = displayRates['display_sub_total'];

        let taxes = displayRates['display_taxes'];
        
        let total = displayRates['display_total'];

        let avg_night_price = +(total / nights).toFixed(2);
        
        return {
            sub_total,
            total,
            taxes,
            avg_night_price
        };
    }

    getRates(rate: any, searchParameters: any,inputData=null) {
        
        searchParameters.rooms = searchParameters.rooms || inputData.num_rooms;
        let retail = this.getPublicPriceBreakUp(rate, searchParameters);

        let selling = this.getSellingPriceBreakUp(rate);
        
        let saving_percent = +(100 - ((selling.total * 100) / retail.total)).toFixed(2);
        

        return {
            retail,
            selling,
            saving_percent
        }
    }
}