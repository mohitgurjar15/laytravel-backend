export class DeduplicationFlight {
    static async onewayDeduplicationFilter(allResult){
        let mergerRes = [...allResult[0], ...allResult[1]];
        let filteredRes = []
        
        for(let i =0; i < mergerRes.length; i++){
            
            let find= filteredRes.findIndex(item=>item.unique_code == mergerRes[i].unique_code);
            if(find == -1) {
                filteredRes.push(mergerRes[i])
            }
            else{                
                if(filteredRes[find].selling_price > mergerRes[i].selling_price) {
                    filteredRes[find] = [];
                    filteredRes[find] = mergerRes[i]
                }
            }
        }

        return filteredRes
    }
}