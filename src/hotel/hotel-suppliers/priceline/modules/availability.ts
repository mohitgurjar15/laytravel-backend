import { InternalServerErrorException } from "@nestjs/common";
import { RoomHelper } from "../helpers/room.helper";

export class Availability{
    
    private roomHelper: RoomHelper;
    
    constructor() {
        this.roomHelper = new RoomHelper();
    }

    processAvailabilityResult(res, availabilityDto) {
        
        let results = res.data['getHotelExpress.Contract'];
        
        if (results.error) {
            throw new InternalServerErrorException(results.error.status);
        }

        if (results.results.status && results.results.status === "Success") {
            
            let res = results.results
            let hotel = res.hotel_data[0];
            
            let room = this.roomHelper.processRoom(hotel, availabilityDto);

            return room;

        }
    }
}