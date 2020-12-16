import { Generic } from "src/hotel/helpers/generic.helper";
import * as config from 'config';
import { collect } from "collect.js";

export class DetailHelper {

    private hotel: any;

    private default_amenities = {
        "Free Breakfast" : "breakfast",
        "Free Internet Access" : "wifi",
        "No Smoking Rooms/Facilities": "no_smoking",
        "tv": "tv",
        "ac" : "ac"
    };

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

    getHotelDetails(hotel: any, type: string = 'detail') {
        
        this.hotel = hotel;

        let address = hotel['address'];

        let full_address = this.setFullAddress();

        let amenities = this.setAmenities();

        let thumbnail = this.setThumbnail();

        let distance = this.setDistance();

        let extra = {};

        if(type == 'detail'){
            
            extra = {
                images : hotel.photo_data,
                total_images : hotel.photo_data.length,
                check_in_time : hotel.check_in_time,
                check_out_time : hotel.check_out_time,
            };
        }

        return {
            id: hotel.id,
            name: hotel.name,
            description: hotel.hotel_description,
            hotel_zone: hotel.hotel_zone,
            address,
            full_address,
            amenities,
            thumbnail,
            rating: Math.ceil(hotel.star_rating),
            review_rating: hotel.review_rating,
            review_rating_desc: hotel.review_rating_desc,
            geocodes: hotel.geo,
            hotel_chain: {
                code: hotel.hotel_chain.code,
                name: hotel.hotel_chain.name
            },
            distance,
            ...extra
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
        
        let amenities = collect(this.hotel['amenity_data']).pluck('name');
        
        let amenities_array = amenities.values().toArray();

        let combined = amenities.combine(amenities_array);
        
        let sorted_amenities = collect(this.default_amenities).intersectByKeys(combined).values().unique().toArray();

        return {
            list: amenities_array,
            fixed: sorted_amenities,
            total: amenities.count()
        }
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