import { collect } from "collect.js";

export class FilterHelper{

    static async generateFilterObjects(cacheData) {
        
        let hotels = collect(cacheData.hotels)
        
        let sellings = hotels.pluck('selling');
        
        let min = sellings.min('total');
        
        let max = sellings.max('total');
        
        let fixRatings = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        
        let ratings = hotels.pluck('rating').countBy().union(fixRatings);
        
        let ameneties = hotels.pluck('amenities').flatten().countBy();
        
        let refund_policy = hotels.pluck('refundable').countBy();
        
        let secondary_price = {
            min: hotels.min('secondary_start_price'),
            max: hotels.max('secondary_start_price')
        };


        return {
            price: {
                min,
                max
            },
            secondary_price,
            ameneties,
            ratings,
            refund_policy
        };
    }
}