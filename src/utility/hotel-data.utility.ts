import { NotFoundException } from "@nestjs/common";
import { FlightBookingEmailParameterModel } from "src/config/email_template/model/flight-booking-email-parameter.model";
import { Booking } from "src/entity/booking.entity";
import { BookingStatus } from "src/enum/booking-status.enum";
import { BookingType } from "src/enum/booking-type.enum";
import { getConnection } from "typeorm";
import { CartDataUtility } from "./cart-data.utility";
import { DateTime } from "./datetime.utility";
import { Generic } from "./generic.utility";
import * as moment from "moment";
import { HotelBookingEmailParameterModel } from "src/config/email_template/model/hotel-booking-email.model";

export class HotelDataUtility {
    static async hotelData(bookingId) {
        const where = `"booking"."laytrip_booking_id" = '${bookingId}'`;
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
            throw new NotFoundException(
                `No booking found&&&id&&&No booking found`
            );
        }

        if (bookingData.bookingInstalments.length > 0) {
            bookingData.bookingInstalments.sort((a, b) => a.id - b.id);
        }

        if (
            bookingData.bookingStatus == BookingStatus.CONFIRM ||
            bookingData.bookingStatus == BookingStatus.PENDING
        ) {
            var param = new HotelBookingEmailParameterModel();
            const user = bookingData.user;
            const moduleInfo = bookingData.moduleInfo[0];
            const travelers = bookingData.travelers;
            let hotelData: {
                hotelName: string;
                checkIn: string;
                room: number;
                adult: number;
                child: number;
            };

            hotelData.hotelName = moduleInfo?.hotel_name || "";
            hotelData.checkIn = moduleInfo?.input_data?.check_in;
            hotelData.room = parseInt(moduleInfo?.input_data?.num_rooms || 0);
            hotelData.adult = parseInt(moduleInfo?.input_data?.num_adults || 0);
            hotelData.child = parseInt(
                moduleInfo?.input_data?.num_children || 0
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
            for await (const traveler of travelers) {
                // var today = new Date();
                // var birthDate = new Date(traveler.travelerInfo.dob);
                // var age = moment(new Date()).diff(moment(birthDate), "years");

                // var user_type = "";
                // if (age < 2) {
                //     user_type = "Infant";
                // } else if (age < 12) {
                //     user_type = "Child";
                // } else {
                //     user_type = "Adult";
                // }
                travelerInfo.push({
                    name: traveler.travelerInfo.firstName,
                    email: user.email,
                    type: traveler.travelerInfo.user_type,
                });
            }
            const cartData = await CartDataUtility.cartData(bookingData.cartId);
            param.user_name = `${user.firstName}`;
            param.hotelData = hotelData;
            param.orderId = bookingData.laytripBookingId;
            param.traveler = travelerInfo;
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

            return { param, userMail: user.email };
        }
    }
}
