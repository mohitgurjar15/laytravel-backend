import { NotFoundException } from "@nestjs/common";
import { RoomHelper } from "../helpers/room.helper";
import { errorMessage } from "src/config/common.config";
import { LandingPage } from "src/utility/landing-page.utility";
import moment = require("moment");
import { ModulesName } from "src/enum/module.enum";
import { PaymentConfigurationUtility } from "src/utility/payment-config.utility";
export class Availability {
    private roomHelper: RoomHelper;

    constructor() {
        this.roomHelper = new RoomHelper();
    }

    async processAvailabilityResult(res, availabilityDto, referralId) {
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
                departure: hotel['address']['city_name'], checkInDate: res.input_data.check_in, state: hotel['address']['state_name']
            }
            let offerData = LandingPage.getOfferData(referralId, 'hotel', searchData)
            let daysUtilDepature = moment(res.input_data.check_in).diff(moment().format("YYYY-MM-DD"), 'days')
            let paymentConfig = await PaymentConfigurationUtility.getPaymentConfig(ModulesName.HOTEL, 0, daysUtilDepature)
            let room = this.roomHelper.processRoom(
                hotel,
                availabilityDto,
                res.input_data,
                offerData,
                paymentConfig
            );
            return room;
        }
    }
}
