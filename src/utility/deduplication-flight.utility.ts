import { filter } from "rxjs/operators";

export class DeduplicationFlight {
    static async deduplicationFilter(allResult){

        // console.log("ALL RESULT-->", JSON.stringify(allResult))
        console.log("ALL RESULT LENGTH-->", allResult.length)
        let mergerRes = [];
        for(let i=0; i < allResult.length; i++){
            mergerRes = [...mergerRes, ...allResult[i]];
        }
        // console.log("Merge Res-->", JSON.stringify(mergerRes))
        let filteredRes = []
        
        for(let i =0; i < mergerRes.length; i++){
            
            let find= filteredRes.findIndex(item=>item.unique_code == mergerRes[i].unique_code);
            if(find == -1) {
                filteredRes.push(mergerRes[i])
            }
            else{   
                
                let route_codes = {
                    pkfare : {
                        route_code : mergerRes[i].route_code,
                        price : mergerRes[i].selling_price,
                    },
                    mystifly : {
                        route_code : filteredRes[find].route_code,
                        price : filteredRes[find].selling_price
                    }
                }
                
                if(mergerRes[i].offer_data.applicable) {
                    let route_codes = {
                        pkfare : {
                            route_code : mergerRes[i].route_code,
                            price : mergerRes[i].discounted_selling_price,
                        },
                        mystifly : {
                            route_code : filteredRes[find].route_code,
                            price : filteredRes[find].discounted_selling_price
                        }
                    }
                }

                if(filteredRes[find].selling_price > mergerRes[i].selling_price || filteredRes[find].discounted_selling_price > mergerRes[i].discounted_selling_price) {
                    filteredRes[find] = [];
                    filteredRes[find] = mergerRes[i];
                } 
                filteredRes[find].route_codes = route_codes;
            }
        }

        return filteredRes
    }

    static roundtripDeduplication(allResult) {
        let mergerRes = [];
        for(let i=0; i < allResult.length; i++){
            mergerRes = [...mergerRes, ...allResult[i]];
        }
        let filteredRes = []
        
        for(let i =0; i < mergerRes.length; i++){
            
            let find= filteredRes.findIndex(item=>item.unique_code == mergerRes[i].unique_code);
            if(find == -1) {
                filteredRes.push(mergerRes[i])
            }
            else{   
                
                let route_codes = {
                    pkfare : {
                        route_code : mergerRes[i].route_code,
                        price : mergerRes[i].selling_price,
                    },
                    mystifly : {
                        route_code : filteredRes[find].route_code,
                        price : filteredRes[find].selling_price
                    }
                }
                
                if(mergerRes[i].offer_data.applicable) {
                    let route_codes = {
                        pkfare : {
                            route_code : mergerRes[i].route_code,
                            price : mergerRes[i].discounted_selling_price,
                        },
                        mystifly : {
                            route_code : filteredRes[find].route_code,
                            price : filteredRes[find].discounted_selling_price
                        }
                    }
                }

                if(filteredRes[find].selling_price > mergerRes[i].selling_price || filteredRes[find].discounted_selling_price > mergerRes[i].discounted_selling_price) {
                    filteredRes[find] = [];
                    filteredRes[find] = mergerRes[i];
                } 
                filteredRes[find].route_codes = route_codes;
            }
        }

        return filteredRes
    }

}