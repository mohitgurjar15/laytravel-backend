import { InternalServerErrorException } from "@nestjs/common";
import { DetailHelper } from "../helpers/detail.helper";
import { errorMessage } from "src/config/common.config";

export class Detail{
    
    private detailHelper: DetailHelper;

    constructor() {
        this.detailHelper = new DetailHelper();
    }

    processDetailResult(res, parameters){
        
        let results = res.data['getHotelHotelDetails'];
        
        if (results.error) {
            throw new InternalServerErrorException("No result found &&&detail&&&"+errorMessage);
        }
        
        if (results.results.status && results.results.status === "Success") {
            
            let hotel = results.results.hotel_data[0];
            // return hotel;
            let details = this.detailHelper.getHotelDetails(hotel);

            return details;

        }
    }
}