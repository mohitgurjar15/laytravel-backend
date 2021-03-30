import { NotFoundException } from "@nestjs/common";
import { RoomHelper } from "../helpers/room.helper";
import { errorMessage } from "src/config/common.config";
export class Availability {
    private roomHelper: RoomHelper;

    constructor() {
        this.roomHelper = new RoomHelper();
    }

    static processAvailabilityResult(res, availabilityDto) {
        let results = res["getHotelExpress.Contract"];

        if (results.error) {
            throw new NotFoundException(
                "No result found &&&availability&&&" + errorMessage
            );
        }

        console.log(res);
        

        if (results.results.status && results.results.status === "Success") {
            let res = results.results;
            let hotel = res.hotel_data[0];

            let room = new RoomHelper().processRoom(
                hotel,
                availabilityDto,
                res.input_data
            );
            return room;
        }
    }
}
