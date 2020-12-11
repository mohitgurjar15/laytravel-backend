import { collect } from "collect.js";

export class FilterHelper{
    
    static async generateFilterObjects(cacheData) {
        
        const mapper = (item, key) => {
            return {
                title: key,
                count: item
            }
        };

        let hotels = collect(cacheData.hotels)
        
        let sellings = hotels.pluck('selling');
        
        let min = sellings.min('total');
        
        let max = sellings.max('total');
        
        let fixRatings = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        
        let ratings = hotels.pluck('rating').countBy().union(fixRatings).map(mapper).values()
        
        let ameneties = hotels.pluck('amenities').flatten().countBy().map(mapper).values();
        
        let refund_policy = hotels.pluck('refundable').countBy().map(mapper).values();
        
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