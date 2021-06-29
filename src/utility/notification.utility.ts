import { NotFoundException } from "@nestjs/common";
import { Booking } from "src/entity/booking.entity";
import { getConnection } from "typeorm";
import { CartDataUtility } from "./cart-data.utility";
import { DateTime } from "./datetime.utility";
import { Generic } from "./generic.utility";
import { EmailNotificationModel } from "src/config/email_template/model/notification.model";
import moment = require("moment");
import { RouteCategory } from "./route-category.utility";
import { PredictiveBookingData } from "src/entity/predictive-booking-data.entity";
import { LaytripCategory } from "src/entity/laytrip-category.entity";
import { BookingStatus } from "src/enum/booking-status.enum";
import { ModulesName } from "src/enum/module.enum";
import { BookingType } from "src/enum/booking-type.enum";
import { PaymentStatus } from "src/enum/payment-status.enum";
import { ValuationPercentageUtility } from "./valuation-per.utility";

export class NotificationAlertUtility {
    static async notificationModelCreater(id) {
        const where = `"booking"."laytrip_booking_id" = '${id}'`;
        const bookingData = await getConnection()
            .createQueryBuilder(Booking, "booking")
            .leftJoinAndSelect("booking.cart", "cart")
            .leftJoinAndSelect("booking.bookingInstalments", "instalments")
            .leftJoinAndSelect("booking.currency2", "currency")
            .leftJoinAndSelect("booking.user", "User")
            .where(where)
            .getOne();

        if (!bookingData) {
            return;
        }

        if (bookingData.bookingInstalments.length > 0) {
            bookingData.bookingInstalments.sort((a, b) => a.id - b.id);
        }

        var param = new EmailNotificationModel();

        const user = bookingData.user;
        const moduleInfo = bookingData.moduleInfo[0];

        param.flightRoute =
            moduleInfo.departure_code + "-" + moduleInfo.arrival_code;


        param.depatureDate = DateTime.convertDateFormat(
            bookingData.checkInDate,
            "YYYY-MM-DD",
            "MMMM DD, YYYY"
        );
        param.remainDays = moment(moment(bookingData.checkInDate)).diff(
            new Date(),
            "days"
        );

        let category: LaytripCategory;

        if (bookingData?.categoryName) {
            category = await getConnection()
                .createQueryBuilder(LaytripCategory, "category")
                .where(`name = '${bookingData?.categoryName}'`)
                .getOne();
        } else {
            let routeDetails: any = await RouteCategory.flightRouteAvailability(
                moduleInfo.departure_code,
                moduleInfo.arrival_code
            );
            category = routeDetails?.category
        }

        console.log('category', category)

        param.routeType = category?.name || 'N/A';

        console.log(category);
        if (category) {
            let deadLine = new Date(bookingData.checkInDate);
            console.log("deadLine", deadLine);


            let categoryDays = 30

            switch (category?.name) {
                case "Gold":
                    categoryDays = 30
                    break;
                case "Silver":
                    categoryDays = 60
                    break;
                case "Bronze":
                    categoryDays = 90
                    break;

                default:
                    categoryDays = 30
                    break;
            }
            //console.log("categoryDays", categoryDays);

            deadLine.setDate(deadLine.getDate() - categoryDays);
            console.log("deadLine1", deadLine);

            var deadLineDate = deadLine.toISOString();
            deadLineDate = deadLineDate
                .replace(/T/, " ") // replace T with a space
                .replace(/\..+/, "");
            console.log("deadLineDate1", deadLineDate);

            deadLineDate = deadLineDate.split(" ")[0];
            console.log(deadLineDate);
            param.reservationDeadline = DateTime.convertDateFormat(
                deadLineDate,
                "YYYY-MM-DD",
                "MMMM DD, YYYY"
            );
        }

        param.sellingPrice = `${Generic.formatPriceDecimal(
            parseFloat(bookingData.totalAmount)
        )}`;
        param.netRate = `${Generic.formatPriceDecimal(
            parseFloat(bookingData.netRate)
        )}`;

        const date = new Date();
        var todayDate = date.toISOString();
        todayDate = todayDate
            .replace(/T/, " ") // replace T with a space
            .replace(/\..+/, "");

        let query = getConnection()
            .createQueryBuilder(PredictiveBookingData, "predictiveBookingData")
            .where(
                `date(predictiveBookingData.created_date) = '${todayDate.split(" ")[0]
                }' AND predictiveBookingData.is_resedule = false AND predictiveBookingData.booking_id = '${bookingData.id
                }' `
            );

        const predictiveData = await query.getOne();

        console.log("predictiveData", predictiveData);
        console.log('1')
        param.todayNetPrice =
            `${Generic.formatPriceDecimal(predictiveData?.netPrice || 0)}` || '0';

        // let paidAmount = 0;
        // let remainAmount = 0;

        // for await (const installment of bookingData.bookingInstalments) {
        //     if (installment.paymentStatus == PaymentStatus.CONFIRM) {
        //         paidAmount += parseFloat(installment.amount);
        //     } else {
        //         remainAmount += parseFloat(installment.amount);
        //     }
        // }
        //param.totalRecivedFromCustomer =Generic.formatPriceDecimal(paidAmount) ;
        // param.totalRecivedFromCustomerPercentage =
        //     Generic.formatPriceDecimal((paidAmount * 100) /
        //     parseFloat(bookingData.totalAmount));

        if (predictiveData?.lastPrice) {
            param.todayNetpriceVarient = Generic.formatPriceDecimal(
                ((predictiveData?.netPrice - predictiveData?.lastPrice) * 100) /
                predictiveData?.lastPrice
            );
        } else {
            param.todayNetpriceVarient = 0
        }

        console.log(param.todayNetpriceVarient);

        param.laytripBookingId = bookingData.laytripBookingId;
        param.currencySymbol = bookingData.currency2.symbol;
        param.lastPrice = predictiveData?.lastPrice || 0;
        console.log('call for valuation per');

        const valuations = await ValuationPercentageUtility.calculations(
            bookingData.cart.laytripCartId
        );
        param.totalRecivedFromCustomerPercentage = Generic.formatPriceDecimal(
            valuations[bookingData.laytripBookingId] || 0
        );

        console.log("booking id", bookingData.laytripBookingId);
        console.log("valuation", valuations);
        if (
            valuations &&
            typeof valuations["amount"] != "undefined" &&
            typeof valuations["amount"][bookingData.laytripBookingId] !=
            "undefined"
        ) {
            param.totalRecivedFromCustomer = Generic.formatPriceDecimal(
                valuations["amount"][bookingData.laytripBookingId] || 0
            );
        } else {
            param.totalRecivedFromCustomer = 0;
        }

        return { param, email: bookingData.user.email, deadLineDate };
    }
}
