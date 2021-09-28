import { CartBookingEmailParameterModel } from "src/config/email_template/model/cart-booking-email.model";
import { CartBooking } from "src/entity/cart-booking.entity";
import { PaymentStatus } from "src/enum/payment-status.enum";
import { getConnection } from "typeorm";
import { Generic } from "./generic.utility";
import * as moment from "moment";
import { User } from "src/entity/user.entity";
import { BookingStatus } from "src/enum/booking-status.enum";
import { ModulesName } from "src/enum/module.enum";
import { BookingType } from "src/enum/booking-type.enum";

export class CartDataUtility {
    static async cartData(cart_id) {
        const query = getConnection()
            .createQueryBuilder(CartBooking, "cartBooking")
            .leftJoinAndSelect("cartBooking.bookings", "booking")
            .leftJoinAndSelect("booking.bookingInstalments", "instalments")
            .leftJoinAndSelect("booking.currency2", "currency")
            .where(
                `"cartBooking"."id" =  '${cart_id}' AND "booking"."booking_status" IN (${BookingStatus.CONFIRM},${BookingStatus.PENDING})`
            );

        const cart = await query.getOne();
        if (!cart) {
            return {
                paidAmount: "",
                remainAmount: "",
                pandinginstallment: "",
                totalAmount: "",
            };
        }
        let paidAmount = 0;
        let remainAmount = 0;
        let pandinginstallment = 0;
        let totalAmount = 0;
        const currency = cart.bookings[0].currency2;
        const baseBooking = cart.bookings[0].bookingInstalments;
        let cartInstallments = [];
        if (baseBooking.length) {
            for await (const baseInstallments of baseBooking) {
                let amount = parseFloat(baseInstallments.amount);

                if (cart.bookings.length > 1) {
                    for (let index = 1; index < cart.bookings.length; index++) {
                        for await (const installment of cart.bookings[index]
                            .bookingInstalments) {
                            if (
                                baseInstallments.instalmentDate ==
                                installment.instalmentDate
                            ) {
                                amount += parseFloat(installment.amount);
                            }
                        }
                    }
                } else {
                    amount = parseFloat(baseInstallments.amount);
                }
                const installment = {
                    instalmentDate: baseInstallments.instalmentDate,
                    instalmentStatus: baseInstallments.instalmentStatus,
                    attempt: baseInstallments.attempt,
                    amount: Generic.formatPriceDecimal(amount),
                };
                cartInstallments.push(installment);
            }
        }

        for await (const booking of cart.bookings) {
            if (booking.bookingInstalments.length > 0) {
                booking.bookingInstalments.sort((a, b) => a.id - b.id);
            }



            for await (const installment of booking.bookingInstalments) {
                if (installment.paymentStatus == PaymentStatus.CONFIRM) {
                    paidAmount += parseFloat(installment.amount);
                } else {
                    remainAmount += parseFloat(installment.amount);
                    pandinginstallment = pandinginstallment + 1;
                }
            }
            totalAmount += parseFloat(booking.totalAmount);
        }

        return {
            paidAmount:
                currency.symbol +
                `${(await Generic.formatPriceDecimal(paidAmount)) || 0}`,
            remainAmount:
                currency.symbol +
                `${(await Generic.formatPriceDecimal(remainAmount)) || 0}`,
            pandinginstallment: pandinginstallment || 0,
            totalAmount:
                currency.symbol +
                `${(await Generic.formatPriceDecimal(totalAmount)) || 0}`,
            paidAmountNumeric: paidAmount || 0,
            remainAmountNumeric: remainAmount || 0,
            totalAmounNumerict: totalAmount || 0,
        };
    }

    static async CartMailModelDataGenerate(cart_id) {
        const where = `("cartBooking"."laytrip_cart_id" =  '${cart_id}' AND "booking"."booking_status" IN (${BookingStatus.CONFIRM},${BookingStatus.PENDING}))`;
        const query = getConnection()
            .createQueryBuilder(CartBooking, "cartBooking")
            .leftJoinAndSelect("cartBooking.bookings", "booking")
            .leftJoinAndSelect("booking.bookingInstalments", "instalments")
            .leftJoinAndSelect("booking.currency2", "currency")
            .leftJoinAndSelect("booking.module", "module")
            .leftJoinAndSelect("cartBooking.referral", "referral")
            .leftJoinAndSelect("booking.travelers", "traveler")
            //.leftJoinAndSelect("traveler.userData", "userData")
            // .leftJoinAndSelect("User.state", "state")
            // .leftJoinAndSelect("User.country", "countries")

            .where(where)
            .orderBy(`cartBooking.bookingDate`, "DESC");
        const cart = await query.getOne();

        if (cart?.bookings?.length) {
            let confirmed = true
            const user = await this.userData(cart.userId);
            let param = new CartBookingEmailParameterModel();
            param.user_name = user.firstName ? user.firstName : "";
            let paidAmount = 0;
            let remainAmount = 0;
            let pandinginstallment = 0;
            let totalAmount = 0;
            const currency = cart.bookings[0].currency2;
            const baseBooking = cart.bookings[0].bookingInstalments;
            const installmentType =
                cart.bookings[0]?.bookingInstalments[0]?.instalmentType;
            let cartInstallments = [];
            let bookingsData = [];
            //console.log('1');
            let allItemResult=[]
            for(let cartItem of cart.bookings){
                if(cartItem.bookingInstalments.length){
                    allItemResult = [...allItemResult,...cartItem.bookingInstalments];
                }
            }
            //let priceSummary=[];
            let paymentStatus = [];
                paymentStatus[0] = "Due";
                paymentStatus[1] = "Paid";
                paymentStatus[2] = "FAILED";
                paymentStatus[3] = "CANCELLED";
                paymentStatus[4] = "REFUNDED";
            for(let i=0; i < allItemResult.length; i++){
                
                let find= await cartInstallments.findIndex(price=>price.date==allItemResult[i].instalmentDate);
                
                if(find!=-1){
                    cartInstallments[find].amount+=Generic.formatPriceDecimal(allItemResult[i].amount)
                }
                else{
                    cartInstallments.push({
                        date : allItemResult[i].instalmentDate,
                        amount : Generic.formatPriceDecimal(allItemResult[i].amount),
                        status : paymentStatus[allItemResult[i].instalmentStatus]
                    })
                }
            }

            let travelers = [];
            let travelersName = [];
            for await (const booking of cart.bookings) {
                if (booking.bookingInstalments.length > 0) {
                    booking.bookingInstalments.sort((a, b) => a.id - b.id);
                }
                
                if(booking.bookingType==2){
                    paidAmount+=parseFloat(booking.totalAmount)
                }


                //console.log('22');
                totalAmount += parseFloat(booking.totalAmount);
                let flightData = [];
                const bookingData = booking;

                const moduleInfo = booking.moduleInfo[0];
                let hotelData: {
                    hotelName: string,
                    checkIn: string,
                    checkOut: string,
                    room: number,
                    adult: number,
                    child: number,
                } = {
                    hotelName: "",
                    checkIn: "",
                    checkOut:"",
                    room: 0,
                    adult: 0,
                    child: 0,
                }
                if (!booking.supplierId) {
                    confirmed = false
                }
                if (booking.moduleId == ModulesName.FLIGHT) {


                    const routes = moduleInfo.routes;
                    //console.log('23');
                    for (let index = 0; index < routes.length; index++) {
                        const element = routes[index];
                        var rout =
                            index == 0
                                ? `${moduleInfo.departure_info.city} To ${moduleInfo.arrival_info.city} (${moduleInfo.routes[0].type})`
                                : `${moduleInfo.arrival_info.city} To ${moduleInfo.departure_info.city} (${moduleInfo.routes[1].type})`;
                        var status =
                            bookingData.bookingStatus == 0
                                ? "Pending"
                                : "Confirm";
                        var droups = [];
                        //console.log('24');
                        for await (const stop of element.stops) {
                            var flight = `${stop.airline}${stop.flight_number}`;
                            var depature = {
                                code: stop.departure_info.code,
                                name: stop.departure_info.name,
                                city: stop.departure_info.city,
                                country: stop.departure_info.country,
                                date: await this.formatDate(
                                    stop.departure_date_time
                                ),
                                time: await this.formatTime(stop.departure_time),
                            };
                            if (stop?.pnr_no) {
                                depature["pnr_no"] = stop?.pnr_no || "";
                            }
                            //console.log('25');
                            var arrival = {
                                code: stop.arrival_info.code,
                                name: stop.arrival_info.name,
                                city: stop.arrival_info.city,
                                country: stop.arrival_info.country,
                                date: await this.formatDate(
                                    stop.arrival_date_time
                                ),
                                time: await this.formatTime(stop.arrival_time),
                            };

                            //console.log('26');
                            droups.push({
                                flight: flight,
                                depature: depature,
                                arrival: arrival,
                                airline: stop.airline_name,
                            });
                        }
                        //console.log('27');
                        ////console.log();
                        flightData.push({
                            rout: rout,
                            status: status,
                            droups: droups,
                        });
                    }
                } else if (booking.moduleId == ModulesName.HOTEL) {
                    hotelData.hotelName = moduleInfo?.hotel_name || "";
                    hotelData.checkIn = moduleInfo?.input_data?.check_in;
                    hotelData.checkOut = moduleInfo?.input_data?.check_out;
                    hotelData.room = parseInt(moduleInfo?.input_data?.num_rooms || 0);
                    hotelData.adult = parseInt(
                        moduleInfo?.input_data?.num_adults || 0
                    );
                    hotelData.child = parseInt(moduleInfo?.input_data?.num_children || 0);
                }

                //console.log('8');
                for await (const traveler of booking.travelers) {
                    
                    if (
                        !travelersName.includes(traveler.travelerInfo.firstName)
                    ) {
                        travelers.push({
                            name: traveler.travelerInfo.firstName,
                            email: user.email,
                            type: traveler.travelerInfo.user_type,
                        });
                        travelersName.push(traveler.travelerInfo.firstName);
                    }
                }
                let b = {
                    moduleId: booking.moduleId,
                    productId: booking.laytripBookingId,
                    flighData: flightData,
                    hotelData: hotelData,
                };
                bookingsData.push(b);
            }

            if (cartInstallments.length > 0) {
                cartInstallments.sort((a, b) => {
                    var c = new Date(a.date);
                    var d = new Date(b.date);
                    return c > d ? 1 : -1;
                });
                // paidAmount += parseFloat(cartInstallments[0].amount)
            }
            //let amount = 0
            for await (const iterator of cartInstallments) {
                if(iterator.status == 'Paid'){
                    paidAmount = paidAmount + parseFloat(iterator.amount)
                }
            }
            //paidAmount = amount;
            remainAmount = totalAmount-paidAmount;
            
            param.orderId = cart.laytripCartId;
            param.bookingType = cart.bookingType;
            param.travelers = travelers;
            param.cart = {
                totalAmount:
                    currency.symbol +
                    `${totalAmount.toFixed(2)}`,
                totalPaid:
                    currency.symbol +
                    `${paidAmount.toFixed(2)}`,
                rememberAmount:
                    currency.symbol +
                    `${Generic.formatPriceDecimal(remainAmount)}`,
                totalAmountInNumeric: Generic.formatPriceDecimal(totalAmount),
                totalPaidInnumeric: Generic.formatPriceDecimal(paidAmount)
            };
            param.paymentDetail = cartInstallments;
            param.bookings = bookingsData;
            return { param, email: user.email, confirmed, referralId: cart?.referral?.name, currency };
        } else {
            return;
        }
    }

    static async formatDate(date) {
        var d = new Date(date),
            month = "" + (d.getMonth() + 1),
            day = "" + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = "0" + month;
        if (day.length < 2) day = "0" + day;

        return [month, day, year].join("/");
    }

    static async userData(userId) {
        const user = await getConnection()
            .createQueryBuilder(User, "user")
            .where(`user_id = '${userId}'`)
            .getOne();
        return user;
    }
    static async formatTime(time: string) {
        const splitTime = time.split(":");
        const ma = splitTime[1].split(" ");
        const h = parseInt(splitTime[0])
        let mB: any = parseInt(ma[0])
        const m = mB > 0 ? mB : ''
        const j = ma[1]
        return `${h}${m}${j}`;
    }


    static async CartFailedMailModelDataGenerate(cart_id) {
        const where = `("cartBooking"."laytrip_cart_id" =  '${cart_id}' AND "booking"."booking_status" Not IN (${BookingStatus.CONFIRM},${BookingStatus.PENDING}))`;
        const query = getConnection()
            .createQueryBuilder(CartBooking, "cartBooking")
            .leftJoinAndSelect("cartBooking.bookings", "booking")
            .leftJoinAndSelect("booking.bookingInstalments", "instalments")
            .leftJoinAndSelect("booking.currency2", "currency")
            // .leftJoinAndSelect("booking.module", "module")
            // .leftJoinAndSelect("cartBooking.referral", "referral")
            // .leftJoinAndSelect("booking.travelers", "traveler")
            //.leftJoinAndSelect("traveler.userData", "userData")
            // .leftJoinAndSelect("User.state", "state")
            // .leftJoinAndSelect("User.country", "countries")

            .where(where)
            .orderBy(`cartBooking.bookingDate`, "DESC");
        const cart = await query.getOne();

        if (cart?.bookings?.length) {
            let failedBooking = []
            for await (const booking of cart.bookings) {
                let amount = 0
                // if (booking.bookingType == BookingType.INSTALMENT) {
                //     if (booking.bookingInstalments.length > 0) {
                //         booking.bookingInstalments.sort((a, b) => a.id - b.id);
                //     }
                //     amount = parseFloat(booking.bookingInstalments[0].amount)
                // } else {
                    amount = parseFloat(booking.totalAmount)
                // }

                let name = ``
                if (booking.moduleId == ModulesName.FLIGHT) {
                    name = `${booking.moduleInfo[0].departure_code}-${booking.moduleInfo[0].arrival_code}`
                }

                if (booking.moduleId == ModulesName.HOTEL) {
                    name = booking.moduleInfo[0].hotel_name
                }


                let info: {
                    moduleId: number,
                    name: string,
                    price: string
                } = {
                    moduleId: booking.moduleId,
                    name: name,
                    price: `${booking.currency2.symbol}${amount}`
                }
                failedBooking.push(info)
            }
            return failedBooking
        } else {
            return;
        }
    }
}
