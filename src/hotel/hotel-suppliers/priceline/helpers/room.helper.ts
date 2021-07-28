import { collect } from "collect.js";
import * as moment from "moment";
import { PaymentConfiguration } from "src/entity/payment-configuration.entity";
import { DateTime } from "src/utility/datetime.utility";
import { Instalment } from "src/utility/instalment.utility";
import { LandingPage } from "src/utility/landing-page.utility";
import { RateHelper } from "./rate.helper";

export class RoomHelper {
    private rateHelper: RateHelper;

    constructor() {
        this.rateHelper = new RateHelper();
    }

    processRoom(hotel: any, roomsReqDto: any, inputData = null, offerData, paymentConfig: PaymentConfiguration) {
        let roomData = hotel.room_data;

        let rooms = collect(roomData).map((rates: any) => {
            let newItem: any = {};
            let bookingDate = moment(new Date()).format("YYYY-MM-DD");


            let rate = rates.rate_data[0];

            let beddings = collect(rate.bedding_data)
                .pluck("bed_type")
                .values()
                .toArray();

            let cancellation_policies = this.processCancellationPolicies(
                rate.cancellation_details
            );



            //console.log("rate.mandatory_fee_details", rate.price_details.mandatory_fee_details)
            let mandatoryFeeDetails = { is_prepaid: false, prepaid_break_dwon: [], is_postpaid: false, postpaid_break_dwon: [] };
            if (rate.price_details.mandatory_fee_details != null) {
                if (rate.price_details.mandatory_fee_details.breakdown.prepaid.breakdown.length) {
                    mandatoryFeeDetails.is_prepaid = true;
                    for (let price of rate.price_details.mandatory_fee_details.breakdown.prepaid.breakdown) {
                        mandatoryFeeDetails.prepaid_break_dwon.push({
                            price: price.display_total,
                            name: price.name
                        })
                    }
                }

                if (rate.price_details.mandatory_fee_details.breakdown.postpaid.breakdown.length) {
                    mandatoryFeeDetails.is_postpaid = true;
                    for (let price of rate.price_details.mandatory_fee_details.breakdown.postpaid.breakdown) {
                        mandatoryFeeDetails.postpaid_break_dwon.push({
                            price: price.display_total,
                            name: price.name
                        })
                    }
                }
            }

            let { retail, selling, saving_percent, net_rate } = this.rateHelper.getRates(
                rate,
                roomsReqDto,
                inputData,
                mandatoryFeeDetails.prepaid_break_dwon,
                offerData
            );

            if (selling['discounted_total'] > 25) {
                let weeklyCustomDownPayment = LandingPage.getDownPayment(offerData, 0);

                let board_type = rate.board_type != "NONE" ? rate.board_type : "";
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
                let discounted_no_of_weekly_installment = 0
                // let instalmentDetails = Instalment.weeklyInstalment(
                //     selling.total,
                //     inputData.check_in,
                //     bookingDate,
                //     0,
                //     null,
                //     null,
                //     0
                // );
                if (paymentConfig?.isInstallmentAvailable) {

                    let weeklyCustomDownPayment = LandingPage.getDownPayment(offerData, 0);
                    let downPaymentOption: any = paymentConfig.downPaymentOption
                    if (paymentConfig.isWeeklyInstallmentAvailable) {
                        let instalmentDetails = Instalment.weeklyInstalment(
                            selling.total,
                            inputData.check_in,
                            bookingDate,
                            0,
                            null,
                            null,
                            0,
                            false,
                            weeklyCustomDownPayment,
                            paymentConfig.isDownPaymentInPercentage,
                            downPaymentOption
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
                        }

                    }

                    if (paymentConfig.isBiWeeklyInstallmentAvailable) {
                        let instalmentDetails2 = Instalment.biWeeklyInstalment(
                            selling.total,
                            inputData.check_in,
                            bookingDate,
                            0,
                            null,
                            null,
                            0,
                            false,
                            null,
                            paymentConfig.isDownPaymentInPercentage,
                            downPaymentOption
                        );

                        second_down_payment =
                            instalmentDetails2.instalment_date[0]
                                .instalment_amount;
                        secondary_start_price_2 =
                            instalmentDetails2.instalment_date[1]
                                .instalment_amount;
                        no_of_weekly_installment_2 =
                            instalmentDetails2.instalment_date.length - 1;
                    }


                    if (paymentConfig.isMonthlyInstallmentAvailable) {
                        let instalmentDetails3 = Instalment.monthlyInstalment(
                            selling.total,
                            inputData.check_in,
                            bookingDate,
                            0,
                            null,
                            null,
                            0,
                            false,
                            null,
                            paymentConfig.isDownPaymentInPercentage,
                            downPaymentOption
                        );
                        third_down_payment =
                            instalmentDetails3.instalment_date[0]
                                .instalment_amount;
                        secondary_start_price_3 =
                            instalmentDetails3.instalment_date[1]
                                .instalment_amount;
                        no_of_weekly_installment_3 =
                            instalmentDetails3.instalment_date.length - 1;
                    }


                    let discountedInstalmentDetails = Instalment.weeklyInstalment(
                        selling['discounted_total'],
                        inputData.check_in,
                        bookingDate,
                        0,
                        null,
                        null,
                        0,
                        false,
                        weeklyCustomDownPayment,
                        paymentConfig.isDownPaymentInPercentage,
                        downPaymentOption
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

                newItem = {
                    hotel_id: hotel.id,
                    hotel_name: hotel.name,
                    input_data: inputData ? inputData : {},
                    amenity_data: hotel.amenity_data,
                    address: hotel.address,
                    full_address: this.setFullAddress(hotel.address),
                    room_id: rates.id,
                    title: rate.title,
                    mandatory_fee_details: mandatoryFeeDetails,
                    occupancy: rate.occupancy_limit,
                    night_rate:
                        selling.total / (rate.price_details.night_price_data.length * parseInt(inputData.num_rooms)),
                    description: rate.description,
                    beddings,
                    available_rooms: rate.available_rooms,
                    board_type,
                    retail,
                    selling,
                    net_rate,
                    saving_percent,
                    amenities: rate.rate_amenity_data ?? [],
                    supplier_id: rate.source,
                    distribution_type: rate.distribution_type,
                    payment_type: rate.payment_type,
                    is_refundable: rate.is_cancellable,
                    cancellation_policies,
                    policies: rate.policy_data,
                    bundle: rate.ppn_bundle,
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
                    is_installment_available: paymentConfig?.isInstallmentAvailable,
                    paymentConfig
                };

                return newItem;
            }
        });
        var filtered = rooms.filter(function (el) {
            return el != null;
        });
        let data
        let a:any = filtered

        if (a[0]?.discounted_secondary_start_price) {
            data = filtered.sort(function (a, b) {
                return a.discounted_secondary_start_price - b.discounted_secondary_start_price;
            });


        } else {
            data = filtered.sort(function (a, b) {
                return a.selling.total - b.selling.total;
            });
        }


        return data;
    }

    processCancellationPolicies(policies) {
        let res = collect(policies).map((item: any) => {
            return {
                description: item.description,
                after: DateTime.convertFormat(item.date_after),
                before: DateTime.convertFormat(item.date_before),
                cancellation_fee: item.display_cancellation_fee,
                refund: item.display_refund,
                total_charges: item.display_total_charges,
            };
        });

        return res;
    }

    processAvailability(hotel, roomsReqDto) { }

    setFullAddress(addressObj) {
        let address = "";
        if (addressObj.address_line_one != null)
            address = `${addressObj.address_line_one}, `;
        if (addressObj.city_name != null)
            address = `${address} ${addressObj.city_name}, `;
        if (addressObj.state_name != null)
            address = `${address} ${addressObj.state_name}, `;
        if (addressObj.zip != null) address = `${address} ${addressObj.zip}, `;
        if (addressObj.country_code != null)
            address = `${address} ${addressObj.country_code}`;

        address = address.replace(/,\s*$/, "");
        return address;
    }
}
