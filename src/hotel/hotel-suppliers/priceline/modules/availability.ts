import { NotFoundException } from "@nestjs/common";
import { RoomHelper } from "../helpers/room.helper";
import { errorMessage } from "src/config/common.config";
export class Availability {
    private roomHelper: RoomHelper;

    constructor() {
        this.roomHelper = new RoomHelper();
    }

    processAvailabilityResult(res, availabilityDto) {
        let results = res.data["getHotelExpress.Contract"];

        // console.log(results.error);
        

        if (results.error) {
            throw new NotFoundException(
                "No result found &&&availability&&&" + errorMessage
            );
        }

        // console.log(res);
        

        if (results.results.status && results.results.status === "Success") {
            let res = results.results;
            let hotel = res.hotel_data[0];
            // console.log('room')
            let room = this.roomHelper.processRoom(
                hotel,
                availabilityDto,
                res.input_data
            );
            return room;
        }
    }
}
