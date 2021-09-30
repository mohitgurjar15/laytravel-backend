import { Booking } from "src/entity/booking.entity";
import { CartBooking } from "src/entity/cart-booking.entity";
import { BookingStatus } from "src/enum/booking-status.enum";
import { BookingType } from "src/enum/booking-type.enum";
import { ModulesName } from "src/enum/module.enum";
import { PaymentStatus } from "src/enum/payment-status.enum";
import { HotelDetails } from "src/vacation-rental/model/room_details.model";
import { getConnection } from "typeorm";

export class ValuationPercentageUtility {
    static async calculations(cart_id) {
        console.log("cart_id", cart_id);
        
        const query = getConnection()
            .createQueryBuilder(CartBooking, "cartBooking")
            .leftJoinAndSelect("cartBooking.bookings", "booking")
            .leftJoinAndSelect("booking.bookingInstalments", "instalments")
            .leftJoinAndSelect("booking.currency2", "currency")
            .where(
                `"cartBooking"."laytrip_cart_id" =  '${cart_id}'`
            );

        const cart = await query.getOne();

        const responce = {};
        const amount = {};
        if (!cart?.bookings?.length) {
            return responce;
        } else if(cart?.bookings[0].bookingType == BookingType.NOINSTALMENT){
            for await (const booking of cart.bookings){
                if(booking.paymentStatus == PaymentStatus.CONFIRM){
                    responce[booking.laytripBookingId] = 100;
                    amount[booking.laytripBookingId] = parseFloat(
                        booking.totalAmount
                    );
                }else{
                    responce[booking.laytripBookingId] = 0
                    amount[booking.laytripBookingId] = 0
                }
            }
        }
        else {
            let flights: Booking[] = [];
            let hotels: Booking[] = [];

            console.log("flights", flights);
            console.log("hotels", hotels);
            let paidAmount = 0;
            let totalAmount = 0;
            for await (const booking of cart.bookings) {
                if (booking.moduleId == ModulesName.FLIGHT) {
                    flights.push(booking);
                }
                if (booking.moduleId == ModulesName.HOTEL) {
                    hotels.push(booking);
                }
                if (booking.bookingInstalments.length > 0) {
                    booking.bookingInstalments.sort((a, b) => a.id - b.id);
                }
                for await (const installment of booking.bookingInstalments) {
                    if (installment.instalmentStatus == PaymentStatus.CONFIRM) {
                        paidAmount += parseFloat(installment.amount);
                    }
                }
                totalAmount += parseFloat(booking.totalAmount);
            }

            const avgValuation = (paidAmount * 100) / totalAmount;


            if (flights.length > 0 && hotels.length == 0) {
                console.log("all flight case");
                for await (const flight of flights) {
                    responce[flight.laytripBookingId] = avgValuation;
                    amount[flight.laytripBookingId] = paidAmount;
                }
            } else if (flights.length == 0 && hotels.length > 0) {
                console.log("all hotel case");
                for await (const hotel of hotels) {
                    responce[hotel.laytripBookingId] = avgValuation;
                    amount[hotel.laytripBookingId] = paidAmount;
                }
            } else if (flights.length > 0 && hotels.length > 0) {
                console.log("all priority case case");
                var eachFlightAmount = paidAmount / flights.length;
                var remainAmount = 0;
                var eachFlightRemainAmount = 0;

                flights.sort(
                    (a, b) =>
                        parseFloat(a.totalAmount) - parseFloat(b.totalAmount)
                );
                for (let index = 0; index < flights.length; index++) {
                    const flight = flights[index];
                    let flightTotal = parseFloat(flight.totalAmount);
                    if (eachFlightAmount > flightTotal) {
                        remainAmount += eachFlightAmount - flightTotal;
                        eachFlightRemainAmount =
                            remainAmount / (flightTotal - (index + 1));
                        responce[flight.laytripBookingId] = 100;
                        amount[flight.laytripBookingId] = parseFloat(
                            flight.totalAmount
                        );
                        console.log(
                            "case1",
                            "eachFlightAmount > flightTotal",
                            "remainAmount:",
                            remainAmount,
                            "eachFlightRemainAmount",
                            eachFlightRemainAmount
                        );
                    } else if (
                        eachFlightAmount + eachFlightRemainAmount >
                        flightTotal
                    ) {
                        remainAmount +=
                            eachFlightAmount +
                            eachFlightRemainAmount -
                            flightTotal;
                        eachFlightRemainAmount =
                            remainAmount / (flightTotal - (index + 1));
                        responce[flight.laytripBookingId] = 100;
                        amount[flight.laytripBookingId] = parseFloat(
                            flight.totalAmount
                        );
                        console.log(
                            "case2",
                            `(eachFlightAmount + eachFlightRemainAmount) >
                        flightTotal`,
                            "remainAmount:",
                            remainAmount,
                            "eachFlightRemainAmount",
                            eachFlightRemainAmount
                        );
                    } else if (
                        eachFlightAmount + eachFlightRemainAmount <
                        flightTotal
                    ) {
                        console.log(
                            "case3",
                            `(eachFlightAmount + eachFlightRemainAmount) >
                        flightTotal`,
                            "remainAmount:",
                            remainAmount,
                            "eachFlightRemainAmount",
                            eachFlightRemainAmount
                        );
                        responce[flight.laytripBookingId] =
                            ((eachFlightAmount + eachFlightRemainAmount) /
                                flightTotal) *
                            100;
                        remainAmount = remainAmount - eachFlightRemainAmount;
                        amount[flight.laytripBookingId] =
                            eachFlightAmount + eachFlightRemainAmount;
                    }
                }
                console.log("remainAmount:", remainAmount);
                if (remainAmount > 0) {
                    var eachHotelAmount = remainAmount / hotels.length;
                    var remainHotelAmount = 0;
                    var eachHotelRemainAmount = 0;
                    hotels.sort(
                        (a, b) =>
                            parseFloat(a.totalAmount) -
                            parseFloat(b.totalAmount)
                    );

                    for (let index = 0; index < hotels.length; index++) {
                        const hotel = hotels[index];
                        let flightTotal = parseFloat(hotel.totalAmount);
                        if (eachHotelAmount > flightTotal) {
                            remainHotelAmount += eachHotelAmount - flightTotal;
                            eachHotelRemainAmount =
                                remainHotelAmount / (flightTotal - (index + 1));
                            responce[hotel.laytripBookingId] = 100;
                            console.log(
                                "case4",
                                `(eachFlightAmount + eachFlightRemainAmount) >
                        flightTotal`,
                                "remainAmount:",
                                remainHotelAmount,
                                "eachFlightRemainAmount",
                                eachHotelRemainAmount
                            );
                            amount[hotel.laytripBookingId] = parseFloat(
                                hotel.totalAmount
                            );
                        } else if (
                            eachHotelAmount + eachHotelRemainAmount >
                            flightTotal
                        ) {
                            remainHotelAmount +=
                                eachHotelAmount +
                                eachHotelRemainAmount -
                                flightTotal;
                            eachHotelRemainAmount =
                                remainHotelAmount / (flightTotal - (index + 1));
                            responce[hotel.laytripBookingId] = 100;
                            console.log(
                                "case5",
                                `(eachFlightAmount + eachFlightRemainAmount) >
                        flightTotal`,
                                "remainAmount:",
                                remainHotelAmount,
                                "eachFlightRemainAmount",
                                eachHotelRemainAmount
                            );
                            amount[hotel.laytripBookingId] = parseFloat(
                                hotel.totalAmount
                            );
                        } else if (
                            eachHotelAmount + eachHotelRemainAmount <
                            flightTotal
                        ) {
                            responce[hotel.laytripBookingId] =
                                ((eachHotelAmount + eachHotelRemainAmount) /
                                    flightTotal) *
                                100;
                            remainHotelAmount =
                                remainHotelAmount - eachHotelRemainAmount;
                            amount[hotel.laytripBookingId] =
                                eachHotelAmount + eachHotelRemainAmount;
                            console.log(
                                "case6",
                                `(eachFlightAmount + eachFlightRemainAmount) >
                        flightTotal`,
                                "remainAmount:",
                                remainHotelAmount,
                                "eachFlightRemainAmount",
                                eachHotelRemainAmount
                            );
                        }
                    }
                }
            }
        }
        responce['amount'] = amount
        console.log("responce", responce);
        
        return responce;
    }
}
