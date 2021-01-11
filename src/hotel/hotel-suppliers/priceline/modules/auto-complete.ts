import { NotFoundException, UsePipes, ValidationPipe } from "@nestjs/common";
import { collect } from "collect.js";
import { Generic } from "src/hotel/helpers/generic.helper";
import { errorMessage } from "src/config/common.config";

@UsePipes(new ValidationPipe({whitelist:true, forbidNonWhitelisted: true}))
export class AutoComplete{
    
    private genericHelper: Generic;
    
    constructor() {
        this.genericHelper = new Generic;
    }
    
    processSearchLocationResult(res: any) {
        let results = res.data.getHotelAutoSuggestV2;
        // return results;
        if (results.error) {
            throw new NotFoundException("No search result found &&&term&&&"+errorMessage);
        }

        if (results.results.status && results.results.status === "Success") { 
 
            let data = collect(results.results.result);
            let filterData = [];
            data.each((item) => {
                collect(item).each((sub) => {
                    
                    let geoCodes = sub['coordinate'].split(',');
                    let type = sub['type'];
                    let country = "";
                    let city = "";
                    let state = "";
                    let line = "";
                    let hotel_id = "";

                    switch (type) {
                        case 'city':
                            country = sub['country'];
                            city = sub['city'];
                            state = this.genericHelper.isset(sub['state']) ? sub['state'] : "";
                            break;
                        
                        case 'airport':
                            country = sub['country_code'];
                            state = this.genericHelper.isset(sub['state_code']) ? sub['state_code'] : "";
                            city = sub['city'];
                            line = sub['airport_spell'].reverse().join(' - ');
                            break;
                            
                        case 'region':
                            line = sub['region_name'];
                            break;
                                
                        case 'poi':
                            line = sub['poi_name'];
                            state = this.genericHelper.isset(sub['state']) ? sub['state'] : "";
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
            throw new NotFoundException(results.error.status);
        }
    }
}