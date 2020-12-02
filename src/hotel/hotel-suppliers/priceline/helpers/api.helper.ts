import { Generic } from "src/hotel/helpers/generic.helper";
import * as config from 'config';
import { collect } from "collect.js";
import { pluck } from "rxjs/operators";

export class ApiHelper {

    private hotel: any;

    static generateUrl(api: string, parameters: any) {

        let ppnConfig = config.get('ppn');

        let defaults = {
            format: ppnConfig.format,
            refid: ppnConfig.refid,
            api_key: ppnConfig.api_key,
        }
        
        parameters = { ...defaults, ...parameters };
        
        let query = Generic.httpBuildQuery(parameters);
        
        return ppnConfig.url+api+'?'+query;
    }
    
    isset(ref) {
        return typeof ref !== 'undefined';
    }

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
        
        let displayRates = rate['price_details'];

        let sub_total = displayRates['display_sub_total'];

        let taxes = displayRates['display_taxes'];
        
        let total = displayRates['display_total'];

        return {
            sub_total,
            total,
            taxes
        };
    }

    getHotelDetails(hotel: any, type?: string) {
        
        this.hotel = hotel;

        let address = hotel['address'];

        let full_address = this.setFullAddress();

        let amenities = this.setAmenities();

        let thumbnail = this.setThumbnail();

        let distance = this.setDistance();

        return {
            id: hotel['id'],
            name: hotel['name'],
            description: hotel['hotel_description'],
            hotel_zone: hotel['hotel_zone'],
            address,
            full_address,
            amenities,
            thumbnail,
            rating: hotel['star_rating'],
            geocodes: hotel['geo'],
            hotel_chain: {
                code: hotel['hotel_chain']['code'],
                name: hotel['hotel_chain']['name']
            },
            distance
        };
    }

    setFullAddress() {
        return collect(this.hotel['address'])
            .values()
            .filter((x) => {
                return x != null;
            }).map((x: any) => {
                return x.replace(/\s{2,}/g, '').trim();
            }).all().join(', ');
    }

    setAmenities() {
        return collect(this.hotel['amenity_data']).pluck('name').values().toArray();
    }

    setThumbnail() {
        let thumbnail = '';
    
        if(this.isset(this.hotel['thumbnail_hq'])) {
            thumbnail = this.hotel['thumbnail_hq'];
            thumbnail = this.isset(thumbnail['three_hundred_square']) ? thumbnail['three_hundred_square'] : thumbnail['hundred_fifty_square'];
        }else{
            thumbnail = this.hotel['thumbnail'];
        }

        return thumbnail;
    }

    setDistance() {
        return this.hotel['distance'] / 1000;
    }

}