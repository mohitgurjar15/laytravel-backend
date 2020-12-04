import { InternalServerErrorException } from "@nestjs/common";
import { collect } from "collect.js";

export class AutoComplete{
    
    processSearchLocationResults(res: any) {
        let results = res.data.getHotelAutoSuggestV2;

        if (results.error) {
            throw new InternalServerErrorException(results.error.status);
        }

        if (results.results.status && results.results.status === "Success") { 
 
            let data = collect(results.results.result);
            let filterData = [];
            data.each((item) => {
                collect(item).each((sub) => {
                    
                    let geoCodes = sub['coordinate'].split(',');
                    let type = sub['type'];
                    let country = null;
                    let city = null;
                    let state = null;
                    let line = null;
                    let hotel_id = null;

                    switch (type) {
                        case 'city':
                            country = sub['country'];
                            city = sub['city'];
                            state = sub['state'];
                            break;
                        
                        case 'airport':
                            country = sub['country_code'];
                            state = sub['state_code'];
                            city = sub['city'];
                            line = sub['airport'];
                            break;
                            
                        case 'region':
                            line = sub['region_name'];
                            break;
                                
                        case 'poi':
                            line = sub['poi_name'];
                            state = sub['state'];
                            city = sub['city'];
                            country = sub['country'];
                            break;
                        
                        case 'hotel':
                            line = sub['hotel_name'];
                            city = sub['address']['city_name'];
                            state = (sub['address']['state_name'] == "") ? sub['address']['state_code'] : sub['address']['state_name'];
                            country = (sub['address']['country_name'] == "") ? sub['address']['country_code'] : sub['address']['country_name'];
                            hotel_id = sub['hotelid_ppn'];
                            break;
                    }
                    
                    let title = [line, city, state, country].filter(x=>x).join(', ');
                    
                    filterData.push({
                        title,
                        city,
                        state,
                        country,
                        type,
                        hotel_id,
                        geo_codes: {
                            lat: geoCodes[0],
                            long: geoCodes[1]
                        }

                    });
                });
            });

            return filterData;
            // return Object.assign(new Locations(), filterData);

        } else{
            throw new InternalServerErrorException(results.error.status);
        }
    }
}