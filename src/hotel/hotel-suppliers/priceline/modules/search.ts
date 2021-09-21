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
import { LandingPage } from "src/utility/landing-page.utility";
import { PaymentConfiguration } from "src/entity/payment-configuration.entity";
import { InstalmentType } from "src/enum/instalment-type.enum";
import { CostExplorer } from "aws-sdk";

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

    async processSearchResult(res, parameters, referralId: string, paymentConfig: PaymentConfiguration) {
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
                /// for alpha server condition bypass by parth virani
                if (
                    (hotel["room_data"][0]["rate_data"][0].payment_type =="PREPAID")
                ) {
                    this.item = hotel;
                    this.rate = hotel["room_data"][0]["rate_data"][0];
                    let searchData = {
                        departure: hotel['address']['city_name'], checkInDate: parameters.check_in, state: hotel['address']['state_name']
                    }
                    let offerData = LandingPage.getOfferData(referralId, 'hotel', searchData)
                    if(this.rate.is_cancellable=='false'){
                        offerData.applicable=false;
                    }
                    let {
                        retail,
                        selling,
                        saving_percent, net_rate,
                        discounted_selling_price
                    } = this.rateHelper.getRates(this.rate, parameters, null, [], offerData);

                    if(parameters.is_refundable == "yes" && this.rate.is_cancellable == "false") {
                        continue
                    }
                    if (selling['discounted_total'] > 25) {
                        let details = this.detailHelper.getHotelDetails(
                            hotel,
                            "list"
                        );
                        let weeklyCustomDownPayment = LandingPage.getDownPayment(offerData, 0);
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
                        let discounted_start_price = 0;
                        let discounted_secondary_start_price = 0;
                        let discounted_no_of_weekly_installment = 0;

                        let downpayment=0;
                        let isPerenctageDownpayment=true;
                        

                        if (paymentConfig?.isInstallmentAvailable) {
                            let weeklyCustomDownPayment = LandingPage.getDownPayment(offerData, 0);
                            let downPaymentOption: any;
                            downPaymentOption = paymentConfig.downPaymentOption
                            
                            
                            //console.log("weeklyCustomDownPayment",weeklyCustomDownPayment,offerData)
                            if (paymentConfig.isWeeklyInstallmentAvailable) {

                                if(this.rate.is_cancellable=='false'){
                                    downpayment=60;
                                    isPerenctageDownpayment=true;
                                    offerData.applicable=false;
                                }
                                else if(weeklyCustomDownPayment!=null){
                                    downpayment=weeklyCustomDownPayment;
                                    isPerenctageDownpayment=false;
                                }
                                else{
                                    downpayment=downPaymentOption[0];
                                    isPerenctageDownpayment=paymentConfig.isDownPaymentInPercentage;
                                }

                                let instalmentDetails = Instalment.weeklyInstalment(
                                    selling.total,
                                    parameters.check_in,
                                    bookingDate,
                                    downpayment,
                                    isPerenctageDownpayment
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
                                    console.log(instalmentDetails)
                                }

                            }

                            if (paymentConfig.isBiWeeklyInstallmentAvailable) {
                                if(this.rate.is_cancellable=='false'){
                                    downpayment=60;
                                    isPerenctageDownpayment=true;
                                }
                                else{
                                    downpayment=downPaymentOption[0];
                                    isPerenctageDownpayment=paymentConfig.isDownPaymentInPercentage;
                                }
                                let instalmentDetails2 = Instalment.biWeeklyInstalment(
                                    selling.total,
                                    parameters.check_in,
                                    bookingDate,
                                    downpayment,
                                    isPerenctageDownpayment
                                );
                                if(instalmentDetails2.instalment_available) {

                                    second_down_payment =
                                    instalmentDetails2.instalment_date[0]
                                    .instalment_amount;
                                    secondary_start_price_2 =
                                    instalmentDetails2.instalment_date[1]
                                    .instalment_amount;
                                    no_of_weekly_installment_2 =
                                    instalmentDetails2.instalment_date.length - 1;
                                }
                            }


                            if (paymentConfig.isMonthlyInstallmentAvailable) {
                                if(this.rate.is_cancellable=='false'){
                                    downpayment=60;
                                    isPerenctageDownpayment=true;
                                }
                                else{
                                    downpayment=downPaymentOption[0];
                                    isPerenctageDownpayment=paymentConfig.isDownPaymentInPercentage;
                                }

                                let instalmentDetails3 = Instalment.monthlyInstalment(
                                    selling.total,
                                    parameters.check_in,
                                    bookingDate,
                                    downpayment,
                                    isPerenctageDownpayment
                                    );
                                if(instalmentDetails3.instalment_available) {
                                    
                                    third_down_payment =
                                    instalmentDetails3.instalment_date[0]
                                    .instalment_amount;
                                    secondary_start_price_3 =
                                    instalmentDetails3.instalment_date[1]
                                    .instalment_amount;
                                    no_of_weekly_installment_3 =
                                    instalmentDetails3.instalment_date.length - 1;
                                }
                                else{
                                    paymentConfig.isMonthlyInstallmentAvailable=false;
                                }
                            }

                            if(this.rate.is_cancellable=='false'){
                                downpayment=60;
                                isPerenctageDownpayment=true;
                                offerData.applicable=false;
                            }
                            else if(weeklyCustomDownPayment!=null){
                                downpayment=weeklyCustomDownPayment;
                                isPerenctageDownpayment=false;
                            }
                            else{
                                downpayment=downPaymentOption[0];
                                isPerenctageDownpayment=paymentConfig.isDownPaymentInPercentage;
                            }
                            let discountedInstalmentDetails = Instalment.weeklyInstalment(
                                selling['discounted_total'],
                                parameters.check_in,
                                bookingDate,
                                downpayment,
                                isPerenctageDownpayment
                            );

                            if (discountedInstalmentDetails.instalment_available) {
                                discounted_start_price =
                                    discountedInstalmentDetails.instalment_date[0].instalment_amount;

                                discounted_secondary_start_price =
                                    discountedInstalmentDetails.instalment_date[1].instalment_amount;

                                discounted_no_of_weekly_installment =
                                    discountedInstalmentDetails.instalment_date.length - 1;
                            }
                        }

                        let payment_object

                        if (offerData.applicable) {
                            //console.log("discounted_start_price",discounted_start_price)
                            paymentConfig.isInstallmentAvailable = true
                            payment_object = {
                                installment_type: InstalmentType.WEEKLY,
                                weekly: {
                                    down_payment: discounted_start_price,
                                    installment: discounted_secondary_start_price,
                                    installment_count: discounted_no_of_weekly_installment,
                                    actual_installment: secondary_start_price
                                }
                            }
                        } else if (paymentConfig?.isInstallmentAvailable) {
                            payment_object = {}
                            let t
                            if (paymentConfig.isWeeklyInstallmentAvailable) {
                                t = InstalmentType.WEEKLY

                            } else if (paymentConfig.isBiWeeklyInstallmentAvailable) {
                                t = InstalmentType.BIWEEKLY

                            } else if (paymentConfig.isMonthlyInstallmentAvailable) {
                                t = InstalmentType.MONTHLY
                            }
                            if (paymentConfig.isWeeklyInstallmentAvailable) {
                                payment_object[InstalmentType.WEEKLY] = {
                                    down_payment: discounted_start_price,
                                    installment: discounted_secondary_start_price,
                                    installment_count: discounted_no_of_weekly_installment
                                }
                            }
                            if (paymentConfig.isBiWeeklyInstallmentAvailable) {
                               
                                payment_object[InstalmentType.BIWEEKLY] = {
                                    down_payment: second_down_payment,
                                    installment: secondary_start_price_2,
                                    installment_count: no_of_weekly_installment_2
                                }
                            }
                            if (paymentConfig.isMonthlyInstallmentAvailable) {
                               
                                payment_object[InstalmentType.MONTHLY] = {
                                    down_payment: third_down_payment,
                                    installment: secondary_start_price_3,
                                    installment_count: no_of_weekly_installment_3
                                }
                            }
                            payment_object['installment_type'] = t

                        } else {
                            payment_object = {
                                selling_price: selling['discounted_total']
                            }
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
                            discounted_start_price,
                            discounted_secondary_start_price,
                            discounted_no_of_weekly_installment,
                            offer_data: offerData,
                            is_installment_available: paymentConfig?.isInstallmentAvailable || false,
                            payment_config: paymentConfig || {},
                            payment_object
                        };

                        hotels.push(newItem)
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
            let hotelsList
            if (hotels[0]?.discounted_secondary_start_price) {
                hotelsList = hotels.sort(function (a, b) {
                    return a.discounted_secondary_start_price - b.discounted_secondary_start_price;
                });
            } else {
                hotelsList = hotels.sort(function (a, b) {
                    return a.selling.total - b.selling.total;
                });
            }

            //console.log("hotelsList",hotelsList)
            return hotelsList;
            //return hotels;
        } else {
            throw new NotFoundException(results.error.status);
        }
    }
}
