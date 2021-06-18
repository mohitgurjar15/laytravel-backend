import {
    BadRequestException,
    HttpService,
    NotFoundException,
} from "@nestjs/common";
import { collect } from "collect.js";
import { DetailHelper } from "../helpers/detail.helper";
import { RateHelper } from "../helpers/rate.helper";
import { errorMessage } from "src/config/common.config";
import { Instalment } from "src/utility/instalment.utility";
import moment = require("moment");
import { CommonHelper } from "../helpers/common.helper";
import { catchError, map } from "rxjs/operators";

export class Search {
    private item: any;

    private rate: any;

    private supplierName: string = "priceline";

    private detailHelper: DetailHelper;

    private rateHelper: RateHelper;

    private httpsService: HttpService;

    constructor() {
        this.detailHelper = new DetailHelper();
        this.rateHelper = new RateHelper();
        this.httpsService = new HttpService();
    }

    async processSearchResult(res, parameters) {
        let results = res.data["getHotelExpress.Results"];
        //console.log(parameters,"---")
        if (results.error) {
            throw new NotFoundException(
                "No result found &&&search&&&" + errorMessage
            );
        }

        let hotels = [];
        let hotelIds = "";
        if (results.results.status && results.results.status === "Success") {
            // return results.results.hotel_data;
            let bookingDate = moment(new Date()).format("YYYY-MM-DD");

            for (let hotel of results.results.hotel_data) {
                if (
                    hotel["room_data"][0]["rate_data"][0].payment_type ==
                        "PREPAID" &&
                    hotel["room_data"][0]["rate_data"][0].is_cancellable ==
                        "true"
                ) {
                    this.item = hotel;
                    this.rate = hotel["room_data"][0]["rate_data"][0];

                    let {
                        retail,
                        selling,
                        saving_percent,net_rate
                    } = this.rateHelper.getRates(this.rate, parameters);
                    if (selling.total > 25) {
                        let details = this.detailHelper.getHotelDetails(
                            hotel,
                            "list"
                        );
                        hotelIds += details.id + ",";
                        let start_price = 0;
                        let secondary_start_price = 0;
                        let no_of_weekly_installment = 0;
                        let second_down_payment = 0;
                        let secondary_start_price_2 = 0;
                        let no_of_weekly_installment_2 = 0;
                        let third_down_payment = 0;
                        let secondary_start_price_3 = 0;
                        let no_of_weekly_installment_3 = 0;
                        let instalmentDetails = Instalment.weeklyInstalment(
                            selling.total,
                            parameters.check_in,
                            bookingDate,
                            0,
                            null,
                            null,
                            0
                        );
                        let instalmentDetails2 = Instalment.biWeeklyInstalment(
                            selling.total,
                            parameters.check_in,
                            bookingDate,
                            0,
                            null,
                            null,
                            0
                        );
                        let instalmentDetails3 = Instalment.monthlyInstalment(
                            selling.total,
                            parameters.check_in,
                            bookingDate,
                            0,
                            null,
                            null,
                            0
                        );
                        if (instalmentDetails.instalment_available) {
                            start_price =
                                instalmentDetails.instalment_date[0]
                                    .instalment_amount;

                            secondary_start_price =
                                instalmentDetails.instalment_date[1]
                                    .instalment_amount;
                            no_of_weekly_installment =
                                instalmentDetails.instalment_date.length - 1;

                            second_down_payment =
                                instalmentDetails2.instalment_date[0]
                                    .instalment_amount;
                            secondary_start_price_2 =
                                instalmentDetails2.instalment_date[1]
                                    .instalment_amount;
                            no_of_weekly_installment_2 =
                                instalmentDetails2.instalment_date.length - 1;

                            third_down_payment =
                                instalmentDetails3.instalment_date[0]
                                    .instalment_amount;
                            secondary_start_price_3 =
                                instalmentDetails3.instalment_date[1]
                                    .instalment_amount;
                            no_of_weekly_installment_3 =
                                instalmentDetails3.instalment_date.length - 1;
                        }

                        let newItem = {
                            ...details,
                            retail,
                            selling,
                            net_rate,
                            saving_percent,
                            night_rate:
                                selling.total /
                                (this.rate.price_details.night_price_data.length * parameters.rooms),
                            refundable: this.rate.is_cancellable,
                            card_required: this.rate.cvc_required,
                            available_rooms: this.rate.available_rooms,
                            bundle: this.rate.ppn_bundle,
                            start_price,
                            secondary_start_price,
                            no_of_weekly_installment,
                            second_down_payment,
                            secondary_start_price_2,
                            no_of_weekly_installment_2,
                            third_down_payment,
                            secondary_start_price_3,
                            no_of_weekly_installment_3,
                        };

                        hotels.push(newItem);
                    }
                }
            }

            //console.log(hotelIds,"hotelIds")
            let urlparameters = {
                hotel_ids: hotelIds,
                image_size: "small",
            };

            let url = await CommonHelper.generateUrl(
                "getPhotos",
                urlparameters
            );

            let photos = await this.httpsService
                .get(url)
                .pipe(
                    catchError((err) => {
                        throw new BadRequestException(
                            err + " &&&term&&&" + errorMessage
                        );
                    })
                )
                .toPromise();

            if (
                hotels.length > 0 &&
                typeof photos.data.getHotelPhotos.results != "undefined"
            ) {
                for (let i = 0; i < hotels.length; i++) {
                    hotels[
                        i
                    ].images = photos.data.getHotelPhotos.results.hotel_photo_data.find(
                        (x) => x.hotel_id == hotels[i].id
                    ).photo_data;
                }

                
            }
            let hotelsList =  hotels.sort(function (a, b) {
                return a.secondary_start_price - b.secondary_start_price;
            });
            //console.log("hotelsList",hotelsList)
            return hotelsList;
            //return hotels;
        } else {
            throw new NotFoundException(results.error.status);
        }
    }
}
