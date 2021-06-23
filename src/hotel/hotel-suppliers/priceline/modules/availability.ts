import { NotFoundException } from "@nestjs/common";
import { RoomHelper } from "../helpers/room.helper";
import { errorMessage } from "src/config/common.config";
import { LandingPage } from "src/utility/landing-page.utility";
export class Availability {
    private roomHelper: RoomHelper;

    constructor() {
        this.roomHelper = new RoomHelper();
    }

    processAvailabilityResult(res, availabilityDto, referralId) {
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
            let searchData = {
                departure: hotel['address']['city_name'], checkInDate: res.input_data.check_in
            }
            let offerData = LandingPage.getOfferData(referralId, 'hotel', searchData)
            let room = this.roomHelper.processRoom(
                hotel,
                availabilityDto,
                res.input_data,
                offerData
            );
            return room;
        }
    }
}
