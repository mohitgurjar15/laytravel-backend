import { InternalServerErrorException, UsePipes, ValidationPipe } from "@nestjs/common";
import { collect } from "collect.js";
import { DetailHelper } from "../helpers/detail.helper";
import { Location } from './../../../dto/search-location/location.dto';

@UsePipes(new ValidationPipe({whitelist:true, forbidNonWhitelisted: true}))
export class AutoComplete{
    
    private detailHelper: DetailHelper;
    constructor() {
        this.detailHelper = new DetailHelper;
    }
    
    processSearchLocationResult(res: any) {
        let results = res.data.getHotelAutoSuggestV2;
        // return results;
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
                            state = this.detailHelper.isset(sub['state']) ? sub['state'] : null;
                            break;
                        
                        case 'airport':
                            country = sub['country_code'];
                            state = this.detailHelper.isset(sub['state_code']) ? sub['state_code'] : null;
                            city = sub['city'];
                            line = sub['icao']+' - '+sub['airport'];
                            break;
                            
                        case 'region':
                            line = sub['region_name'];
                            break;
                                
                        case 'poi':
                            line = sub['poi_name'];
                            state = this.detailHelper.isset(sub['state']) ? sub['state'] : null;
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

        } else{
            throw new InternalServerErrorException(results.error.status);
        }
    }
}