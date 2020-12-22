import { InternalServerErrorException } from "@nestjs/common";
import { RoomHelper } from "../helpers/room.helper";
import { errorMessage } from "src/config/common.config";

export class Rooms{

    private roomHelper: RoomHelper;

    constructor() {
        this.roomHelper = new RoomHelper();
    }

    processRoomsResult(res, roomsReqDto) {
        
        let results = res.data['getHotelExpress.MultiContract'];
        
        if (results.error) {
            throw new InternalServerErrorException("No result found &&&rooms&&&"+errorMessage);
        }

        if (results.results.status && results.results.status === "Success") {
            
            let hotel = results.results.hotel_data[0];
            // return hotel;
            let rooms = this.roomHelper.processRoom(hotel, roomsReqDto);

            return rooms;

        }
    }
}