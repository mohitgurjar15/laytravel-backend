import { collect } from "collect.js";

export class FilterHelper{

    static async generateFilterObjects(cacheData) {
        
        let hotels = collect(cacheData.hotels)
        
        let sellings = hotels.pluck('selling');

        let min = sellings.min('total');
        
        let max = sellings.max('total');

        let ratings = hotels.pluck('rating').countBy();
        
        let ameneties = hotels.pluck('amenities').flatten().countBy();
        
        let refund_policy = hotels.pluck('refundable').countBy();

        return {
            price: {
                min,
                max
            },
            ameneties,
            ratings,
            refund_policy
        };
    }
}