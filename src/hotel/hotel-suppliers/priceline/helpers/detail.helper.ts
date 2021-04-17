import { GenericHotel } from "src/hotel/helpers/generic.helper";
import * as config from 'config';
import { collect } from "collect.js";

export class DetailHelper {

    private hotel: any;

    private genericHelper: GenericHotel;
    constructor() {
        this.genericHelper = new GenericHotel();
    }
    private default_amenities = {
        "Free Breakfast" : "breakfast",
        "Restaurant" : "breakfast",
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
        
        let query = GenericHotel.httpBuildQuery(parameters);
        
        return ppnConfig.url+api+'?'+query;
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
            
            let reviews = this.setReviews();

            extra = {
                images : hotel.photo_data,
                total_images : hotel.photo_data.length,
                check_in_time : hotel.check_in_time,
                check_out_time: hotel.check_out_time,
                reviews
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
        let address='';
        if(this.hotel['address'].address_line_one!=null)
            address=`${this.hotel['address'].address_line_one}, `
        if(this.hotel['address'].city_name!=null)
            address=`${address} ${this.hotel['address'].city_name}, `
        if(this.hotel['address'].state_code!=null)
            address=`${address} ${this.hotel['address'].state_code}, `
        if(this.hotel['address'].zip!=null)
            address=`${address} ${this.hotel['address'].zip}, `
        if(this.hotel['address'].country_code!=null)
            address=`${address} ${this.hotel['address'].country_code}`
        
        address = address.replace(/,\s*$/, "");
        return address
        
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
    
        if(this.genericHelper.isset(this.hotel['thumbnail_hq'])) {
            thumbnail = this.hotel['thumbnail_hq'];
            //thumbnail = this.genericHelper.isset(thumbnail['three_hundred_square']) ? thumbnail['three_hundred_square'] : thumbnail['hundred_fifty_square'];
        }else{
            thumbnail = this.hotel['thumbnail'];
        }

        return thumbnail;
    }

    setDistance() {
        return this.hotel['distance'] / 1000;
    }

    setReviews() {
        
        let reviews = this.hotel['review_data'] ?? [];

        reviews = collect(reviews).map((item: any) => {
            let new_item = {
                user_name: item.user_name,
                rating_star : +(item.average_rating) / 2,
                average_rating : +item.average_rating,
                description: '<b>Pros:</b> ' + item.good_description + ' <b>Cons:</b> ' + item.bad_description,
                average_rating_description: item.average_rating_description,
                creation_date: item.creation_date
            };
            
            return new_item;
        });

        return reviews;
    }
}