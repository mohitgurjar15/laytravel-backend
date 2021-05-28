import { NotFoundException } from "@nestjs/common";
import { Booking } from "src/entity/booking.entity";
import { getConnection } from "typeorm";
import { CartDataUtility } from "./cart-data.utility";
import { DateTime } from "./datetime.utility";
import { Generic } from "./generic.utility";
import {EmailNotificationModel} from 'src/config/email_template/model/notification.model'

export class NotificationAlertUtility {

    static async notificationModelCreater(id){
        const where = `"booking"."laytrip_booking_id" = '${id}'`;
        const bookingData = await getConnection()
            .createQueryBuilder(Booking, "booking")
            .leftJoinAndSelect("booking.cart", "cart")
            .leftJoinAndSelect("booking.bookingInstalments", "instalments")
            .leftJoinAndSelect("booking.currency2", "currency")
            .leftJoinAndSelect("booking.user", "User")
            .leftJoinAndSelect("booking.travelers", "traveler")
            .leftJoinAndSelect("User.country", "countries")
            .leftJoinAndSelect("User.state", "state")
            .leftJoinAndSelect("booking.supplier", "supplier")
            .where(where)
            .getOne();

        if (!bookingData) {
            return ''
        }

        if (bookingData.bookingInstalments.length > 0) {
            bookingData.bookingInstalments.sort((a, b) => a.id - b.id);
        }

        
            var param = new EmailNotificationModel();
           
            const user = bookingData.user;
            const moduleInfo = bookingData.moduleInfo[0];
           
            
            param.flightRoute = moduleInfo[0].departure_code + '-' + moduleInfo[0].arrival_code
            param.routeType = bookingData.categoryName
            param.depatureDate = bookingData.checkInDate
            param.remainDays = moment(moment(result.data[i].checkInDate)).diff(
                new Date(),
                "days"
            );
    
            
            const d = await CartDataUtility.formatDate(bookingData.bookingDate);
            const installmentDetail = {
                amount:
                    bookingData.currency2.symbol +
                    Generic.formatPriceDecimal(
                        parseFloat(bookingData.totalAmount)
                    ),
                date: DateTime.convertDateFormat(
                    d,
                    "MM/DD/YYYY",
                    "MMMM DD, YYYY"
                ),
                status: bookingData.paymentStatus == 1 ? "Confirm" : "Pending",
            };
            var travelerInfo = [];
            
            const cartData = await CartDataUtility.cartData(bookingData.cartId);
            if (bookingData.bookingType == BookingType.INSTALMENT) {
                param.cart = {
                    cartId: bookingData.cart.laytripCartId,
                    totalAmount: cartData.totalAmount,
                    totalPaid: cartData.paidAmount,
                    rememberAmount: cartData.remainAmount,
                };
            } else {
                param.cart = {
                    cartId: bookingData.cart.laytripCartId,
                    totalAmount: cartData.totalAmount,
                };
            }

            param.bookingType = bookingData.bookingType;

            return { param, sub: EmailSubject, userMail: user.email };
        
    }
}