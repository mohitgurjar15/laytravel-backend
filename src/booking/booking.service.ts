import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
    ConflictException,
    BadRequestException,
    NotAcceptableException,
    UnauthorizedException,
    ForbiddenException,
} from "@nestjs/common";
import { BookingRepository } from "./booking.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { MailerService } from "@nestjs-modules/mailer";
import { FlightBookingEmailParameterModel } from "src/config/email_template/model/flight-booking-email-parameter.model";
import { ModulesName } from "src/enum/module.enum";
import { ListBookingDto } from "./dto/list-booking.dto";
import * as moment from "moment";
import { ListPaymentAdminDto } from "src/booking/dto/list-payment-admin.dto";

import { Booking } from "src/entity/booking.entity";
import { BookingType } from "src/enum/booking-type.enum";
import { exit } from "process";
import { PaymentStatus } from "src/enum/payment-status.enum";
import { getConnection, getManager } from "typeorm";
import { InstalmentStatus } from "src/enum/instalment-status.enum";
import * as config from "config";
const mailConfig = config.get("email");
import { BookingInstalments } from "src/entity/booking-instalments.entity";
import { PredictionFactorMarkup } from "src/entity/prediction-factor-markup.entity";
import { ExportBookingDto } from "./dto/export-booking.dto";
import { ShareBookingDto } from "./dto/share-booking-detail.dto";
import { BookingStatus } from "src/enum/booking-status.enum";
import { User } from "src/entity/user.entity";
import { getBookingDetailsDto } from "./dto/get-booking-detail.dto";
import { Generic } from "src/utility/generic.utility";
import { BookingFilterDto } from "./dto/booking-filter.dto";
import { ExportPaymentAdminDto } from "./dto/export-payment-list.dto";
import { CartBooking } from "src/entity/cart-booking.entity";
import { CryptoUtility } from "src/utility/crypto.utility";
import { UserCard } from "src/entity/user-card.entity";
import { DateTime } from "src/utility/datetime.utility";
import { CartDataUtility } from "src/utility/cart-data.utility";
import { LaytripCartBookingConfirmtionMail } from "src/config/new_email_templete/cart-booking-confirmation.html";
import { DeleteBookingDto } from "./dto/delete-cart.dto";
import { UpdateTravelerInfoDto } from "./dto/update-traveler-info.dto";
import { TravelerInfo } from "src/entity/traveler-info.entity";
import { PaymentService } from "src/payment/payment.service";
import { TravelerInfoModel } from "src/config/email_template/model/traveler-info.model";
import { Activity } from "src/utility/activity.utility";
import { LaytripCancellationTravelProviderMail } from "src/config/new_email_templete/laytrip_cancellation-travel-provider-mail.html";
import { Role } from "src/enum/role.enum";
import { LaytripBookingCancellationCustomerMail } from "src/config/new_email_templete/laytrip_booking-cancellation-customer-mail.html";
import { updateBookingDto } from "./dto/update-booking.dto";
import { FlightService } from "src/flight/flight.service";
import { PredictiveBookingData } from "src/entity/predictive-booking-data.entity";
import { flightDataUtility } from "src/utility/flight-data.utility";
import { LaytripCategory } from "src/entity/laytrip-category.entity";
import { CartChangeAsperUserRequestMail } from "src/config/new_email_templete/cart-changes-as-per-user-req.dto";
import { BookingStatusUtility } from "src/utility/booking-status.utility";
import { IntialCancelBookingDto } from "./dto/intial-cancelation-booking.dto";
import { IntialCancelBooking } from "src/entity/intial-booking.entity";
import { IntialCancelationStatus } from "src/enum/intial-cancelation.enum";
import { LaytripIntialCancelBookingRequestEmail } from "src/config/new_email_templete/intial-booking-cancelation.html";
import { ReverceIntialCancelBookingDto } from "./dto/inrial-cancellation-reverce.dto";
import { NotificationAlertUtility } from "src/utility/notification.utility";
import { BookingCancellationNotificationMail } from "src/config/admin-email-notification-templetes/booking-cancellation-notification.dto";
import { CancellationReason } from "src/enum/cancellation-reason.enum";
import { ValuationPercentageUtility } from "src/utility/valuation-per.utility";
import { K } from "handlebars/runtime";
import { response } from "express";

@Injectable()
export class BookingService {
    constructor(
        @InjectRepository(BookingRepository)
        private bookingRepository: BookingRepository,
        private paymentService: PaymentService,
        public readonly mailerService: MailerService,
        private flightService: FlightService
    ) { }

    async resendCartEmail(bookingDetail: getBookingDetailsDto) {
        const { bookingId } = bookingDetail;
        const responce = await CartDataUtility.CartMailModelDataGenerate(
            bookingId
        );
        console.log('this is my response**********', response)
        // if (responce?.param) {
        //     let subject =
        //         responce.param.bookingType == BookingType.INSTALMENT
        //             ? `Booking ID ${responce.param.orderId} Confirmation`
        //             : `Booking ID ${responce.param.orderId} Confirmation`;
        //     this.mailerService
        //         .sendMail({
        //             to: responce.email,
        //             from: mailConfig.from,
        //             bcc: mailConfig.BCC,
        //             subject: subject,
        //             html: await LaytripCartBookingConfirmtionMail(
        //                 responce.param,
        //                 responce.referralId
        //             ),
        //         })
        //         .then((res) => {
        //             //console.log("res", res);
        //         })
        //         .catch((err) => {
        //             //console.log("err", err);
        //         });
        //     return {
        //         message: `Cart booking email send succeessfully`,
        //     };
        // } else {
        //     return {
        //         message: `Booking ID not found.`,
        //     };
        // }
    }
    async resendBookingEmail(
        bookingDetail: getBookingDetailsDto
    ): Promise<{ message: any }> {
        try {
            const { bookingId } = bookingDetail;
            const bookingData = await this.bookingRepository.bookingDetail(
                bookingId
            );

            if (!bookingData) {
                throw new NotFoundException("Booking ID not found.");
            }
            //console.log(bookingData);
            const Data = bookingData;
            switch (Data.moduleId) {
                case ModulesName.HOTEL:
                    break;

                case ModulesName.FLIGHT:
                    await this.flightBookingEmailSend(Data);
                    break;

                default:
                    break;
            }

            return {
                message: `Booking information send on ragister user email id `,
            };
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:
                        if (
                            error.response.message ==
                            "This user does not exist&&&email&&&This user does not exist"
                        ) {
                            error.response.message = `This traveler does not exist&&&email&&&This traveler not exist`;
                        }
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new NotFoundException(
                `${error.message}&&&id&&&${error.message}`
            );
        }
    }

    async flightBookingEmailSend(bookingData: Booking, email = "") {
        // if (
        //     bookingData.bookingStatus == BookingStatus.CONFIRM ||
        //     bookingData.bookingStatus == BookingStatus.PENDING
        // ) {
        //     var param = new FlightBookingEmailParameterModel();
        //     const user = bookingData.user;
        //     const moduleInfo = bookingData.moduleInfo[0];
        //     const routes = moduleInfo.routes;
        //     const travelers = bookingData.travelers;
        //     let flightData = [];
        //     for (let index = 0; index < routes.length; index++) {
        //         const element = routes[index];
        //         var rout =
        //             index == 0
        //                 ? `${moduleInfo.departure_info.city} To ${moduleInfo.arrival_info.city} (${moduleInfo.routes[0].type})`
        //                 : `${moduleInfo.arrival_info.city} To ${moduleInfo.departure_info.city} (${moduleInfo.routes[1].type})`;
        //         var status =
        //             bookingData.bookingStatus == 0 ? "Pending" : "Confirm";
        //         var droups = [];
        //         for await (const stop of element.stops) {
        //             var flight = `${stop.airline}-${stop.flight_number}`;
        //             var depature = {
        //                 code: stop.departure_info.code,
        //                 name: stop.departure_info.name,
        //                 city: stop.departure_info.city,
        //                 country: stop.departure_info.country,
        //                 date: await this.formatDate(stop.departure_date_time),
        //                 time: stop.departure_time,
        //             };
        //             var arrival = {
        //                 code: stop.arrival_info.code,
        //                 name: stop.arrival_info.name,
        //                 city: stop.arrival_info.city,
        //                 country: stop.arrival_info.country,
        //                 date: await this.formatDate(stop.arrival_date_time),
        //                 time: stop.arrival_time,
        //             };
        //             droups.push({
        //                 flight: flight,
        //                 depature: depature,
        //                 arrival: arrival,
        //                 airline: stop.airline_name,
        //             });
        //         }
        //         //console.log();
        //         flightData.push({
        //             rout: rout,
        //             status: status,
        //             droups: droups,
        //         });
        //     }
        //     var EmailSubject = "";
        //     if (bookingData.bookingType == BookingType.INSTALMENT) {
        //         EmailSubject = "Flight Booking Details";
        //     } else {
        //         EmailSubject = "Flight Booking Confirmation";
        //     }
        //     const d = await this.formatDate(bookingData.bookingDate);
        //     const installmentDetail = {
        //         amount:
        //             bookingData.currency2.symbol +
        //             Generic.formatPriceDecimal(
        //                 parseFloat(bookingData.totalAmount)
        //             ),
        //         date: DateTime.convertDateFormat(
        //             d,
        //             "MM/DD/YYYY",
        //             "MMMM DD, YYYY"
        //         ),
        //         status: bookingData.paymentStatus == 1 ? "Confirm" : "Pending",
        //     };
        //     var travelerInfo = [];
        //     for await (const traveler of travelers) {
        //         // var today = new Date();
        //         // var birthDate = new Date(traveler.travelerInfo.dob);
        //         // var age = moment(new Date()).diff(moment(birthDate), "years");
        //         // var user_type = "";
        //         // if (age < 2) {
        //         //     user_type = "infant";
        //         // } else if (age < 12) {
        //         //     user_type = "child";
        //         // } else {
        //         //     user_type = "adult";
        //         // }
        //         travelerInfo.push({
        //             name:
        //                 traveler.travelerInfo.firstName +
        //                 " " +
        //                 traveler.travelerInfo.lastName,
        //             email: traveler.travelerInfo.email,
        //             type: traveler.travelerInfo.user_type,
        //         });
        //     }
        //     const cartData = await CartDataUtility.cartData(bookingData.cartId);
        //     param.user_name = `${user.firstName}  ${user.lastName}`;
        //     param.flight = flightData;
        //     param.orderId = bookingData.laytripBookingId;
        //     //param.paymentDetail = installmentDetail;
        //     param.traveler = travelerInfo;
        //     if (bookingData.bookingType == BookingType.INSTALMENT) {
        //         param.cart = {
        //             cartId: bookingData.cart.laytripCartId,
        //             totalAmount: cartData.totalAmount,
        //             totalPaid: cartData.paidAmount,
        //             rememberAmount: cartData.remainAmount,
        //         };
        //     } else {
        //         param.cart = {
        //             cartId: bookingData.cart.laytripCartId,
        //             totalAmount: cartData.totalAmount,
        //         };
        //     }
        //     param.bookingType = bookingData.bookingType;
        //     //param.bookingStatus = bookingData.bookingStatus == BookingStatus.CONFIRM ? 'confirmed' : 'pending'
        //     //console.log(param);
        //     // //console.log(param.flightData);
        //     if (email != "") {
        //         this.mailerService
        //             .sendMail({
        //                 to: email,
        //                 cc: user.email,
        //                 from: mailConfig.from,
        //                 bcc: mailConfig.BCC,
        //                 subject: EmailSubject,
        //                 html: await LaytripFlightBookingConfirmtionMail(param),
        //             })
        //             .then((res) => {
        //                 //console.log("res", res);
        //             })
        //             .catch((err) => {
        //                 //console.log("err", err);
        //             });
        //     } else {
        //         this.mailerService
        //             .sendMail({
        //                 to: user.email,
        //                 from: mailConfig.from,
        //                 bcc: mailConfig.BCC,
        //                 subject: EmailSubject,
        //                 html: await LaytripFlightBookingConfirmtionMail(param),
        //             })
        //             .then((res) => {
        //                 //console.log("res", res);
        //             })
        //             .catch((err) => {
        //                 //console.log("err", err);
        //             });
        //     }
        // } else if (bookingData.bookingStatus == BookingStatus.FAILED) {
        //     if (email != "") {
        //         throw new BadRequestException(`Given booking is failed`);
        //     }
        //     var status = "Failed";
        //     this.mailerService
        //         .sendMail({
        //             to: bookingData.user.email,
        //             from: mailConfig.from,
        //             bcc: mailConfig.BCC,
        //             subject: "Flight Booking Failed",
        //             html: BookingFailerMail(
        //                 {
        //                     error: null,
        //                 },
        //                 bookingData.laytripBookingId
        //             ),
        //         })
        //         .then((res) => {
        //             //console.log("res", res);
        //         })
        //         .catch((err) => {
        //             //console.log("err", err);
        //         });
        // } else {
        //     var status = "Canceled";
        //     if (email != "") {
        //         throw new BadRequestException(`Given booking is canceled`);
        //     }
        // }
    }

    async listBooking(listBookingDto: ListBookingDto) {
        try {
            let result = await this.bookingRepository.listBooking(
                listBookingDto
            );

            let paidAmount = 0;
            let remainAmount = 0;

            ////console.log(result);

            for (let i in result.data) {
                if (result.data[i].bookingInstalments.length > 0) {
                    result.data[i].bookingInstalments.sort(
                        (a, b) => a.id - b.id
                    );
                }

                for (let instalment of result.data[i].bookingInstalments) {
                    if (instalment.paymentStatus == PaymentStatus.CONFIRM) {
                        paidAmount += parseFloat(instalment.amount);
                    } else {
                        remainAmount += parseFloat(instalment.amount);
                    }
                }

                result.data[i]["remainAmount"] =
                    result.data[i].bookingType == BookingType.NOINSTALMENT &&
                        result.data[i].paymentStatus == PaymentStatus.CONFIRM
                        ? 0
                        : Generic.formatPriceDecimal(remainAmount);
                result.data[i][
                    "paid_amount_in_percentage"
                ] = Generic.formatPriceDecimal(
                    (parseFloat(result.data[i]["paidAmount"]) * 100) /
                    parseFloat(result.data[i].totalAmount)
                );
                result.data[i]["remain_days"] = moment(
                    moment(result.data[i].checkInDate)
                ).diff(new Date(), "days");
                delete result.data[i].user.updatedDate;
                delete result.data[i].user.salt;
                delete result.data[i].user.password;

                result.data[i][
                    "status"
                ] = await BookingStatusUtility.bookingStatus(
                    result.data[i].bookingStatus,
                    result.data[i].paymentStatus,
                    new Date(result.data[i].checkOutDate),
                    result.data[i].isResedule
                );

                const valuations = await ValuationPercentageUtility.calculations(
                    result.data[i].cart.laytripCartId
                );
                result.data[i][
                    "valuationPercentage"
                ] = Generic.formatPriceDecimal(
                    valuations[result.data[i].laytripBookingId] || 0
                );

                console.log('booking id', result.data[i].laytripBookingId)
                console.log("valuation", valuations);
                if (valuations && typeof valuations['amount'] != "undefined" && typeof valuations['amount'][result.data[i].laytripBookingId] != "undefined") {
                    result.data[i]["paidAmount"] = Generic.formatPriceDecimal(valuations['amount'][result.data[i].laytripBookingId] || 0)
                } else {
                    result.data[i]["paidAmount"] = 0
                }


                // for (let j in result.data[i].travelers) {
                //     if (result.data[i].travelers[j].travelerInfo?.dob) {
                //         var birthDate = new Date(
                //             result.data[i].travelers[j].travelerInfo.dob
                //         );
                //         var age = moment(new Date()).diff(
                //             moment(birthDate),
                //             "years"
                //         );

                //         if (age < 2) {
                //             result.data[i].travelers[j].travelerInfo.user_type =
                //                 "infant";
                //         } else if (age < 12) {
                //             result.data[i].travelers[j].travelerInfo.user_type =
                //                 "child";
                //         } else {
                //             result.data[i].travelers[j].travelerInfo.user_type =
                //                 "adult";
                //         }
                //     }
                // }
            }
            return result;
        } catch (error) {
            if (typeof error.response !== "undefined") {
                //console.log('m');
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new NotFoundException(
                `${error.message}&&&id&&&${error.message}`
            );
        }
    }

    async userBookingList(listBookingDto: ListBookingDto, userId: string) {
        try {
            let result = await this.bookingRepository.listBooking(
                listBookingDto,
                userId
            );

            for (let i in result.data) {
                let paidAmount = 0;
                let remainAmount = 0;
                let pandinginstallment = 0;

                if (result.data[i].bookingInstalments.length > 0) {
                    result.data[i].bookingInstalments.sort(
                        (a, b) => a.id - b.id
                    );

                    //result.data[i].bookingInstalments.reverse()
                }

                for (let instalment of result.data[i].bookingInstalments) {
                    if (instalment.paymentStatus == PaymentStatus.CONFIRM) {
                        paidAmount += parseFloat(instalment.amount);
                    } else {
                        remainAmount += parseFloat(instalment.amount);
                        pandinginstallment = pandinginstallment + 1;
                    }
                }
                result.data[i]["paidAmount"] =
                    result.data[i].bookingType == BookingType.NOINSTALMENT &&
                        result.data[i].paymentStatus == PaymentStatus.CONFIRM
                        ? parseFloat(result.data[i].totalAmount)
                        : paidAmount;
                result.data[i]["remainAmount"] =
                    result.data[i].bookingType == BookingType.NOINSTALMENT &&
                        result.data[i].paymentStatus == PaymentStatus.CONFIRM
                        ? 0
                        : remainAmount;
                result.data[i]["pendingInstallment"] =
                    result.data[i].bookingType == BookingType.NOINSTALMENT &&
                        result.data[i].paymentStatus == PaymentStatus.CONFIRM
                        ? 0
                        : pandinginstallment;
                delete result.data[i].user.updatedDate;
                delete result.data[i].user.salt;
                delete result.data[i].user.password;
                // for (let j in result.data[i].travelers) {
                //     var birthDate = new Date(
                //         result.data[i].travelers[j].travelerInfo.dob
                //     );
                //     var age = moment(new Date()).diff(
                //         moment(birthDate),
                //         "years"
                //     );
                //     if (age < 2) {
                //         result.data[i].travelers[j].travelerInfo.user_type =
                //             "infant";
                //     } else if (age < 12) {
                //         result.data[i].travelers[j].travelerInfo.user_type =
                //             "child";
                //     } else {
                //         result.data[i].travelers[j].travelerInfo.user_type =
                //             "adult";
                //     }
                // }
            }
            return result;
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:
                        if (
                            error.response.message ==
                            "This user does not exist&&&email&&&This user does not exist"
                        ) {
                            error.response.message = `This traveler does not exist&&&email&&&This traveler not exist`;
                        }
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new NotFoundException(
                `${error.message}&&&id&&&${error.message}`
            );
        }
    }

    async currentBooking(bookingFilterDto: BookingFilterDto, user: User) {
        try {
            const {
                start_date,
                end_date,
                booking_id,
                module_id,
                supplier_id,
                booking_through,
                transaction_token,
                search,
            } = bookingFilterDto;

            const date = new Date();
            var todayDate = date.toISOString();
            todayDate = todayDate
                .replace(/T/, " ") // replace T with a space
                .replace(/\..+/, "");
            todayDate = todayDate.split(" ")[0];
            let where;
            where = `("cartBooking"."user_id" = '${user.userId}') AND 
				("booking"."booking_status" IN (${BookingStatus.CONFIRM},${BookingStatus.PENDING})) AND
				(DATE("cartBooking"."check_in_date") >= DATE('${todayDate}'))`;

            if (booking_through) {
                where += `AND ("booking"."booking_through" = '${booking_through}')`;
            }

            if (module_id) {
                where += `AND ("booking"."module_id" = '${module_id}')`;
            }

            if (supplier_id) {
                where += `AND ("booking"."supplier_id" = '${supplier_id}')`;
            }

            if (start_date) {
                where += `AND (DATE("booking".booking_date) >= '${start_date}') `;
            }
            if (end_date) {
                where += `AND (DATE("booking".booking_date) <= '${end_date}') `;
            }
            if (booking_id) {
                where += `AND ("cartBooking"."laytrip_cart_id" =  '${booking_id}')`;
            }
            if (transaction_token) {
                where += `AND ("instalments"."transaction_token" ILIKE '%${transaction_token}%')`;
            }

            if (search) {
                const source = {
                    source_location: search,
                };
                const destination = {
                    destination_location: search,
                };
                where += `AND (("booking"."laytrip_booking_id" ILIKE '%${search}%')
				OR("cartBooking"."laytrip_cart_id" ILIKE '%${search}%')
				)`;
            }
            const query = getConnection()
                .createQueryBuilder(CartBooking, "cartBooking")
                .leftJoinAndSelect("cartBooking.bookings", "booking")
                .leftJoinAndSelect("booking.bookingInstalments", "instalments")
                .leftJoinAndSelect("booking.currency2", "currency")
                //.leftJoinAndSelect("cartBooking.user", "User")
                .leftJoinAndSelect("booking.travelers", "traveler")
                // .leftJoinAndSelect("traveler.userData", "userData")
                // .leftJoinAndSelect("userData.state", "state")
                // .leftJoinAndSelect("userData.country", "countries")

                .where(where)
                .orderBy(`cartBooking.bookingDate`, "DESC");
            const [CartList, count] = await query.getManyAndCount();

            if (!CartList.length) {
                throw new NotFoundException(
                    `No booking found&&&id&&&No booking found`
                );
            }
            let responce = [];
            let i = 0;
            let bookings;


            let totalInstallmentAmount;
            for await (const cart of CartList) {

                let paidAmount = 0;
                let remainAmount = 0;
                let pandinginstallment = 0;
                let downPayment = 0;
                let totalAmount = 0;
                const currency = cart.bookings[0].currency2;
                totalInstallmentAmount = 0;

                let cartInstallments = [];

                for (let i = 0; i < cart.bookings.length; i++) {
                    if (cart.bookings[i].bookingType == BookingType.INSTALMENT) {
                        cart.bookings[i].bookingInstalments = cart.bookings[i].bookingInstalments.sort((a, b) => {
                            var c = a.id;
                            var d = b.id;
                            return c > d ? 1 : -1;
                        });

                        downPayment += parseFloat(cart.bookings[i].bookingInstalments[0].amount)

                        for (let x = 0; x < cart.bookings[i].bookingInstalments.length; x++) {
                            // console.log("-----PAYMENT STATUS------", JSON.stringify(cart.bookings[i].bookingInstalments))
                            if (cart.bookings[i].moduleId == 1) {
                                cart.bookings[i].bookingInstalments[x]['type'] = 'flight';
                                cart.bookings[i].bookingInstalments[x]['name'] = `${cart.bookings[i].moduleInfo[0].departure_code}-${cart.bookings[i].moduleInfo[0].arrival_code}`;
                            }
                            else if (cart.bookings[i].moduleId == 3) {
                                cart.bookings[i].bookingInstalments[x]['type'] = 'hotel';
                                cart.bookings[i].bookingInstalments[x]['name'] = cart.bookings[i].moduleInfo[0].hotel_name;
                            }
                            cart.bookings[i].bookingInstalments[x]['instalmentStatus'] = cart.bookings[i].bookingInstalments[x].instalmentStatus;
                        }
                        cartInstallments = [...cartInstallments, ...cart.bookings[i].bookingInstalments];
                        totalAmount += parseFloat(cart.bookings[i].totalAmount);
                        //totalInstallmentAmount += parseFloat(cart.bookings[i].totalAmount);
                        //priceSummary.shift();
                    }
                    else {
                        downPayment += parseFloat(cart.bookings[i].totalAmount)
                        paidAmount += parseFloat(cart.bookings[i].totalAmount)
                        totalAmount += parseFloat(cart.bookings[i].totalAmount);
                    }
                }
                //console.log("-----------------CART INSTALLMENT------------------", JSON.stringify(cartInstallments))
                let priceSummary = [];
                for (let k = 0; k < cartInstallments.length; k++) {

                    let find = await priceSummary.findIndex(price => price.instalmentDate == cartInstallments[k].instalmentDate);

                    if (find != -1) {
                        priceSummary[find].breakdown.push({
                            type: cartInstallments[k].type,
                            amount: Generic.formatPriceDecimal(cartInstallments[k].amount),
                            name: cartInstallments[k].name
                        })
                        priceSummary[find].amount += Generic.formatPriceDecimal(cartInstallments[k].amount)
                    }
                    else {
                        let breakDown = [{
                            type: cartInstallments[k].type,
                            amount: Generic.formatPriceDecimal(cartInstallments[k].amount),
                            name: cartInstallments[k].name
                        }]
                        priceSummary.push({
                            instalmentStatus: cartInstallments[k].instalmentStatus,
                            instalmentDate: cartInstallments[k].instalmentDate,
                            amount: Generic.formatPriceDecimal(cartInstallments[k].amount),
                            attempt: cartInstallments[k].attempt,
                            instalmentNo: cartInstallments[k].instalmentNo,
                            paymentStatus: cartInstallments[k].paymentStatus,
                            breakdown: breakDown
                        })

                    }
                }

                let nextInstallmentDate = "";
                let currentDate = moment().format("YYYY-MM-DD");
                let isInstallmentOnTrack = false;
                if (priceSummary.length) {

                    priceSummary.sort((a, b) => {
                        var c = new Date(a.instalmentDate);
                        var d = new Date(b.instalmentDate);
                        return c > d ? 1 : -1;
                    });
                    let nextInstallmentIndex = priceSummary.findIndex(price => price.paymentStatus == 0);

                    nextInstallmentDate = priceSummary[nextInstallmentIndex].instalmentDate;

                    let find = priceSummary.find(price => {
                        if (price.paymentStatus != 1 && moment(price.instalmentDate).isBefore(currentDate)) {
                            return true;
                        }
                    })
                    isInstallmentOnTrack = find ? false : true;
                }


                for (let m = 0; m < priceSummary.length; m++) {
                    if (
                        priceSummary[m].paymentStatus ==
                        PaymentStatus.CONFIRM
                    ) {
                        paidAmount += parseFloat(priceSummary[m].amount);
                    } else {
                        remainAmount += parseFloat(priceSummary[m].amount);
                        pandinginstallment = pandinginstallment + 1;
                    }
                    if (m > 0) {
                        totalInstallmentAmount += parseFloat(priceSummary[m].amount)
                    }
                }


                const installmentType = '';



                let cartResponce = {};
                cartResponce["id"] = cart.id;
                const trackReport = await this.paidAmountByUser(
                    cart.bookings[0].id
                );
                cartResponce["is_installation_on_track"] = isInstallmentOnTrack;
                cartResponce["checkInDate"] = cart.checkInDate;
                cartResponce["checkOutDate"] = cart.checkOutDate;
                cartResponce["laytripCartId"] = cart.laytripCartId;
                cartResponce["bookingDate"] = cart.bookingDate;
                cartResponce["booking"] = cart.bookings;
                cartResponce["cartInstallments"] = priceSummary;
                cartResponce["paidAmount"] = Generic.formatPriceDecimal(
                    paidAmount
                );
                cartResponce["remainAmount"] = Generic.formatPriceDecimal(
                    remainAmount
                );
                cartResponce["pendinginstallment"] = pandinginstallment;
                cartResponce["installmentCount"] = cartInstallments.length;
                cartResponce["totalAmount"] = Generic.formatPriceDecimal(
                    totalAmount
                );
                cartResponce["totalDownpayment"] = Generic.formatPriceDecimal(downPayment);
                cartResponce["nextInstallmentDate"] = nextInstallmentDate;
                cartResponce["currency"] = currency;
                cartResponce["totalInstallment"] = Generic.formatPriceDecimal(totalInstallmentAmount);
                if (installmentType) {
                    cartResponce["installmentType"] = installmentType;
                }
                responce.push(cartResponce);
            }

            return {
                data: responce,
                count: count,
            };
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:
                        if (
                            error.response.message ==
                            "This user does not exist&&&email&&&This user does not exist"
                        ) {
                            error.response.message = `This traveler does not exist&&&email&&&This traveler not exist`;
                        }
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new NotFoundException(
                `${error.message}&&&id&&&${error.message}`
            );
        }
    }

    async completeBooking(bookingFilterDto: BookingFilterDto, user: User) {
        try {
            const {
                start_date,
                end_date,
                booking_id,
                module_id,
                supplier_id,
                booking_through,
                transaction_token,
                search,
            } = bookingFilterDto;

            const date = new Date();
            var todayDate = date.toISOString();
            todayDate = todayDate
                .replace(/T/, " ") // replace T with a space
                .replace(/\..+/, "");
            todayDate = todayDate.split(" ")[0];
            let where;
            where = `("cartBooking"."user_id" = '${user.userId}') AND 
				("booking"."booking_status" IN (${BookingStatus.CONFIRM},${BookingStatus.PENDING})) AND
				(DATE("cartBooking"."check_in_date") < DATE('${todayDate}'))`;

            if (booking_through) {
                where += `AND ("booking"."booking_through" = '${booking_through}')`;
            }

            if (module_id) {
                where += `AND ("booking"."module_id" = '${module_id}')`;
            }

            if (supplier_id) {
                where += `AND ("booking"."supplier_id" = '${supplier_id}')`;
            }

            if (start_date) {
                where += `AND (DATE("booking".booking_date) >= '${start_date}') `;
            }
            if (end_date) {
                where += `AND (DATE("booking".booking_date) <= '${end_date}') `;
            }
            if (booking_id) {
                where += `AND ("cartBooking"."laytrip_cart_id" =  '${booking_id}')`;
            }
            if (transaction_token) {
                where += `AND ("instalments"."transaction_token" ILIKE '%${transaction_token}%')`;
            }
            if (search) {
                where += `AND (("booking"."laytrip_booking_id" ILIKE '%${search}%')
				OR("cartBooking"."laytrip_cart_id" ILIKE '%${search}%')
				)`;
            }
            const query = getConnection()
                .createQueryBuilder(CartBooking, "cartBooking")
                .leftJoinAndSelect("cartBooking.bookings", "booking")
                .leftJoinAndSelect("booking.bookingInstalments", "instalments")
                .leftJoinAndSelect("booking.currency2", "currency")
                .leftJoinAndSelect("booking.travelers", "traveler")
                .where(where)
                .orderBy(`cartBooking.bookingDate`, "DESC");
            const CartList = await query.getMany();

            if (!CartList.length) {
                throw new NotFoundException(
                    `No booking found&&&id&&&No booking found`
                );
            }

            let responce = [];
            let totalInstallmentAmount;
            for await (const cart of CartList) {
                const installmentType =
                    cart.bookings[0]?.bookingInstalments[0]?.instalmentType;
                let paidAmount = 0;
                let remainAmount = 0;
                let pandinginstallment = 0;
                let totalAmount = 0;
                const currency = cart.bookings[0].currency2;
                const baseBooking = cart.bookings[0].bookingInstalments;
                let cartInstallments = [];
                totalInstallmentAmount = 0;
                /* if (
                    baseBooking.length &&
                    cart.bookings[0].bookingType == BookingType.INSTALMENT
                ) {
                    for await (const baseInstallments of baseBooking) {
                        let amount = parseFloat(baseInstallments.amount);

                        if (cart.bookings.length > 1) {
                            for (
                                let index = 1;
                                index < cart.bookings.length;
                                index++
                            ) {
                                for await (const installment of cart.bookings[
                                    index
                                ].bookingInstalments) {
                                    if (
                                        baseInstallments.instalmentDate ==
                                        installment.instalmentDate
                                    ) {
                                        amount += parseFloat(
                                            installment.amount
                                        );
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
                        for await (const installment of booking.bookingInstalments) {
                            if (
                                installment.paymentStatus ==
                                PaymentStatus.CONFIRM
                            ) {
                                paidAmount += parseFloat(installment.amount);
                            } else {
                                remainAmount += parseFloat(installment.amount);
                                pandinginstallment = pandinginstallment + 1;
                                totalInstallmentAmount += parseFloat(installment.amount);
                            }
                        }
                    }

                    totalAmount += parseFloat(booking.totalAmount);
                    delete booking.currency2;
                    delete booking.bookingInstalments;
                }

                if (cartInstallments.length > 0) {
                    //cartInstallments.sort((o) => new Date( o.instalmentDate ) );
                    cartInstallments.sort((a, b) => {
                        var c = new Date(a.instalmentDate);
                        var d = new Date(b.instalmentDate);
                        return c > d ? 1 : -1;
                    });
                    //cartInstallments.sort((a, b) => a.instalmentDate - b.instalmentDate)
                } */

                let downPayment = 0;
                for (let i = 0; i < cart.bookings.length; i++) {
                    if (cart.bookings[i].bookingType == BookingType.INSTALMENT) {
                        cart.bookings[i].bookingInstalments = cart.bookings[i].bookingInstalments.sort((a, b) => {
                            var c = a.id;
                            var d = b.id;
                            return c > d ? 1 : -1;
                        });

                        downPayment += parseFloat(cart.bookings[i].bookingInstalments[0].amount)

                        for (let x = 0; x < cart.bookings[i].bookingInstalments.length; x++) {
                            if (cart.bookings[i].moduleId == 1) {
                                cart.bookings[i].bookingInstalments[x]['type'] = 'flight';
                                cart.bookings[i].bookingInstalments[x]['name'] = `${cart.bookings[i].moduleInfo[0].departure_code}-${cart.bookings[i].moduleInfo[0].arrival_code}`;
                            }
                            else if (cart.bookings[i].moduleId == 3) {
                                cart.bookings[i].bookingInstalments[x]['type'] = 'hotel';
                                cart.bookings[i].bookingInstalments[x]['name'] = cart.bookings[i].moduleInfo[0].hotel_name;
                            }
                            cart.bookings[i].bookingInstalments[x]['instalmentStatus'] = cart.bookings[i].bookingInstalments[x].instalmentStatus;
                        }
                        cartInstallments = [...cartInstallments, ...cart.bookings[i].bookingInstalments];
                        totalAmount += parseFloat(cart.bookings[i].totalAmount);
                    }
                    else {
                        downPayment += parseFloat(cart.bookings[i].totalAmount)
                        paidAmount += parseFloat(cart.bookings[i].totalAmount)
                        totalAmount += parseFloat(cart.bookings[i].totalAmount);
                    }
                }
                let priceSummary = [];
                for (let k = 0; k < cartInstallments.length; k++) {

                    let find = await priceSummary.findIndex(price => price.instalmentDate == cartInstallments[k].instalmentDate);

                    if (find != -1) {
                        priceSummary[find].breakdown.push({
                            type: cartInstallments[k].type,
                            amount: Generic.formatPriceDecimal(cartInstallments[k].amount),
                            name: cartInstallments[k].name
                        })
                        priceSummary[find].amount += Generic.formatPriceDecimal(cartInstallments[k].amount)
                    }
                    else {
                        let breakDown = [{
                            type: cartInstallments[k].type,
                            amount: Generic.formatPriceDecimal(cartInstallments[k].amount),
                            name: cartInstallments[k].name
                        }]
                        priceSummary.push({
                            instalmentStatus: cartInstallments[k].instalmentStatus,
                            instalmentDate: cartInstallments[k].instalmentDate,
                            amount: Generic.formatPriceDecimal(cartInstallments[k].amount),
                            attempt: cartInstallments[k].attempt,
                            instalmentNo: cartInstallments[k].instalmentNo,
                            paymentStatus: cartInstallments[k].paymentStatus,
                            breakdown: breakDown
                        })

                    }
                }


                let currentDate = moment().format("YYYY-MM-DD");
                let isInstallmentOnTrack = false;
                if (priceSummary.length) {
                    priceSummary.sort((a, b) => {
                        var c = new Date(a.instalmentDate);
                        var d = new Date(b.instalmentDate);
                        return c > d ? 1 : -1;
                    });
                    let find = priceSummary.find(price => {
                        if (price.paymentStatus != 1 && moment(price.instalmentDate).isBefore(currentDate)) {
                            return true;
                        }
                    })
                    isInstallmentOnTrack = find ? false : true;
                }
                for (let m = 0; m < priceSummary.length; m++) {
                    if (
                        priceSummary[m].paymentStatus ==
                        PaymentStatus.CONFIRM
                    ) {
                        paidAmount += parseFloat(priceSummary[m].amount);
                    } else {
                        remainAmount += parseFloat(priceSummary[m].amount);
                        pandinginstallment = pandinginstallment + 1;
                    }
                    if (m > 0) {
                        totalInstallmentAmount += parseFloat(priceSummary[m].amount)
                    }
                }
                let cartResponce = {};
                cartResponce["id"] = cart.id;
                const trackReport = await this.paidAmountByUser(
                    cart.bookings[0].id
                );
                cartResponce["is_installation_on_track"] =
                    trackReport?.attempt != 1 &&
                        trackReport?.paymentStatus != PaymentStatus.CONFIRM
                        ? false
                        : true;
                cartResponce["checkInDate"] = cart.checkInDate;
                cartResponce["checkOutDate"] = cart.checkOutDate;
                cartResponce["laytripCartId"] = cart.laytripCartId;
                cartResponce["bookingDate"] = cart.bookingDate;
                cartResponce["booking"] = cart.bookings;
                cartResponce["cartInstallments"] = cartInstallments;
                cartResponce["paidAmount"] =
                    Generic.formatPriceDecimal(paidAmount) || 0;
                cartResponce["remainAmount"] =
                    Generic.formatPriceDecimal(remainAmount) || 0;
                cartResponce["pendinginstallment"] = pandinginstallment || 0;
                cartResponce["currency"] = currency;
                cartResponce["totalAmount"] = Generic.formatPriceDecimal(
                    totalAmount
                );
                cartResponce["totalInstallment"] = Generic.formatPriceDecimal(totalInstallmentAmount);
                cartResponce["nextInstallmentDate"] = "";
                cartResponce["totalDownpayment"] = Generic.formatPriceDecimal(downPayment);
                if (installmentType) {
                    cartResponce["installmentType"] = installmentType;
                }
                responce.push(cartResponce);
            }
            return {
                data: responce,
            };
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:
                        if (
                            error.response.message ==
                            "This user does not exist&&&email&&&This user does not exist"
                        ) {
                            error.response.message = `This traveler does not exist&&&email&&&This traveler not exist`;
                        }
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new NotFoundException(
                `${error.message}&&&id&&&${error.message}`
            );
        }
    }

    async getCartBookingDetail(cartId, user: User) {
        try {
            const where = `("cartBooking"."laytrip_cart_id" =  '${cartId}')`;
            const query = getConnection()
                .createQueryBuilder(CartBooking, "cartBooking")
                .leftJoinAndSelect("cartBooking.bookings", "booking")
                .leftJoinAndSelect("booking.bookingInstalments", "instalments")
                .leftJoinAndSelect("booking.currency2", "currency")
                .leftJoinAndSelect("booking.module", "module")
                .leftJoinAndSelect(
                    "booking.cancellationRequest",
                    "cancellationRequest"
                )
                //.leftJoinAndSelect("cartBooking.user", "User")
                .leftJoinAndSelect("booking.travelers", "traveler")
                //.leftJoinAndSelect("traveler.userData", "userData")
                // .leftJoinAndSelect("User.state", "state")
                // .leftJoinAndSelect("User.country", "countries")

                .where(where);
            //.orderBy(`cartBooking.bookingDate`, "DESC");
            const cart = await query.getOne();
            if (!cart) {
                throw new NotFoundException(
                    `Booking ID not found.&&&id&&&Booking ID not found.`
                );
            }
            let paidAmount = 0;
            let remainAmount = 0;
            let pandinginstallment = 0;
            let totalAmount = 0;
            let cartInstallments = [];
            let actualAmount = 0;
            let currency;
            let installmentType;
            //let downPayment=0;
            /* for await (const booking of cart.bookings) {
                
                if(booking.bookingInstalments.length > 0) {
                    // const currency = cart.bookings[i]?.currency2;
                    currency = booking.currency2;
                    let baseBooking = booking.bookingInstalments;
                    installmentType =
                        booking.bookingInstalments[0]?.instalmentType;
                    let bookingIndex = 0 
                    while (booking[bookingIndex] && baseBooking?.length == 0) {
                        bookingIndex++
                        baseBooking = booking[bookingIndex]?.bookingInstalments;
                    }
                    if (
                        baseBooking?.length &&
                        booking.bookingType == BookingType.INSTALMENT
                    ) {
                        for await (const baseInstallments of baseBooking) {
                            let amount = 0;
                            if (
                                booking.bookingStatus <= BookingStatus.CONFIRM
                            ) {
                                amount += parseFloat(baseInstallments.amount);
                            }

                            if (cart.bookings.length > 1) {
                                for (
                                    let index = 1;
                                    index < cart.bookings.length;
                                    index++
                                ) {
                                    if (
                                        cart.bookings[index].bookingStatus <=
                                        BookingStatus.CONFIRM
                                    ) {
                                        for await (const installment of cart.bookings[index].bookingInstalments) {
                                            //console.log("cart.bookings[index].bookingInstalments",JSON.stringify(cart.bookings[index].bookingInstalments))
                                            if (
                                                baseInstallments.instalmentDate ==
                                                installment.instalmentDate
                                            ) {
                                                amount += parseFloat(
                                                    installment.amount
                                                );
                                            }
                                        }
                                    }
                                }
                            }
                            const installment = {
                                instalmentDate: baseInstallments.instalmentDate,
                                instalmentStatus: baseInstallments?.paymentStatus,
                                attempt: baseInstallments.attempt,
                                amount: Generic.formatPriceDecimal(amount),
                            };
                            cartInstallments.push(installment);
                        }
                    }
                    break;
                }
            } */
            console.log("cart.bookings", cart.bookings.length)
            let allItemResult = []
            for await (const booking of cart.bookings) {

                if (booking.bookingStatus != 2 && booking.bookingInstalments.length > 0) {
                    allItemResult = [...allItemResult, ...booking.bookingInstalments]
                }
            }
            //console.log("allItemResult",JSON.stringify(allItemResult))
            for (let i = 0; i < allItemResult.length; i++) {

                let find = cartInstallments.findIndex(price => price.instalmentDate == allItemResult[i].instalmentDate);

                if (find != -1) {
                    cartInstallments[find].amount += Generic.formatPriceDecimal(allItemResult[i].amount)
                }
                else {
                    cartInstallments.push(
                        {
                            instalmentDate: allItemResult[i].instalmentDate,
                            instalmentStatus: allItemResult[i].instalmentStatus,
                            attempt: allItemResult[i].attempt,
                            amount: Generic.formatPriceDecimal(allItemResult[i].amount)
                        }
                    )
                    if (allItemResult[i].instalmentStatus) {
                        paidAmount += parseFloat(allItemResult[i].amount);
                    }
                }
            }


            for await (const booking of cart.bookings) {
                if (booking.bookingInstalments.length > 0) {
                    booking.bookingInstalments.sort((a, b) => a.id - b.id);
                }

                if (booking.bookingStatus <= BookingStatus.CONFIRM) {

                    if (booking.bookingType == 2) {
                        paidAmount += parseFloat(booking.totalAmount)
                    }
                    totalAmount += parseFloat(booking.totalAmount);
                    actualAmount += parseFloat(booking.actualSellingPrice || '0');
                }
                /* if (booking.bookingStatus <= BookingStatus.CONFIRM) {
                    if (booking?.bookingInstalments?.length) {
                        for await (const installment of booking.bookingInstalments) {
                            if (
                                installment.paymentStatus ==
                                PaymentStatus.CONFIRM
                            ) {
                                paidAmount += parseFloat(installment.amount);
                            } else {
                                remainAmount += parseFloat(installment.amount);
                                pandinginstallment = pandinginstallment + 1;
                            }
                        }
                    }

                    totalAmount += parseFloat(booking.totalAmount);
                    actualAmount += parseFloat(booking.actualSellingPrice || '0');
                } */

                delete booking?.currency2;
                delete booking?.bookingInstalments;
                delete booking?.module.liveCredential;
                delete booking?.module.testCredential;
                delete booking?.module.mode;
                delete booking?.module.status;
                // for await (const traveler of booking.travelers) {
                // 	delete traveler.userData.salt
                // 	delete traveler.userData.password
                // 	traveler.userData.dob = traveler.userData.dob || ''
                // }
            }

            if (cartInstallments.length > 0) {
                //cartInstallments.sort((o) => new Date( o.instalmentDate ) );
                cartInstallments.sort((a, b) => {
                    var c = new Date(a.instalmentDate);
                    var d = new Date(b.instalmentDate);
                    return c > d ? 1 : -1;
                });
                //cartInstallments.sort((a, b) => a.instalmentDate - b.instalmentDate)

            }
            console.log("paidAmount", paidAmount, totalAmount, remainAmount)
            remainAmount = totalAmount - paidAmount;
            let cartResponce = {};
            cartResponce["id"] = cart?.id;

            const trackReport = await this.paidAmountByUser(
                cart.bookings[1]?.id
            );
            cartResponce["is_installation_on_track"] =
                trackReport?.attempt != 1 &&
                    trackReport?.paymentStatus != PaymentStatus.CONFIRM
                    ? false
                    : true;
            cartResponce["checkInDate"] = cart.checkInDate;
            cartResponce["checkOutDate"] = cart.checkOutDate;
            cartResponce["laytripCartId"] = cart.laytripCartId;
            cartResponce["bookingDate"] = cart.bookingDate;
            cartResponce["booking"] = cart.bookings;
            cartResponce["cartInstallments"] = cartInstallments;
            cartResponce["paidAmount"] = Generic.formatPriceDecimal(paidAmount);
            cartResponce["remainAmount"] = Generic.formatPriceDecimal(
                remainAmount
            );
            //cartResponce["cancellationRequest"] =
            cartResponce["pandinginstallment"] = pandinginstallment;
            cartResponce["currency"] = currency;
            cartResponce["totalAmount"] = Generic.formatPriceDecimal(
                totalAmount
            );
            cartResponce["actualAmount"] = Generic.formatPriceDecimal(
                actualAmount
            );
            if (cart.bookings[1]?.nextInstalmentDate) {
                cartResponce["nextInstalmentDate"] =
                    cart.bookings[1].nextInstalmentDate;
            }

            cartResponce["cardDetail"] = await this.cardDetail(
                cart.bookings[1]?.cardToken
            );
            if (installmentType) {
                cartResponce["installmentType"] = installmentType;
            }
            return cartResponce;
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new NotFoundException(
                `${error.message}&&&id&&&${error.message}`
            );
        }
    }

    async cardDetail(transactionTotal) {
        const query = await getConnection()
            .createQueryBuilder(UserCard, "cartBooking")
            .where(`"card_token" = '${transactionTotal}'`)
            .getOne();

        return query;
    }
    async getBookingDetail(bookingId: string) {
        try {
            let result = await this.bookingRepository.bookingDetail(bookingId);
            let paidAmount = 0;
            let remainAmount = 0;

            ////console.log(result);
            const cardData = await getConnection()
                .createQueryBuilder(UserCard, "card")
                .select([
                    "card.cardType",
                    "card.cardHolderName",
                    "card.cardDigits",
                    "card.id",
                ])
                .where(
                    `card_token = '${result.cardToken}' AND user_id = '${result.userId}'`
                )
                .getOne();
            let downpaymentPer = 0;
            let downPayment: number = 0;
            if (result.bookingInstalments.length > 0) {
                result.bookingInstalments.sort((a, b) => a.id - b.id);

                //result.bookingInstalments.reverse()
            }
            for await (const install of result.bookingInstalments) {
                if (install.instalmentNo == 1) {
                    downPayment = parseFloat(install.amount);
                }
            }
            if(result.bookingType != 2){
                for (let instalment of result.bookingInstalments) {
                    if (instalment.paymentStatus == PaymentStatus.CONFIRM) {
                        paidAmount += parseFloat(instalment.amount);
                    } else {
                        remainAmount += parseFloat(instalment.amount);
                    }
                }
            }else{
                paidAmount = JSON.parse(result.actualSellingPrice)
            }
            
            console.log('eeeeeeeeeeeeeeeeeee',paidAmount)
            //result["paidAmount"] =
            //    result.bookingType == BookingType.NOINSTALMENT &&
            //    result.paymentStatus == PaymentStatus.CONFIRM
            //        ? parseFloat(result.totalAmount)
            //       : paidAmount;
            result["remainAmount"] =
                result.bookingType == BookingType.NOINSTALMENT &&
                    result.paymentStatus == PaymentStatus.CONFIRM
                    ? 0
                    : remainAmount;
            delete result.user.updatedDate;
            delete result.user.salt;
            delete result.user.password;
            const valuations = await ValuationPercentageUtility.calculations(
                result.cart.laytripCartId
            );
            result["valuationPercentage"] = Generic.formatPriceDecimal(
                valuations[result.laytripBookingId] || 0
            );

            console.log("booking id", result.laytripBookingId);
            console.log("valuation", valuations);

            result["paidAmount"] = paidAmount || 0



            result["status"] = await BookingStatusUtility.bookingStatus(
                result.bookingStatus,
                result.paymentStatus,
                new Date(result.checkOutDate),
                result.isResedule
            );
            const cartData = await CartDataUtility.cartData(result.cartId)
            // console.log('qqqqqqqqqqqqqqqqqqqqqqqqqq',cartData)
            result['cartTotalAmount'] = cartData.totalAmount
            result['cartpaidAmount'] = cartData.paidAmountNumeric

            // for (let j in result.travelers) {
            //     if (result.travelers[j].travelerInfo?.dob) {
            //         var birthDate = new Date(
            //             result.travelers[j].travelerInfo.dob
            //         );
            //         var age = moment(new Date()).diff(
            //             moment(birthDate),
            //             "years"
            //         );

            //         if (age < 2) {
            //             result.travelers[j].travelerInfo.user_type = "infant";
            //         } else if (age < 12) {
            //             result.travelers[j].travelerInfo.user_type = "child";
            //         } else {
            //             result.travelers[j].travelerInfo.user_type = "adult";
            //         }
            //     }
            // }
            let responce: any = result;
            responce["userData"] = cardData;
            if (downPayment) {
                responce["downPayment_percentage"] = (
                    (downPayment * 100) / parseFloat(result.totalAmount)
                );
            }
            return responce;
        } catch (error) {
            if (typeof error.response !== "undefined") {
                //console.log("m");
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new NotFoundException(
                `${error.message}&&&id&&&${error.message}`
            );
        }
    }

    async getPaymentHistory(user, listPaymentDto) {
        let result: any = await this.bookingRepository.getPayments(
            user,
            listPaymentDto
        );
        if (result.total_result == 0) {
            throw new NotFoundException(`No payment history found!`);
        }

        for (let i = 0; i < result.data.length; i++) {
            if (result.data[i].bookingInstalments.length > 0) {
                result.data[i].bookingInstalments.sort((a, b) => a.id - b.id);

                //result.data[i].bookingInstalments.reverse()
            }
            let paidAmount = 0;
            for (let instalment of result.data[i].bookingInstalments) {
                if (instalment.paymentStatus == PaymentStatus.CONFIRM) {
                    paidAmount += parseFloat(instalment.amount);
                }
            }
            var totalAMount = result.data[i].totalAmount;
            let remainAmount = totalAMount - paidAmount;

            result.data[i]["paidAmount"] =
                result.data[i].bookingType == BookingType.NOINSTALMENT &&
                    result.data[i].paymentStatus == PaymentStatus.CONFIRM
                    ? parseFloat(result.data[i].totalAmount)
                    : paidAmount;
            result.data[i]["remainAmount"] =
                result.data[i].bookingType == BookingType.NOINSTALMENT &&
                    result.data[i].paymentStatus == PaymentStatus.CONFIRM
                    ? 0
                    : remainAmount;
        }
        return result;
    }

    async upcomingPaymentForAdmin(listPaymentAdminDto: ListPaymentAdminDto) {
        const {
            limit,
            page_no,
            module_id,
            supplier,
            status,
            start_date,
            end_date,
            instalment_type,
            user_id,
            booking_id,
            search,
            product_id,
            reservationId,
            booking_status,
        } = listPaymentAdminDto;

        let where;
        where = `("booking"."module_id" in (${ModulesName.FLIGHT},${ModulesName.HOTEL})) AND ("BookingInstalments"."payment_status" = ${PaymentStatus.PENDING}) AND "BookingInstalments"."attempt" = 0`;
        if (user_id) {
            where += `AND ("BookingInstalments"."user_id" = '${user_id}')`;
        }
        if (booking_status?.length) {
            if (typeof booking_status != "object") {
                console.log(booking_status);

                let w = await BookingStatusUtility.filterCondition(
                    parseInt(booking_status),
                    "booking"
                );
                console.log(w);

                if (w) {
                    where += `AND (${w})`;
                }
            } else {
                let or = "";
                for await (const s of booking_status) {
                    let w = await BookingStatusUtility.filterCondition(
                        s,
                        "booking"
                    );
                    if (w) {
                        or += `${or == "" ? "" : "or"}(${w})`;
                    }
                }
                if (or != "") {
                    where += `AND (${or})`;
                }
            }
        }

        if (reservationId) {
            where += `AND ("booking"."reservation_id" = '${reservationId}')`;
        }

        if (product_id) {
            where += `AND ("booking"."laytrip_booking_id" =  '${product_id}')`;
        }

        if (booking_id) {
            where += `AND ("cart"."laytrip_cart_id" =  '${booking_id}')`;
        }
        if (start_date) {
            where += `AND (DATE("BookingInstalments".instalment_date) >= '${start_date}') `;
        }

        if (end_date) {
            where += `AND (DATE("BookingInstalments".instalment_date) <= '${end_date}') `;
        }
        if (status) {
            where += `AND ("BookingInstalments"."payment_status" = '${status}')`;
        }
        if (module_id) {
            where += `AND ("BookingInstalments"."module_id" = '${module_id}')`;
        }
        if (supplier) {
            where += `AND ("BookingInstalments"."supplier_id" = '${supplier}') `;
        }
        if (instalment_type) {
            where += `AND ("BookingInstalments"."instalment_type" = '${instalment_type}') `;
        }
        if (search) {
            const cipher = await CryptoUtility.encode(search);
            where += `AND (("User"."first_name" = '${cipher}')or("User"."email" = '${cipher}')or("User"."last_name" = '${cipher}'))`;
        }
        const { data, total_count } = await this.bookingRepository.listPayment(
            where,
            limit,
            page_no
        );

        for await (const payment of data) {
            payment["status"] = await BookingStatusUtility.bookingStatus(
                payment.booking.bookingStatus,
                payment.booking.paymentStatus,
                new Date(payment.booking.checkOutDate),
                payment.booking.isResedule
            );
        }

        //const result: any = data;

        // for await (const instalment of result) {
        // 	if (instalment.bookingInstalments) {
        // 		let infoDate = instalment.bookingInstalments;
        // 		infoDate.reverse()
        // 		for (let index = 0; index < infoDate.length; index++) {
        // 			const element = infoDate[index];
        // 			if (element.instalmentDate == instalment.instalmentDate) {
        // 				//console.log(element.instalmentDate, instalment.instalmentDate, index);

        // 				instalment.installmentNo = index + 1;
        // 				exit;
        // 			}
        // 		}
        // 	}
        // }

        return {
            data: data,
            total_count: total_count,
        };
    }

    async exportUpcomingPaymentForAdmin(
        listPaymentAdminDto: ExportPaymentAdminDto
    ) {
        const {
            module_id,
            supplier,
            status,
            start_date,
            end_date,
            instalment_type,
            user_id,
            booking_id,
            search,
            product_id,
            reservationId,
            booking_status,
        } = listPaymentAdminDto;

        let where;
        where = `("booking"."module_id" in (${ModulesName.FLIGHT},${ModulesName.HOTEL})) AND ("BookingInstalments"."payment_status" = ${PaymentStatus.PENDING}) AND "BookingInstalments"."attempt" = 0`;
        if (user_id) {
            where += `AND ("BookingInstalments"."user_id" = '${user_id}')`;
        }
        if (reservationId) {
            where += `AND ("booking"."reservation_id" = '${reservationId}')`;
        }

        if (product_id) {
            where += `AND ("booking"."laytrip_booking_id" =  '${product_id}')`;
        }

        if (booking_id) {
            where += `AND ("cart"."laytrip_cart_id" =  '${booking_id}')`;
        }
        if (start_date) {
            where += `AND (DATE("BookingInstalments".instalment_date) >= '${start_date}') `;
        }
        if (booking_status?.length) {
            if (typeof booking_status != "object") {
                console.log(booking_status);

                let w = await BookingStatusUtility.filterCondition(
                    parseInt(booking_status),
                    "booking"
                );
                console.log(w);

                if (w) {
                    where += `AND (${w})`;
                }
            } else {
                let or = "";
                for await (const s of booking_status) {
                    let w = await BookingStatusUtility.filterCondition(
                        s,
                        "booking"
                    );
                    if (w) {
                        or += `${or == "" ? "" : "or"}(${w})`;
                    }
                }
                if (or != "") {
                    where += `AND (${or})`;
                }
            }
        }
        if (end_date) {
            where += `AND (DATE("BookingInstalments".instalment_date) <= '${end_date}') `;
        }
        if (status) {
            where += `AND ("BookingInstalments"."payment_status" = '${status}')`;
        }
        if (module_id) {
            where += `AND ("BookingInstalments"."module_id" = '${module_id}')`;
        }
        if (supplier) {
            where += `AND ("BookingInstalments"."supplier_id" = '${supplier}') `;
        }
        if (instalment_type) {
            where += `AND ("BookingInstalments"."instalment_type" = '${instalment_type}') `;
        }
        if (search) {
            const cipher = await CryptoUtility.encode(search);
            where += `AND (("User"."first_name" = '${cipher}')or("User"."email" = '${cipher}')or("User"."last_name" = '${cipher}'))`;
        }
        const {
            data,
            total_count,
        } = await this.bookingRepository.exportPayment(where);

        for await (const payment of data) {
            payment["status"] = await BookingStatusUtility.bookingStatus(
                payment.booking.bookingStatus,
                payment.booking.paymentStatus,
                new Date(payment.booking.checkOutDate),
                payment.booking.isResedule
            );
        }
        //const result: any = data;

        // for await (const instalment of result) {
        // 	if (instalment.bookingInstalments) {
        // 		let infoDate = instalment.bookingInstalments;
        // 		infoDate.reverse()
        // 		for (let index = 0; index < infoDate.length; index++) {
        // 			const element = infoDate[index];
        // 			if (element.instalmentDate == instalment.instalmentDate) {
        // 				//console.log(element.instalmentDate, instalment.instalmentDate, index);

        // 				instalment.installmentNo = index + 1;
        // 				exit;
        // 			}
        // 		}
        // 	}
        // }

        return {
            data: data,
            total_count: total_count,
        };
    }

    async activePaymentForAdmin(listPaymentAdminDto: ListPaymentAdminDto) {
        const {
            limit,
            page_no,
            module_id,
            supplier,
            status,
            start_date,
            end_date,
            instalment_type,
            user_id,
            booking_id,
            search,
            product_id,
            reservationId,
            booking_status,
        } = listPaymentAdminDto;

        let where;
        where = `"BookingInstalments"."attempt" > 0`;
        if (user_id) {
            where += `AND ("BookingInstalments"."user_id" = '${user_id}')`;
        }
        if (reservationId) {
            where += `AND ("booking"."reservation_id" = '${reservationId}')`;
        }

        if (product_id) {
            where += `AND ("booking"."laytrip_booking_id" =  '${product_id}')`;
        }

        if (booking_id) {
            where += `AND ("cart"."laytrip_cart_id" =  '${booking_id}')`;
        }
        if (start_date) {
            where += `AND (DATE("BookingInstalments".instalment_date) >= '${start_date}') `;
        }

        if (end_date) {
            where += `AND (DATE("BookingInstalments".instalment_date) <= '${end_date}') `;
        }
        if (status) {
            where += `AND ("BookingInstalments"."payment_status" = '${status}')`;
        }
        if (module_id) {
            where += `AND ("BookingInstalments"."module_id" = '${module_id}')`;
        }
        if (supplier) {
            where += `AND ("BookingInstalments"."supplier_id" = '${supplier}') `;
        }
        if (instalment_type) {
            where += `AND ("BookingInstalments"."instalment_type" = '${instalment_type}') `;
        }
        if (search) {
            const cipher = await CryptoUtility.encode(search);
            where += `AND (("User"."first_name" = '${cipher}')or("User"."email" = '${cipher}')or("User"."last_name" = '${cipher}'))`;
        }

        if (booking_status?.length) {
            if (typeof booking_status != "object") {
                console.log(booking_status);

                let w = await BookingStatusUtility.filterCondition(
                    parseInt(booking_status),
                    "booking"
                );
                console.log(w);

                if (w) {
                    where += `AND (${w})`;
                }
            } else {
                let or = "";
                for await (const s of booking_status) {
                    let w = await BookingStatusUtility.filterCondition(
                        s,
                        "booking"
                    );
                    if (w) {
                        or += `${or == "" ? "" : "or"}(${w})`;
                    }
                }
                if (or != "") {
                    where += `AND (${or})`;
                }
            }
        }
        const { data, total_count } = await this.bookingRepository.listPayment(
            where,
            limit,
            page_no
        );

        for await (const payment of data) {
            payment["status"] = await BookingStatusUtility.bookingStatus(
                payment.booking.bookingStatus,
                payment.booking.paymentStatus,
                new Date(payment.booking.checkOutDate),
                payment.booking.isResedule
            );
        }

        return {
            data: data,
            total_count: total_count,
        };
    }
    async exportActivePaymentForAdmin(
        listPaymentAdminDto: ExportPaymentAdminDto
    ) {
        const {
            module_id,
            supplier,
            status,
            start_date,
            end_date,
            instalment_type,
            user_id,
            booking_id,
            search,
            product_id,
            reservationId,
            booking_status,
        } = listPaymentAdminDto;

        let where;
        where = `"BookingInstalments"."attempt" > 0`;
        if (user_id) {
            where += `AND ("BookingInstalments"."user_id" = '${user_id}')`;
        }
        if (reservationId) {
            where += `AND ("booking"."reservation_id" = '${reservationId}')`;
        }

        if (product_id) {
            where += `AND ("booking"."laytrip_booking_id" =  '${product_id}')`;
        }

        if (booking_status?.length) {
            if (typeof booking_status != "object") {
                console.log(booking_status);

                let w = await BookingStatusUtility.filterCondition(
                    parseInt(booking_status),
                    "booking"
                );
                console.log(w);

                if (w) {
                    where += `AND (${w})`;
                }
            } else {
                let or = "";
                for await (const s of booking_status) {
                    let w = await BookingStatusUtility.filterCondition(
                        s,
                        "booking"
                    );
                    if (w) {
                        or += `${or == "" ? "" : "or"}(${w})`;
                    }
                }
                if (or != "") {
                    where += `AND (${or})`;
                }
            }
        }

        if (booking_id) {
            where += `AND ("cart"."laytrip_cart_id" =  '${booking_id}')`;
        }
        if (start_date) {
            where += `AND (DATE("BookingInstalments".instalment_date) >= '${start_date}') `;
        }

        if (end_date) {
            where += `AND (DATE("BookingInstalments".instalment_date) <= '${end_date}') `;
        }
        if (status) {
            where += `AND ("BookingInstalments"."payment_status" = '${status}')`;
        }
        if (module_id) {
            where += `AND ("BookingInstalments"."module_id" = '${module_id}')`;
        }
        if (supplier) {
            where += `AND ("BookingInstalments"."supplier_id" = '${supplier}') `;
        }
        if (instalment_type) {
            where += `AND ("BookingInstalments"."instalment_type" = '${instalment_type}') `;
        }
        if (search) {
            const cipher = await CryptoUtility.encode(search);
            where += `AND (("User"."first_name" = '${cipher}')or("User"."email" = '${cipher}')or("User"."last_name" = '${cipher}'))`;
        }
        const {
            data,
            total_count,
        } = await this.bookingRepository.exportPayment(where);

        for await (const payment of data) {
            payment["status"] = await BookingStatusUtility.bookingStatus(
                payment.booking.bookingStatus,
                payment.booking.paymentStatus,
                new Date(payment.booking.checkOutDate),
                payment.booking.isResedule
            );
        }

        return {
            data: data,
            total_count: total_count,
        };
    }

    async formatDate(date) {
        var d = new Date(date),
            month = "" + (d.getMonth() + 1),
            day = "" + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = "0" + month;
        if (day.length < 2) day = "0" + day;

        return [month, day, year].join("/");
    }

    async getPredictiveBookingDdata() {
        try {
            const result = await this.bookingRepository.getPredictiveBookingDdata();
            let todayPrice = [];
            let availableBookingId = [];
            console.log(result.data.length);

            for await (const data of result.data) {
                const bookingData = data.booking;
                // booking data
                const paidAmount = await this.paidAmountByUser(data.bookingId);
                const valuations = await ValuationPercentageUtility.calculations(
                    data.booking.cart.laytripCartId
                );


                const totalPaidAmount = valuations && typeof valuations['amount'] != "undefined" ? Generic.formatPriceDecimal(
                    valuations["amount"][bookingData.laytripBookingId] || 0
                ) : 0
                //    const paidAmount = Generic.formatPriceDecimal(
                //        valuations["amount"][bookingData.laytripBookingId] || 0
                //    );
                // value of amount paid by user
                //console.log(paidAmount);

                const markups = await this.getPreductionMarkup();
                // preduction markup maximum aur minimum value

                const predictiveDate = new Date(
                    bookingData.predectedBookingDate
                );
                // predictive date for booking

                //const predictiveMarkupAmount = await this.predictiveMarkupAmount(bookingData.totalAmount)

                // predictive markup amount for minimum paid by user
                let category: LaytripCategory;
                if (bookingData?.categoryName) {
                    let query = getConnection()
                        .createQueryBuilder(LaytripCategory, "category")
                        .where(
                            `category.name = '${bookingData?.categoryName}'`
                        );

                    category = await query.getOne();
                }

                let dayDiff = moment(moment(bookingData.checkInDate)).diff(
                    new Date(),
                    "days"
                );

                const predictiveBookingData: any = {};
                predictiveBookingData["booking_id"] = data.bookingId;
                predictiveBookingData["offer_data"] = bookingData.moduleInfo[0]?.offer_data
                predictiveBookingData["actualSellingPrice"] = bookingData.actualSellingPrice
                predictiveBookingData["offerFrom"] = bookingData.offerFrom
                predictiveBookingData["isPromotional"] = bookingData.isPromotional
                predictiveBookingData["product_id"] =
                    bookingData.laytripBookingId;
                predictiveBookingData["payment_status"] =
                    bookingData.paymentStatus;
                predictiveBookingData["location_info"] =
                    bookingData.locationInfo;
                predictiveBookingData["checkInDate"] = bookingData.checkInDate;
                predictiveBookingData["categoryName"] =
                    bookingData.categoryName || "";
                predictiveBookingData["remain_days"] = dayDiff;
                predictiveBookingData["booking_time_total_amount"] =
                    bookingData.totalAmount;
                predictiveBookingData["cart_id"] =
                    data.booking.cart.laytripCartId;
                predictiveBookingData["net_price"] = data.netPrice;
                predictiveBookingData["date"] = data.date;
                predictiveBookingData["is_below_minimum"] = data.isBelowMinimum;
                predictiveBookingData["remain_seat"] = data.remainSeat;
                predictiveBookingData["selling_price"] =
                    bookingData.totalAmount;
                //predictiveBookingData["paid_amount"] = totalPaidAmount;
                predictiveBookingData["is_installation_on_track"] =
                    paidAmount?.attempt == 1 &&
                        paidAmount?.paymentStatus == PaymentStatus.CONFIRM
                        ? true
                        : false;
                //predictiveBookingData["paid_amount_in_percentage"] =
                (totalPaidAmount * 100) /
                    parseFloat(bookingData.totalAmount);
                predictiveBookingData["booking_status"] =
                    bookingData.bookingStatus;

                predictiveBookingData[
                    "status"
                ] = await BookingStatusUtility.bookingStatus(
                    bookingData.bookingStatus,
                    bookingData.paymentStatus,
                    new Date(bookingData.checkOutDate),
                    bookingData.isResedule
                );

                // //console.log(bookingData.laytripBookingId);

                predictiveBookingData["departure_date"] =
                    bookingData.checkInDate || "";
                predictiveBookingData["laytrip_booking_id"] =
                    bookingData.laytripBookingId;

                predictiveBookingData[
                    "valuationPercentage"
                ] = Generic.formatPriceDecimal(
                    valuations[bookingData.laytripBookingId] || 0
                );
                predictiveBookingData[
                    "paid_amount_in_percentage"
                ] = Generic.formatPriceDecimal(
                    valuations[bookingData.laytripBookingId] || 0
                );

                predictiveBookingData[
                    "paid_amount"
                ] = valuations && typeof valuations['amount'] != "undefined" ? Generic.formatPriceDecimal(
                    valuations["amount"][bookingData.laytripBookingId] || 0
                ) : 0
                predictiveBookingData["bookIt"] = false;
                predictiveBookingData["module_name"] = bookingData.module.name;
                predictiveBookingData["is_reseduled"] = bookingData?.updateBy
                    ? true
                    : false;
                predictiveBookingData["booking_time_net_rate"] =
                    bookingData.netRate;

                predictiveBookingData["profit"] =
                    parseFloat(bookingData.totalAmount) - data.netPrice;

                const net_rate_percentage_variation =
                    ((data.netPrice - parseFloat(bookingData.netRate)) * 100) /
                    parseFloat(bookingData.netRate);
                predictiveBookingData[
                    "net_rate_percentage_variation"
                ] = net_rate_percentage_variation;

                predictiveBookingData["is_minimum_installment_paid"] = false;
                predictiveBookingData[
                    "is_net_rate_price_change_below_threshold"
                ] = false;
                predictiveBookingData[
                    "is_net_rate_price_change_above_threshold"
                ] = false;
                //predictiveBookingData['is_last_date_for_booking'] = false;

                if (net_rate_percentage_variation == 0) {
                    predictiveBookingData[
                        "net_rate_percentage_variation_stage"
                    ] = "EQUAL";
                    predictiveBookingData["profit_stage"] = "EQUAL";
                } else {
                    predictiveBookingData[
                        "net_rate_percentage_variation_stage"
                    ] = net_rate_percentage_variation > 0 ? "UP" : "DOWN";
                    predictiveBookingData["profit_stage"] =
                        net_rate_percentage_variation > 0 ? "DOWN" : "UP";
                }

                //predictiveBookingData['bookingData'] = bookingData;

                if (data.isBelowMinimum == true) {
                    //console.log(`rule 1 :- flight below minimum`)
                    predictiveBookingData.bookIt = true;
                }

                if (
                    net_rate_percentage_variation > markups.minRatePercentage &&
                    predictiveBookingData[
                    "net_rate_percentage_variation_stage"
                    ] == "DOWN"
                ) {
                    //console.log(`rule 2 :- flight net rate less than the user book net rate`)
                    predictiveBookingData.bookIt = true;
                    predictiveBookingData[
                        "is_net_rate_price_change_below_threshold"
                    ] = true;
                } else if (
                    net_rate_percentage_variation > markups.maxRatePercentage &&
                    predictiveBookingData[
                    "net_rate_percentage_variation_stage"
                    ] == "UP"
                ) {
                    //console.log(`rule 3 :- flight net rate less than the preduction markup max amount`)
                    predictiveBookingData.bookIt = true;
                    predictiveBookingData[
                        "is_net_rate_price_change_above_threshold"
                    ] = true;
                }

                // if (predictiveDate <= data.date) {
                // 	//console.log(`rule 4 :- last date for booking`)
                // 	predictiveBookingData.bookIt = true;
                // 	predictiveBookingData['is_last_date_for_booking'] = true;
                // }

                if (
                    predictiveBookingData.paid_amount_in_percentage >=
                    markups.minInstallmentPercentage
                ) {
                    predictiveBookingData.bookIt = true;
                    predictiveBookingData["is_minimum_installment_paid"] = true;
                }

                predictiveBookingData["reservation_status"] = "white";

                if (net_rate_percentage_variation > 5) {
                    predictiveBookingData["reservation_status"] = "red";
                    predictiveBookingData["reservation_status_note"] =
                        "net_rate_percentage_variation > 5";
                }

                if (
                    net_rate_percentage_variation <= -60 &&
                    predictiveBookingData.paid_amount_in_percentage >= 20
                ) {
                    predictiveBookingData["reservation_status"] = "green";
                    predictiveBookingData["reservation_status_note"] =
                        "net_rate_percentage_variation <= -60 && predictiveBookingData.paid_amount_in_percentage >= 20";
                }

                if (
                    net_rate_percentage_variation <= -50 &&
                    predictiveBookingData.paid_amount_in_percentage >= 30
                ) {
                    predictiveBookingData["reservation_status"] = "green";
                    predictiveBookingData["reservation_status_note"] =
                        "net_rate_percentage_variation <= -50 && predictiveBookingData.paid_amount_in_percentage >= 30";
                }

                if (
                    net_rate_percentage_variation <= -40 &&
                    predictiveBookingData.paid_amount_in_percentage >= 40
                ) {
                    predictiveBookingData["reservation_status"] = "green";
                    predictiveBookingData["reservation_status_note"] =
                        "net_rate_percentage_variation <= -40 && predictiveBookingData.paid_amount_in_percentage >= 40";
                }

                if (
                    net_rate_percentage_variation <= -30 &&
                    predictiveBookingData.paid_amount_in_percentage >= 50
                ) {
                    predictiveBookingData["reservation_status"] = "green";
                    predictiveBookingData["reservation_status_note"] =
                        "net_rate_percentage_variation <= -30 && predictiveBookingData.paid_amount_in_percentage >= 50";
                }

                if (
                    net_rate_percentage_variation <= -20 &&
                    predictiveBookingData.paid_amount_in_percentage >= 60
                ) {
                    predictiveBookingData["reservation_status"] = "green";
                    predictiveBookingData["reservation_status_note"] =
                        "net_rate_percentage_variation <= -20 && predictiveBookingData.paid_amount_in_percentage >= 60";
                }

                if (
                    net_rate_percentage_variation <= -10 &&
                    predictiveBookingData.paid_amount_in_percentage >= 70
                ) {
                    predictiveBookingData["reservation_status"] = "green";
                    predictiveBookingData["reservation_status_note"] =
                        "net_rate_percentage_variation <= -10 && predictiveBookingData.paid_amount_in_percentage >= 70";
                }

                if (category) {
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
                    let checkInDate = new Date(bookingData.checkInDate);
                    checkInDate.setDate(
                        checkInDate.getDate() -
                        categoryDays
                    );

                    predictiveBookingData["deadline_date"] = checkInDate;
                    if (categoryDays > dayDiff) {
                        predictiveBookingData["reservation_status"] = "yellow";
                        predictiveBookingData["reservation_status_note"] =
                            "category.installmentAvailableAfter > dayDiff";
                    }
                }

                predictiveBookingData["cancellationRequest"] =
                    bookingData?.cancellationRequest;

                const id = predictiveBookingData.laytrip_booking_id;
                todayPrice.push(predictiveBookingData);
                availableBookingId.push(id);
            }

            // return {
            //     availableBookingId,
            //     todayPrice,
            // };
            const allBooking = await this.bookingRepository.getPendingBooking();
            let responce = [];
            ////console.log(todayPrice);

            for await (const booking of allBooking) {
                if (
                    availableBookingId.indexOf(booking.laytripBookingId) != -1
                ) {
                    ////console.log(availableBookingId.indexOf(booking.laytripBookingId));
                    responce.push(
                        todayPrice[
                        availableBookingId.indexOf(booking.laytripBookingId)
                        ]
                    );
                } else {
                    const paidAmount = await this.paidAmountByUser(booking.id);
                    const valuations = await ValuationPercentageUtility.calculations(
                        booking.cart.laytripCartId
                    );
                    const totalPaidAmount = valuations && typeof valuations['amount'] != "undefined" ? Generic.formatPriceDecimal(
                        valuations["amount"][booking.laytripBookingId] || 0
                    ) : 0

                    //console.log(booking.laytripBookingId);
                    //console.log('booking.laytripBookingId');

                    let category: LaytripCategory;
                    if (booking?.categoryName) {
                        let query = getConnection()
                            .createQueryBuilder(LaytripCategory, "category")
                            .where(`category.name = '${booking.categoryName}'`);

                        category = await query.getOne();
                    }

                    const predictiveBookingData: any = {};

                    let dayDiff = moment(moment(booking.checkInDate)).diff(
                        new Date(),
                        "days"
                    );
                    predictiveBookingData["product_id"] =
                        booking.laytripBookingId;
                    predictiveBookingData["offer_data"] = booking.moduleInfo[0]?.offer_data
                    predictiveBookingData["actualSellingPrice"] = booking.actualSellingPrice
                    predictiveBookingData["offerFrom"] = booking.offerFrom
                    predictiveBookingData["isPromotional"] = booking.isPromotional
                    predictiveBookingData["payment_status"] =
                        booking.paymentStatus;
                    predictiveBookingData["location_info"] =
                        booking.locationInfo;
                    predictiveBookingData["checkInDate"] = booking.checkInDate;
                    predictiveBookingData["categoryName"] =
                        booking.categoryName || "";
                    predictiveBookingData["remain_days"] = dayDiff;
                    predictiveBookingData["booking_time_total_amount"] =
                        booking.totalAmount;
                    predictiveBookingData["booking_id"] = booking.id;
                    predictiveBookingData["cart_id"] =
                        booking.cart.laytripCartId;
                    // const valuations = await ValuationPercentageUtility.calculations(
                    //     booking.cart.laytripCartId
                    // );
                    predictiveBookingData[
                        "valuationPercentage"
                    ] = Generic.formatPriceDecimal(
                        valuations[booking.laytripBookingId] || 0
                    );
                    predictiveBookingData["net_price"] = null;
                    predictiveBookingData["date"] = null;
                    predictiveBookingData["is_below_minimum"] = false;
                    predictiveBookingData["remain_seat"] = 0;
                    predictiveBookingData["module_name"] = booking.module.name;
                    predictiveBookingData["is_reseduled"] = booking?.updateBy
                        ? true
                        : false;
                    predictiveBookingData[
                        "status"
                    ] = await BookingStatusUtility.bookingStatus(
                        booking.bookingStatus,
                        booking.paymentStatus,
                        new Date(booking.checkOutDate),
                        booking.isResedule
                    );
                    predictiveBookingData["selling_price"] =
                        booking.totalAmount;
                    //predictiveBookingData["paid_amount"] = totalPaidAmount;
                    predictiveBookingData["is_installation_on_track"] =
                        paidAmount?.attempt <= 1 ? true : false;
                    //predictiveBookingData["paid_amount_in_percentage"] =
                    (totalPaidAmount * 100) /
                        parseFloat(booking.totalAmount);
                    predictiveBookingData["booking_status"] =
                        booking.bookingStatus;
                    predictiveBookingData["departure_date"] =
                        booking.checkInDate || "";
                    predictiveBookingData["laytrip_booking_id"] =
                        booking.laytripBookingId;
                    predictiveBookingData["bookIt"] = false;
                    predictiveBookingData["booking_time_net_rate"] =
                        booking.netRate;

                    predictiveBookingData["profit"] = 0;

                    predictiveBookingData["net_rate_percentage_variation"] = 0;

                    predictiveBookingData[
                        "is_minimum_installment_paid"
                    ] = false;
                    predictiveBookingData[
                        "is_net_rate_price_change_below_threshold"
                    ] = false;
                    predictiveBookingData[
                        "is_net_rate_price_change_above_threshold"
                    ] = false;
                    predictiveBookingData[
                        "paid_amount_in_percentage"
                    ] = Generic.formatPriceDecimal(
                        valuations[booking.laytripBookingId] || 0
                    );

                    predictiveBookingData[
                        "paid_amount"
                    ] = valuations && typeof valuations['amount'] != "undefined" ? Generic.formatPriceDecimal(
                        valuations["amount"][booking.laytripBookingId] || 0
                    ) : 0

                    if (category) {
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
                        let checkInDate = new Date(booking.checkInDate);
                        checkInDate.setDate(
                            checkInDate.getDate() -
                            categoryDays
                        );
                        predictiveBookingData["deadline_date"] = checkInDate;
                        if (categoryDays > dayDiff) {
                            predictiveBookingData["reservation_status"] =
                                "yellow";
                            predictiveBookingData["reservation_status_note"] =
                                "category.installmentAvailableAfter > dayDiff";
                        }
                    }
                    predictiveBookingData["cancellationRequest"] =
                        booking?.cancellationRequest;
                    responce.push(predictiveBookingData);
                }
            }
            return { data: responce, count: responce.length };
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new NotFoundException(
                `${error.message}&&&id&&&${error.message}`
            );
        }
    }

    async paidAmountByUser(bookingId) {
        ////console.log(bookingId);

        let query = await getManager()
            .createQueryBuilder(BookingInstalments, "instalment")
            .select([
                "instalment.amount",
                "instalment.paymentStatus",
                "instalment.attempt",
            ])
            .where(`booking_id=:bookingId AND attempt != 0 `, {
                bookingId,
                paymentStatus: PaymentStatus.CONFIRM,
            })
            .orderBy(`id`, "DESC")
            .getOne();
        // let amount = 0
        // let attempt = 0;
        // //for await (const data of query) {
        // 	amount = amount + parseFloat(data.amount)
        // 	attempt =
        // 	// if (data.paymentStatus == PaymentStatus.CONFIRM) {
        // 	// 	attempt = data.attempt
        // 	// }

        // // }

        return query;
    }

    async totalpaidAmount(bookingId) {
        ////console.log(bookingId);

        let query = await getManager()
            .createQueryBuilder(BookingInstalments, "instalment")
            .select(["instalment.amount"])
            .where(`booking_id=:bookingId AND payment_status =:paymentStatus`, {
                bookingId,
                paymentStatus: PaymentStatus.CONFIRM,
            })
            .orderBy(`id`, "DESC")
            .getMany();
        let amount = 0;
        for await (const data of query) {
            amount = amount + parseFloat(data.amount);
        }

        return amount;
    }

    async getPreductionMarkup() {
        let query = getManager().createQueryBuilder(
            PredictionFactorMarkup,
            "markup"
        );
        // .select([
        // 	"markup.maxRatePercentage",
        // 	"markup.minRatePercentage"
        // ])
        const result = await query.getOne();

        return result;
    }

    async getDailyPricesOfBooking(bookingId: string) {
        try {
            const result = await this.bookingRepository.getDailyPredictiveBookingPrices(
                bookingId
            );
            const data: any = result.predictiveBookingData;
            if (!data.length) {
                throw new NotFoundException(`No data found`);
            }
            for await (const value of data) {
                value["laytripBookingId"] = result.laytripBookingId;
            }

            if (data.length > 0) {
                data.sort((a, b) => b.id - a.id);

                //data.reverse()
            }

            return {
                result: data,
                count: data.length,
            };
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new NotFoundException(
                `${error.message}&&&id&&&${error.message}`
            );
        }
    }

    async exportBookings(listBookingDto: ExportBookingDto) {
        try {
            let result = await this.bookingRepository.exportCSV(listBookingDto);

            ////console.log(result);

            for (let i in result.data) {
                let paidAmount = 0;
                let remainAmount = 0;
                for (let instalment of result.data[i].bookingInstalments) {
                    if (instalment.instalmentStatus == 1) {
                        paidAmount += parseFloat(instalment.amount);
                    } else {
                        remainAmount += parseFloat(instalment.amount);
                    }
                }
                // result.data[i]["paidAmount"] =
                //     result.data[i].bookingType == BookingType.NOINSTALMENT &&
                //     result.data[i].paymentStatus == PaymentStatus.CONFIRM
                //         ? Generic.formatPriceDecimal(
                //               parseFloat(result.data[i].totalAmount)
                //           )
                //         : Generic.formatPriceDecimal(paidAmount);
                result.data[i]["remainAmount"] =
                    result.data[i].bookingType == BookingType.NOINSTALMENT &&
                        result.data[i].paymentStatus == PaymentStatus.CONFIRM
                        ? 0
                        : Generic.formatPriceDecimal(remainAmount);
                result.data[i][
                    "paid_amount_in_percentage"
                ] = Generic.formatPriceDecimal(
                    (parseFloat(result.data[i]["paidAmount"]) * 100) /
                    parseFloat(result.data[i].totalAmount)
                );
                // result.data[i][
                //     "paid_amount_in_percentage"
                // ] = Generic.formatPriceDecimal(
                //     (parseFloat(result.data[i]["paidAmount"]) * 100) /
                //         parseFloat(result.data[i].totalAmount)
                // );

                const valuations = await ValuationPercentageUtility.calculations(
                    result.data[i].cart.laytripCartId
                );
                result.data[i][
                    "valuationPercentage"
                ] = Generic.formatPriceDecimal(
                    valuations[result.data[i].laytripBookingId] || 0
                );

                result.data[i]["paidAmount"] = valuations && typeof valuations['amount'] != "undefined" ? Generic.formatPriceDecimal(
                    valuations["amount"][result.data[i].laytripBookingId] || 0
                ) : 0

                result.data[i]["remain_days"] = moment(
                    moment(result.data[i].checkInDate)
                ).diff(new Date(), "days");

                delete result.data[i].user.updatedDate;
                delete result.data[i].user.salt;
                delete result.data[i].user.password;

                result.data[i][
                    "status"
                ] = await BookingStatusUtility.bookingStatus(
                    result.data[i].bookingStatus,
                    result.data[i].paymentStatus,
                    new Date(result.data[i].checkOutDate),
                    result.data[i].isResedule
                );
                // for (let j in result.data[i].travelers) {
                //     var birthDate = new Date(
                //         result.data[i].travelers[j].travelerInfo.dob
                //     );
                //     var age = moment(new Date()).diff(
                //         moment(birthDate),
                //         "years"
                //     );

                //     if (age < 2) {
                //         result.data[i].travelers[j].travelerInfo.user_type =
                //             "infant";
                //     } else if (age < 12) {
                //         result.data[i].travelers[j].travelerInfo.user_type =
                //             "child";
                //     } else {
                //         result.data[i].travelers[j].travelerInfo.user_type =
                //             "adult";
                //     }
                // }
            }
            return result;
        } catch (error) {
            if (typeof error.response !== "undefined") {
                //console.log('m');
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new NotFoundException(
                `${error.message}&&&id&&&${error.message}`
            );
        }
    }

    async shareBooking(
        shareBookingDto: ShareBookingDto,
        user: User
    ): Promise<{ message: any }> {
        const { emails, bookingId } = shareBookingDto;

        const responce = await CartDataUtility.CartMailModelDataGenerate(
            bookingId
        );
        if (responce?.param) {
            let subject =
                responce.param.bookingType == BookingType.INSTALMENT
                    ? `Booking ID ${responce.param.orderId} Confirmation`
                    : `Booking ID ${responce.param.orderId} Confirmation`;
            let emailId = "";
            for await (const email of emails) {
                emailId += email.email + ",";
            }
            this.mailerService
                .sendMail({
                    to: emailId,
                    from: mailConfig.from,
                    bcc: mailConfig.BCC,
                    subject: subject,
                    html: await LaytripCartBookingConfirmtionMail(
                        responce.param,
                        responce.referralId
                    ),
                })
                .then((res) => {
                    //console.log("res", res);
                })
                .catch((err) => {
                    //console.log("err", err);
                });
            return {
                message: `Cart booking email send successfully`,
            };
        } else {
            return {
                message: `Booking ID not found.`,
            };
        }
    }
    async getBookingIds() {
        return await this.bookingRepository.getBookingId();
    }
    async deleteBooking(deleteBookingDto: DeleteBookingDto, user: User, referralId) {
        let { booking_id, product_id, message, reason } = deleteBookingDto;

        if (user.roleId != Role.FREE_USER && user.roleId != Role.PAID_USER) {
            reason = CancellationReason.CustomerChoice;
        }
        let where = `("cartBooking"."laytrip_cart_id" =  '${booking_id}')`;
        if (product_id) {
            where += `AND ("booking"."laytrip_booking_id" = '${product_id}')`;
        }
        if (user.roleId >= 5) {
            where += `AND ("cartBooking"."user_id" =  '${user.userId}')`;
        }
        const query = await getConnection()
            .createQueryBuilder(CartBooking, "cartBooking")
            .leftJoinAndSelect("cartBooking.bookings", "booking")
            .leftJoinAndSelect("cartBooking.user", "User")
            .where(where)
            .getOne();

        if (!query && !query.bookings.length) {
            throw new BadRequestException(`Booking ID not found.`);
        }

        for await (const booking of query.bookings) {
            await getConnection()
                .createQueryBuilder()
                .update(Booking)
                .set({
                    bookingStatus: BookingStatus.CANCELLED,
                    paymentStatus: PaymentStatus.CANCELLED,
                    updatedDate: new Date(),
                    updateBy: user.userId,
                    message: message || null,
                    cancellationReason: reason,
                })
                .where(
                    `id =:id AND booking_status <= ${BookingStatus.CONFIRM}`,
                    {
                        id: booking.id,
                    }
                )
                .execute();

            await getConnection()
                .createQueryBuilder()
                .update(BookingInstalments)
                .set({ paymentStatus: PaymentStatus.CANCELLED })
                .where(
                    `booking_id =:id AND payment_status = ${PaymentStatus.PENDING}`,
                    { id: booking.id }
                )
                .execute();

            if (
                booking.bookingStatus == BookingStatus.PENDING &&
                booking.moduleId == ModulesName.FLIGHT
            ) {
                const data = await NotificationAlertUtility.notificationModelCreater(
                    booking.laytripBookingId
                );
                await this.mailerService
                    .sendMail({
                        to: mailConfig.admin,
                        from: 'customerservice@laytrip.com',
                        bcc: mailConfig.BCC,
                        subject: `Alert - BOOKING #${data.param.laytripBookingId} got cancelled `,
                        html: await BookingCancellationNotificationMail(
                            data.param
                        ),
                    })
                    .then((res) => {
                        console.log("res", res);
                    })
                    .catch((err) => {
                        console.log("err", err);
                    });
            }
        }

        if (user.roleId != Role.FREE_USER && user.roleId != Role.PAID_USER) {
            Activity.logActivity(
                user.userId,
                "Bookings",
                "Booking(" + booking_id + "" + product_id ||
                "" + ") deleted by admin "
            );

            this.mailerService
                .sendMail({
                    to: query.user.email,
                    from: 'customerservice@laytrip.com',
                    bcc: mailConfig.BCC,
                    subject: `Booking ID ${booking_id} Provider Cancellation Notice`,
                    html: await LaytripCancellationTravelProviderMail(
                        {
                            userName: query.user.firstName || "",
                            bookingId: booking_id,
                        },
                        referralId
                    ),
                })
                .then((res) => {
                    console.log("res", res);
                })
                .catch((err) => {
                    console.log("err", err);
                });
        } else {
            this.mailerService
                .sendMail({
                    to: query.user.email,
                    from: mailConfig.from,
                    bcc: mailConfig.BCC,
                    subject: `Booking ID ${booking_id} Customer Cancellation`,
                    html: await LaytripBookingCancellationCustomerMail(
                        {
                            username: query.user.firstName || "",
                            bookingId: booking_id,
                        },
                        referralId
                    ),
                })
                .then((res) => {
                    console.log("res", res);
                })
                .catch((err) => {
                    console.log("err", err);
                });
        }

        if (product_id) {
            return {
                message: `Selected product cancel successfully `,
            };
        }
        return {
            message: `Selected booking cancel successfully `,
        };
    }

    async updateTravelerInfo(
        id: number,
        updateTravelerInfoDto: UpdateTravelerInfoDto,
        admin: User
    ) {
        let query = await getManager()
            .createQueryBuilder(TravelerInfo, "traveler")
            .leftJoinAndSelect("traveler.bookingData", "booking")
            .where(`"traveler"."id"=:id `, { id })
            .getOne();

        if (!query) {
            throw new NotFoundException(`Givel id not found`);
        }

        const previousValue = JSON.stringify(query);

        // const charges = await this.paymentService.createTransaction({
        // 	bookingId : null,
        // 	userId : query.booking.userId,
        // 	card_token : query.bookingData.cardToken,
        // 	currencyId : 1,
        // 	amount:2000,
        // 	paidFor : 'Traveler detail update charges',
        // 	travelerInfoId : query.id ,
        // 	note : ''
        // },admin.userId)

        const travelerInfo: TravelerInfoModel = {
            firstName: updateTravelerInfoDto.first_name,
            passportExpiry: updateTravelerInfoDto?.passport_expiry,
            passportNumber: updateTravelerInfoDto?.passport_number,
            lastName: updateTravelerInfoDto.last_name,
            email: updateTravelerInfoDto.email,
            phoneNo: updateTravelerInfoDto?.phone_no,
            countryCode: updateTravelerInfoDto?.country_code,
            dob: updateTravelerInfoDto?.dob,
            countryId: updateTravelerInfoDto?.country_id,
            gender: updateTravelerInfoDto?.gender,
        };

        const updatedValue = await getConnection()
            .createQueryBuilder()
            .update(TravelerInfo)
            .set({
                travelerInfo: travelerInfo,
                updateBy: admin.userId,
                oldTravelerInfo: JSON.parse(previousValue),
            })
            .where(`id=:id `, { id })
            .execute();
        const currentValue = JSON.stringify(updatedValue);
        Activity.logActivity(
            admin.userId,
            "Bookings",
            "Update traveler info of info id" + id,
            previousValue,
            currentValue
        );
        return {
            message: `Traveler detail update successfully`,
        };
    }

    async updateBookingByAdmin(
        updateBookingDto: updateBookingDto,
        Header,
        admin: User
    ) {
        const { product_id, route_code } = updateBookingDto;

        let booking = await getManager()
            .createQueryBuilder(Booking, "booking")
            .leftJoinAndSelect("booking.user", "User")
            .leftJoinAndSelect("booking.cart", "cart")
            .where(`"booking"."laytrip_booking_id" = '${product_id}'`)
            .getOne();
        if (!booking) {
            throw new NotFoundException(`Booking ID not found.`);
        }
        let flightInfo;
        switch (booking.moduleId) {
            case ModulesName.FLIGHT:
                flightInfo = await this.updateFlightBooking(
                    route_code,
                    Header,
                    booking.user
                );
                break;

            default:
                break;
        }
        const responce = {};
        console.log(flightInfo);

        responce["oldProductPrice"] = parseFloat(booking.totalAmount);
        responce["newProductPrice"] = parseFloat(flightInfo[0].selling_price);

        booking.updateBy = admin.userId;
        //booking.totalAmount = flightInfo[0].selling_price;
        booking.netRate = flightInfo[0].net_rate;
        booking.oldBookingInfo = JSON.parse(JSON.stringify(booking));
        booking.updatedDate = new Date();
        booking.moduleInfo = flightInfo;
        booking.isResedule = true;
        booking.locationInfo = {
            journey_type:
                flightInfo[0].routes.length > 1 ? "RoundTrip" : "oneway",
            source_location: flightInfo[0].departure_code,
            destination_location: flightInfo[0].arrival_code,
        };
        const newBooking = await booking.save();

        const updatedValue = await getConnection()
            .createQueryBuilder()
            .update(PredictiveBookingData)
            .set({ isResedule: true })
            .where(`booking_id =:id `, { id: booking.id })
            .execute();

        const dailyPrice = new PredictiveBookingData();
        dailyPrice.bookingId = newBooking.id;
        dailyPrice.date = new Date();
        dailyPrice.isBelowMinimum = false;
        dailyPrice.netPrice = parseFloat(newBooking.netRate);
        dailyPrice.price = flightInfo[0].selling_price;
        dailyPrice.remainSeat = flightInfo[0]?.remain_seat || 0;
        await dailyPrice.save();
        let mail = await CartDataUtility.CartMailModelDataGenerate(
            booking.cart.laytripCartId
        );
        this.mailerService
            .sendMail({
                to: mail.email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Booking ID ${mail.param.orderId} Customer Change`,
                html: await CartChangeAsperUserRequestMail(
                    mail.param,
                    mail.referralId
                ),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });
        return {
            message: `Given booking updated successfully.`,
            prices: responce,
        };
    }
    async updateFlightBooking(routCode, Header, user: User) {
        return await this.flightService.airRevalidate(
            { route_code: routCode },
            Header,
            user ? user : null,
            ""
        );
    }

    async updatePrimaryTraveler(productId, travelInfoId) {
        let booking = await getManager()
            .createQueryBuilder(Booking, "booking")
            .leftJoinAndSelect("booking.user", "User")
            .where(`laytrip_booking_id = '${productId}'`)
            .getOne();

        let travelerInfo = await getManager()
            .createQueryBuilder(TravelerInfo, "traveler")
            .where(`booking_id = '${booking.id}' AND id = ${travelInfoId}`)
            .getOne();

        if (!travelerInfo) {
            throw new BadRequestException(
                `Given product id and traveler id not match.`
            );
        }

        const updatedValue = await getConnection()
            .createQueryBuilder()
            .update(TravelerInfo)
            .set({ isPrimary: false })
            .where(`booking_id =:id `, { id: booking.id })
            .execute();

        await getConnection()
            .createQueryBuilder()
            .update(TravelerInfo)
            .set({ isPrimary: true })
            .where(`booking_id = '${booking.id}' AND id = ${travelInfoId}`)
            .execute();

        return {
            message: `Traveler changed to primary traveler.`,
        };
    }

    async requestIntialCancelBooking(
        intialCancelBookingDto: IntialCancelBookingDto,
        admin: User
    ) {
        try {
            const { message, product_id, booking_id } = intialCancelBookingDto;

            let bookings = await getManager()
                .createQueryBuilder(Booking, "booking")
                .leftJoinAndSelect("booking.cart", "cart")
                .where(
                    `booking.laytrip_booking_id = '${product_id}' AND booking.booking_status in (${BookingStatus.CONFIRM},${BookingStatus.PENDING}) AND cart.laytrip_cart_id = '${booking_id}'`
                )
                .getMany();

            if (!bookings) {
                throw new NotFoundException(`Inventry ID not found.`);
            }

            if (bookings.length != product_id.length) {
                throw new NotFoundException(`Enter valid property ids.`);
            }

            for await (const booking of bookings) {
                let requests = await getManager()
                    .createQueryBuilder(IntialCancelBooking, "intiat")

                    .where(`booking_id = '${booking.id}'`)
                    .getOne();

                if (requests) {
                    if (requests.status == IntialCancelationStatus.Approve) {
                        throw new ConflictException(
                            `Given booking cancellation request already accepted`
                        );
                    }

                    requests.updateBy = admin.userId;
                    requests.message = message || null;
                    requests.resendOn = new Date();
                    requests.count = requests.count + 1;
                    requests.status = IntialCancelationStatus.Pending;
                    requests.updatedDate = new Date();

                    await requests.save();
                } else {
                    let intialCancelation = new IntialCancelBooking();

                    intialCancelation.bookingId = booking.id;
                    intialCancelation.createBy = admin.userId;
                    intialCancelation.createdDate = new Date();
                    intialCancelation.message = message || null;
                    intialCancelation.status = IntialCancelationStatus.Pending;

                    await intialCancelation.save();
                }
            }

            const responce = await CartDataUtility.CartMailModelDataGenerate(
                bookings[0].cart.laytripCartId
            );
            let subject = `Booking ID ${responce.param.orderId} Cancellation Confirmation`;

            this.mailerService
                .sendMail({
                    to: responce.email,
                    from: 'customerservice@laytrip.com',
                    bcc: mailConfig.BCC,
                    subject: subject,
                    html: await LaytripIntialCancelBookingRequestEmail(
                        responce.param,
                        product_id
                    ),
                })
                .then((res) => {
                    //console.log("res", res);
                })
                .catch((err) => {
                    //console.log("err", err);
                });
            Activity.logActivity(
                admin.userId,
                "Intiate-cancellation",
                "Intiate cancelation request for booking number : " + product_id
            );
            return {
                message: `Intial cancellation request send successfully.`,
            };
        } catch (error) {
            if (typeof error.response !== "undefined") {
                //console.log('m');
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new NotFoundException(
                `${error.message}&&&id&&&${error.message}`
            );
        }
    }

    async reverceIntialBookingCancel(
        reverceIntialCancelBookingDto: ReverceIntialCancelBookingDto,
        admin: User
    ) {
        try {
            const { message, product_id } = reverceIntialCancelBookingDto;

            let booking = await getManager()
                .createQueryBuilder(Booking, "booking")
                .leftJoinAndSelect("booking.cart", "cart")
                .where(`booking.laytrip_booking_id = '${product_id}'`)
                .getOne();

            if (!booking) {
                throw new NotFoundException(`Booking ID not found.`);
            }

            let requests = await getManager()
                .createQueryBuilder(IntialCancelBooking, "intiat")
                .where(`booking_id = '${booking.id}'`)
                .getOne();

            if (!requests) {
                throw new NotFoundException(
                    `Booking cancelation request not found.`
                );
            }
            if (requests.status == IntialCancelationStatus.Approve) {
                throw new ConflictException(
                    `Given booking cancellation request already accepted`
                );
            }

            requests.updateBy = admin.userId;
            requests.message = message || null;
            requests.status = IntialCancelationStatus.Reverse;
            requests.updatedDate = new Date();

            await requests.save();
            Activity.logActivity(
                admin.userId,
                "Intiate-cancellation",
                "Intiate cancelation request reverced for booking id : " +
                product_id
            );
            return {
                message: `Intial cancellation request reverce successfully.`,
            };
        } catch (error) {
            if (typeof error.response !== "undefined") {
                //console.log('m');
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new NotFoundException(
                `${error.message}&&&id&&&${error.message}`
            );
        }
    }
}
