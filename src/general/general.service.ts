import { Injectable, NotFoundException } from "@nestjs/common";
import { getConnection, getManager, LessThan } from "typeorm";
import { Countries } from "src/entity/countries.entity";
import { States } from "src/entity/states.entity";
import * as geoip from "geoip-lite";
import * as publicIp from "public-ip";
import { Cities } from "src/entity/cities.entity";
import { Airport } from "src/entity/airport.entity";
import { MassCommunicationDto } from "./dto/send-mass-communication.dto";
import { User } from "src/entity/user.entity";
import { MailerService } from "@nestjs-modules/mailer";
import * as config from "config";
import { Role } from "src/enum/role.enum";
import * as moment from "moment";
import { massCommunicationMail } from "src/config/new_email_templete/mass-communication.html";
import { TestTemplete } from "src/config/new_email_templete/test.html";
import { MassCommunication } from "src/entity/mass-communication.entity";
import { contentType } from "src/config/content-type";
import { extname } from "path";
import { LaytripCovidUpdateMail } from "src/config/new_email_templete/laytrip_covid-mail.html";
import { LaytripCancellationTravelProviderMail } from "src/config/new_email_templete/laytrip_cancellation-travel-provider-mail.html";
import { LaytripBookingCancellationCustomerMail } from "src/config/new_email_templete/laytrip_booking-cancellation-customer-mail.html";
import { LaytripPaymentMethodChangeMail } from "src/config/new_email_templete/laytrip_payment-method-change-mail.html";
import { LaytripVerifyEmailIdTemplete } from "src/config/new_email_templete/laytrip_email-id-verify-mail.html";
import { TravelerInfo } from "src/entity/traveler-info.entity";
import { TravelerInfoModel } from "src/config/email_template/model/traveler-info.model";
import { BookingNotCompletedMail } from "src/config/new_email_templete/laytrip_booking-not-completed-mail.html";
import { LaytripResetPasswordMail } from "src/config/new_email_templete/laytrip_reset-password-mail.html";
import { LaytripWelcomeBoardMail } from "src/config/new_email_templete/laytrip_welcome-board-mail.html";
import { LaytripForgotPasswordMail } from "src/config/new_email_templete/laytrip_forgot-password-mail.html";
import { HowDidWeDoMail } from "src/config/new_email_templete/laytipr_complete-trip-reminder-mail.html";
import { LaytripCartBookingConfirmtionMail } from "src/config/new_email_templete/cart-booking-confirmation.html";
const mailConfig = config.get("email");
import { CartDataUtility } from "src/utility/cart-data.utility";
import { LaytripPaymentReminderTemplete } from "src/config/new_email_templete/payment-reminder.html";
import { LaytripMissedPaymentTemplete } from "src/config/new_email_templete/missed-installment.html";
import { LaytripPaymentFailedTemplete } from "src/config/new_email_templete/installment-default.html";
import { LaytripCartBookingComplationMail } from "src/config/new_email_templete/cart-completion-mail.html";
import { LaytripInstallmentRecevied } from "src/config/new_email_templete/laytrip_installment-recived.html";
import { NewsLetterMail } from "src/config/new_email_templete/news-letters.html";
import { flightDataUtility } from "src/utility/flight-data.utility";
import { TravelProviderConfiramationMail } from "src/config/new_email_templete/travel-provider-confirmation.html";
import { LaytripInquiryAutoReplayMail } from "src/config/new_email_templete/laytrip_inquiry-auto-replay-mail.html";
import { CartChangeAsperUserRequestMail } from "src/config/new_email_templete/cart-changes-as-per-user-req.dto";
import { TravelProviderReminderMail } from "src/config/new_email_templete/cart-reminder.mail";
import { LaytripCartBookingTravelProviderConfirmtionMail } from "src/config/new_email_templete/cart-traveler-confirmation.html";
import { LaytripTripReminderMail } from "src/config/new_email_templete/trip-reminder.dto";
import { ListMassCommunicationDto } from "./dto/list-mass-communication.dto";
import { NotificationAlertUtility } from "src/utility/notification.utility";
import { AdminNewBookingMail } from "src/config/admin-email-notification-templetes/new-booking.html";
import { AdminStopLossNotificationMail } from "src/config/admin-email-notification-templetes/stop-loss-notification.html";
import { Rule80perNotificationMail } from "src/config/admin-email-notification-templetes/rule-80-per-notification.html";
import { EnterInDeadlineMail } from "src/config/admin-email-notification-templetes/enter-in-deadline.html";
import { BookingCancellationNotificationMail } from "src/config/admin-email-notification-templetes/booking-cancellation-notification.dto";
import { BookingChangeBySupplierNotificationMail } from "src/config/admin-email-notification-templetes/booking-change-by-supplier-notification.html";
import { BookingRunoutNotificationMail } from "src/config/admin-email-notification-templetes/booking-run-out-notification.html";
import { ValuationPercentageUtility } from "src/utility/valuation-per.utility";
@Injectable()
export class GeneralService {
    constructor(private readonly mailerService: MailerService) {}

    async getAllCountry() {
        const countries = await getManager()
            .createQueryBuilder(Countries, "countries")
            .select([
                "countries.id",
                "countries.name",
                "countries.iso3",
                "countries.iso2",
                "countries.phonecode",
                "countries.currency",
            ])
            .where("countries.flag = :flag", { flag: 1 })
            .getMany();
        return countries;
    }

    async getCountryDetails(id) {
        const country = await getManager()
            .createQueryBuilder(Countries, "countries")
            .where("countries.flag = :flag and countries.id=:id", {
                flag: 1,
                id,
            })
            .getOne();

        if (country) return country;
        else throw new NotFoundException(`No country found&&&id`);
    }

    async getStates(id) {
        const states = await getManager()
            .createQueryBuilder(States, "states")
            .select(["states.id", "states.name", "states.iso2"])
            .where("states.countryId=:id and states.flag = :flag", {
                id,
                flag: 1,
            })
            .orderBy(`states.name`)
            .getMany();

        if (states.length) return states;
        else throw new NotFoundException(`No states found&&&id`);
    }

    async getStateDetails(id) {
        const state = await getManager()
            .createQueryBuilder(States, "states")
            .where("states.flag = :flag and states.id=:id", { flag: 1, id })
            .getOne();

        if (state) return state;
        else throw new NotFoundException(`No state found&&&id`);
    }

    async getUserLocation(req) {
        let ip = req.ip;
        let geo = geoip.lookup(ip);
        if (
            typeof geo != "undefined" &&
            geo != null &&
            Object.keys(geo).length
        ) {
            if (geo.country != "") {
                let query = getManager().createQueryBuilder(Airport, "airport");

                let country = await getManager()
                    .createQueryBuilder(Countries, "countries")
                    //.select(['"id"','"name"','"iso3"','"iso2"','"phonecode"','"currency"','"flag'])
                    .where("countries.flag = :flag and countries.iso2=:iso2", {
                        flag: 1,
                        iso2: geo.country,
                    })
                    .getOne();
                query = query.andWhere(
                    `("airport"."country"=:country or "airport"."country"=:country_code)`,
                    { country: country.name, country_code: country.iso3 }
                );
                let state: any = {};
                if (geo.region != "") {
                    state = await getManager()
                        .createQueryBuilder(States, "states")
                        .where(
                            "states.flag = :flag and states.iso2=:iso2 and states.country_code=:country_code",
                            {
                                flag: 1,
                                iso2: geo.region,
                                country_code: geo.country,
                            }
                        )
                        .getOne();
                }

                let city: any = {};
                if (geo.city != "") {
                    city = await getManager()
                        .createQueryBuilder(Cities, "cities")
                        .where(
                            "cities.flag = :flag and cities.state_code=:state_code and cities.name=:name",
                            { flag: 1, state_code: geo.region, name: geo.city }
                        )
                        .getOne();

                    console.log(city);
                    if (typeof city != "undefined")
                        query = query.andWhere(`"airport"."city"=:city`, {
                            city: city.name,
                        });
                }

                let airport = await query.getOne();

                return {
                    ip,
                    timezone: geo.timezone,
                    country: country || {},
                    state: state || {},
                    city: city || {},
                    airport: airport || {},
                };
            }
        } else {
            throw new NotFoundException(`No location found`);
        }
    }

    async massCommunication(
        dto: MassCommunicationDto,
        user: User,
        files,
        siteUrl
    ) {
        const { subject, email_body } = dto;
        const role = [Role.FREE_USER, Role.PAID_USER];

        let emails = [
            {
                firstName: "parth",
                lastName: "Virani",
                email: "parthvirani@itoneclick.com",
            },
            {
                firstName: "suresh",
                lastName: "suthar",
                email: "suresh@itoneclick.com",
            },
            {
                firstName: "jaymeesh",
                lastName: "donga",
                email: "jaymees@itoneclick.com",
            },
            {
                firstName: "jimeet@itoneclick.com",
                lastName: "",
                email: "jimeet@itoneclick.com",
            },
        ];

        // const emails = await getManager()
        //     .createQueryBuilder(User, "user")
        //     .select(`user.email,
        //         user.firstName,
        //         user.lastName`)
        //     .where(`email != null AND email != '' AND role_id IN (${Role.FREE_USER,Role.PAID_USER})`)
        //     .getMany();

        var allemail = "";
        let attachments = [];
        const fs = require("fs");
        var path = require("path");
        let filesName = {
            file: [],
        };
        if (typeof files.file != "undefined") {
            for await (const file of files.file) {
                filesName.file.push(file.filename);
                var fileName = path.resolve(
                    "/var/www/html/logs/mail/" + file.filename
                );
                const fileExtName = extname(file.originalname);
                const cn = contentType[fileExtName];
                console.log(cn);

                const attachment = {
                    content: fs.readFileSync(fileName).toString("base64"),
                    filename: file.filename,
                    contentType: cn,
                };
                attachments.push(attachment);
            }
        }

        const log = new MassCommunication();
        log.subject = subject;
        log.message = email_body;
        log.createdDate = new Date();
        log.createdBy = user.userId;
        log.attachment = JSON.stringify(filesName);
        log.total = emails.length;
        log.users = emails;

        await log.save();

        for await (const email of emails) {
            // allemail += email.email + ','
            await this.mailerService
                .sendMail({
                    to: email.email,
                    from: mailConfig.from,
                    bcc: mailConfig.BCC,
                    subject: subject,
                    attachments: attachments,
                    html: await massCommunicationMail({
                        header: subject,
                        body: email_body,
                    }),
                })
                .then((res) => {
                    console.log("res", res);
                })
                .catch((err) => {
                    console.log("err", err);
                });
        }

        return {
            message: `email send succesfully`,
        };
    }

    async ListMassCommunication(paginationOption: ListMassCommunicationDto) {
        const { page_no, search, limit } = paginationOption;

        const take = limit || 10;
        const skip = (page_no - 1) * limit || 0;
        const keyword = search || "";

        let where;
        if (keyword) {
            where = `("log"."subject" ILIKE '%${keyword}%') or ("user"."email" ILIKE '%${keyword}%')`;
        } else {
            where = `1=1`;
        }

        const [result, count] = await getManager()
            .createQueryBuilder(MassCommunication, "log")
            .leftJoinAndSelect("log.user", "user")
            .select([
                "user.userId",
                "user.firstName",
                "user.lastName",
                "user.email",
                "log.id",
                "log.message",
                "log.subject",
                "log.createdDate",
                "log.attachment",
                "log.total",
                "log.users",
                "user.roleId",
            ])
            .where(where)
            .take(take)
            .skip(skip)
            .orderBy("log.id", "DESC")
            .getManyAndCount();
        if (!result.length) {
            throw new NotFoundException(`No Log found.`);
        }

        for await (const log of result) {
            const attachment = JSON.parse(log.attachment);

            if (attachment?.file.length) {
                for (let index = 0; index < attachment?.file.length; index++) {
                    const file = attachment?.file[index];
                    attachment.file[index] =
                        "https://laytrip.com/logs/mail/" + file;
                }
            }
            log.attachment = attachment;
        }
        return { data: result, TotalReseult: count };
    }

    async updateTravelerInfo() {
        const travelers = await getConnection()
            .createQueryBuilder(TravelerInfo, "traveler")
            //.where(`"traveler_info" = null`)
            .getMany();
        for await (var traveler of travelers) {
            if (typeof traveler.userId) {
                var travelerId = traveler.userId;
                const userData = await getConnection()
                    .createQueryBuilder(User, "user")
                    .where(`"user_id" =:user_id`, { user_id: travelerId })
                    .getOne();
                var birthDate = new Date(userData.dob);
                var age = moment(new Date()).diff(moment(birthDate), "years");

                var user_type = "";
                if (age < 2) {
                    user_type = "infant";
                } else if (age < 12) {
                    user_type = "child";
                } else {
                    user_type = "adult";
                }
                const travelerInfo: TravelerInfoModel = {
                    firstName: userData.firstName,
                    passportExpiry: userData.passportExpiry || "",
                    passportNumber: userData.passportNumber || "",
                    lastName: userData.lastName || "",
                    email: userData.email || "",
                    phoneNo: userData.phoneNo || "",
                    countryCode: userData.countryCode || "",
                    dob: userData.dob,
                    countryId: userData.countryId,
                    gender: userData.gender,
                    age: age,
                    user_type: user_type,
                };
                await getConnection()
                    .createQueryBuilder()
                    .update(TravelerInfo)
                    .set({ travelerInfo: travelerInfo })
                    .where("id = :id", { id: traveler.id })
                    .execute();
            }
        }
    }

    async testEmail(email) {
        let fullBookingConfirm = "LTCKLUSXYJL";
        let partialBooking = "LTCKM3BOFDB";
        let ConfirmFlight = "LTFKM3BQ5QW";

        let mail1 = await CartDataUtility.CartMailModelDataGenerate(
            fullBookingConfirm
        );

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                // bcc: mailConfig.BCC,
                subject: "Booking ID LTCKLUSXYJL Confirmation",
                html: await LaytripCartBookingConfirmtionMail(mail1.param),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });

        let mail2 = await CartDataUtility.CartMailModelDataGenerate(
            partialBooking
        );

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: "Booking ID LTCKM3BOFDB Confirmation",
                html: await LaytripCartBookingConfirmtionMail(mail2.param),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Booking ID ${partialBooking} Upcoming Payment Reminder`,
                html: await LaytripPaymentReminderTemplete({
                    userName: "Parth",
                    amount: "$55.40",
                    date: "June 20, 2021",
                    bookingId: partialBooking,
                }),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Booking ID ${partialBooking} Missed Payment Reminder #1`,
                html: await LaytripMissedPaymentTemplete({
                    userName: "Parth",
                    amount: "$55.40",
                    date: "June 20, 2021",
                    bookingId: partialBooking,
                    try: 2,
                    nextDate: "June 23, 2021",
                }),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Booking ID ${partialBooking} Missed Payment Reminder #2`,
                html: await LaytripMissedPaymentTemplete({
                    userName: "Parth",
                    amount: "$55.40",
                    date: "June 20, 2021",
                    bookingId: partialBooking,
                    try: 3,
                    nextDate: "June 27, 2021",
                }),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Booking ID ${partialBooking} Final Missed Payment Reminder #3`,
                html: await LaytripMissedPaymentTemplete({
                    userName: "Parth",
                    amount: "$55.40",
                    date: "June 20, 2021",
                    bookingId: partialBooking,
                    try: 4,
                    nextDate: "June 30, 2021",
                }),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Booking ID ${partialBooking} Notice of Default and Cancellation`,
                html: await LaytripPaymentFailedTemplete({
                    userName: "Parth",
                    amount: "$55.40",
                    date: "June 20, 2021",
                    bookingId: partialBooking,
                    try: 5,
                }),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });
        let mail8 = await CartDataUtility.CartMailModelDataGenerate(
            partialBooking
        );

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Booking ID ${partialBooking} Completion Notice`,
                html: await LaytripCartBookingComplationMail(mail8.param),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Booking ID ${partialBooking} Provider Cancellation Notice`,
                html: await LaytripCancellationTravelProviderMail({
                    userName: "Parth",
                    bookingId: partialBooking,
                }),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });
        let mail10 = await CartDataUtility.cartData(
            "7135e9e5-63cd-4188-95fe-bef628881695"
        );
        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Booking ID ${partialBooking} Installment Recevied`,
                html: await LaytripInstallmentRecevied({
                    userName: "Parth",
                    orderId: partialBooking,
                    date: "March 11, 2021",
                    amount: 5.66,
                    installmentId: 3,
                    complitedAmount: mail10.paidAmountNumeric,
                    totalAmount: mail10.totalAmounNumerict,
                    currencySymbol: "$",
                    nextDate: "March 18, 2021",
                    pastDue: true,
                }),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Booking ID ${partialBooking} Customer Cancellation`,
                html: await LaytripBookingCancellationCustomerMail({
                    username: "Parth",
                    bookingId: partialBooking,
                }),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });
        let mail18 = await flightDataUtility.flightData(ConfirmFlight);
        // await this.mailerService
        //     .sendMail({
        //         to: email,
        //         from: mailConfig.from,
        //         bcc: mailConfig.BCC,
        //         subject: `Booking ID ${mail18.param.cart.cartId} Customer Change`,
        //         html: await FlightChangeAsperUserRequestMail(mail18.param),
        //     })
        //     .then((res) => {
        //         console.log("res", res);
        //     })
        //     .catch((err) => {
        //         console.log("err", err);
        //     });

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Booking Not Completed`,
                html: await BookingNotCompletedMail({
                    userName: "Parth",
                }),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Password Reset`,
                html: await LaytripResetPasswordMail({
                    username: "Parth",
                }),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Payment Method Change Confirmation`,
                html: await LaytripPaymentMethodChangeMail({
                    username: "Parth",
                }),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });
        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Welcome To Laytrip!`,
                html: await NewsLetterMail(),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });
        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Welcome to Laytrip!`,
                html: await LaytripWelcomeBoardMail(),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Booking ID ${mail18.param.cart.cartId} Change by Travel Provider`,
                html: await TravelProviderConfiramationMail(mail2.param),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });
        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Password Reset One Time Pin`,
                html: await LaytripForgotPasswordMail({
                    username: "Parth",
                    otp: 645343,
                }),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Verify your Account`,
                html: await LaytripVerifyEmailIdTemplete({
                    username: "Parth",
                    otp: 254656,
                }),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });

        // await this.mailerService
        //     .sendMail({
        //         to: email,
        //         from: mailConfig.from,
        //         bcc: mailConfig.BCC,
        //         subject: `Booking ID ${partialBooking} Reminder for your Upcoming Trip`,
        //         html: await LaytripFlightReminderMail(mail18.param),
        //     })
        //     .then((res) => {
        //         console.log("res", res);
        //     })
        //     .catch((err) => {
        //         console.log("err", err);
        //     });

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                // bcc: mailConfig.BCC,
                subject: "How Did We Do?",
                html: await HowDidWeDoMail({
                    username: "Parth",
                    bookingId: "LTCKM3BOFDB",
                }),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Covid Travel Update`,
                html: await LaytripCovidUpdateMail({
                    username: "Parth",
                }),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });
        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Message to Laytrip Received`,
                html: await LaytripInquiryAutoReplayMail({
                    username: "Parth",
                }),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });
        // await this.mailerService
        //     .sendMail({
        //         to: email,
        //         from: mailConfig.from,
        //         bcc: mailConfig.BCC,
        //         subject: `Travel Provider Reservation Confirmation #${mail18.param.flight[0].droups[0].depature.pnr_no}`,
        //         html: await LaytripFlightBookingConfirmtionMail(mail18.param),
        //     })
        //     .then((res) => {
        //         console.log("res", res);
        //     })
        //     .catch((err) => {
        //         console.log("err", err);
        //     });
        // await this.mailerService
        //     .sendMail({
        //         to: email,
        //         from: mailConfig.from,
        //         bcc: mailConfig.BCC,
        //         subject: `Reminder - Booking Number ${mail18.param.orderId}`,
        //         html: await TravelProviderReconfirmationMail(mail18.param),
        //     })
        //     .then((res) => {
        //         console.log("res", res);
        //     })
        //     .catch((err) => {
        //         console.log("err", err);
        //     });

        let pendingHotelId = "LTCKN5SO8HZ";

        let hotelmail = await CartDataUtility.CartMailModelDataGenerate(
            pendingHotelId
        );

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                // bcc: mailConfig.BCC,
                subject: `Booking ID ${pendingHotelId} Confirmation`,
                html: await LaytripCartBookingConfirmtionMail(hotelmail.param),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Booking ID ${pendingHotelId} Confirmation`,
                html: await LaytripCartBookingConfirmtionMail(hotelmail.param),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Booking ID ${pendingHotelId} Completion Notice`,
                html: await LaytripCartBookingComplationMail(hotelmail.param),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Booking ID ${pendingHotelId} Customer Change`,
                html: await CartChangeAsperUserRequestMail(hotelmail.param),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Booking ID ${pendingHotelId} Change by Travel Provider`,
                html: await TravelProviderConfiramationMail(hotelmail.param),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Travel Provider Reservation Confirmation`,
                html: await LaytripCartBookingTravelProviderConfirmtionMail(
                    hotelmail.param
                ),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });
        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Reminder - Booking Number ${pendingHotelId}`,
                html: await TravelProviderReminderMail(hotelmail.param),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Booking ID ${pendingHotelId} Reminder for your Upcoming Trip`,
                html: await LaytripTripReminderMail(hotelmail.param),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });
    }

    // async testEmail(email) {
    //     let partialBooking = "LTCKM3BOFDB";
    //     let fullBookingConfirm = "LTCKLUSXYJL";

    //     let ConfirmFlight = "LTFKM3BQ5QW";

    //     let mail1 = await CartDataUtility.CartMailModelDataGenerate(
    //         fullBookingConfirm
    //     );

    //     await this.mailerService
    //         .sendMail({
    //             to: email,
    //             from: mailConfig.from,
    //             // bcc: mailConfig.BCC,
    //             subject: "Booking ID LTCKLUSXYJL Confirmation",
    //             html: await LaytripCartBookingConfirmtionMail(mail1.param),
    //         })
    //         .then((res) => {
    //             console.log("res", res);
    //         })
    //         .catch((err) => {
    //             console.log("err", err);
    //         });

    //     let mail2 = await CartDataUtility.CartMailModelDataGenerate(
    //         partialBooking
    //     );

    //     await this.mailerService
    //         .sendMail({
    //             to: email,
    //             from: mailConfig.from,
    //             bcc: mailConfig.BCC,
    //             subject: "Booking ID LTCKM3BOFDB Confirmation",
    //             html: await LaytripCartBookingConfirmtionMail(mail2.param),
    //         })
    //         .then((res) => {
    //             console.log("res", res);
    //         })
    //         .catch((err) => {
    //             console.log("err", err);
    //         });

    //         let pendingHotelId = "LTCKN5SO8HZ";

    //     let hotelmail = await CartDataUtility.CartMailModelDataGenerate(
    //         pendingHotelId
    //     );

    //     await this.mailerService
    //         .sendMail({
    //             to: email,
    //             from: mailConfig.from,
    //             // bcc: mailConfig.BCC,
    //             subject: `Booking ID ${pendingHotelId} Confirmation`,
    //             html: await LaytripCartBookingConfirmtionMail(hotelmail.param),
    //         })
    //         .then((res) => {
    //             console.log("res", res);
    //         })
    //         .catch((err) => {
    //             console.log("err", err);
    //         });

    //     await this.mailerService
    //         .sendMail({
    //             to: email,
    //             from: mailConfig.from,
    //             bcc: mailConfig.BCC,
    //             subject: `Booking ID ${pendingHotelId} Confirmation`,
    //             html: await LaytripCartBookingConfirmtionMail(hotelmail.param),
    //         })
    //         .then((res) => {
    //             console.log("res", res);
    //         })
    //         .catch((err) => {
    //             console.log("err", err);
    //         });
    // }

    async adminEmailModel(id, email) {
        const data = await NotificationAlertUtility.notificationModelCreater(
            id
        );

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `New Customer Booking #${data.param.laytripBookingId} Made`,
                html: await AdminNewBookingMail(data.param),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Stop Loss Alert for BOOKING #${data.param.laytripBookingId}`,
                html: await AdminStopLossNotificationMail(data.param),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });
        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `80% Rule Alert for BOOKING #${data.param.laytripBookingId}`,
                html: await Rule80perNotificationMail(data.param),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });
        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Alert - ${data.param.routeType} Route Cost is Soon to Increase for BOOKING #${data.param.laytripBookingId}`,
                html: await EnterInDeadlineMail(data.param),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });
        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Alert - BOOKING #${data.param.laytripBookingId} got cancelled `,
                html: await BookingCancellationNotificationMail(data.param),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `BOOKING #${data.param.laytripBookingId} changed`,
                html: await BookingChangeBySupplierNotificationMail(data.param),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });

        await this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: `Alert - BOOKING #${data.param.laytripBookingId} ran out of seats`,
                html: await BookingRunoutNotificationMail(data.param),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });
    }

    async valuationPercentages(cart_id){
        return await ValuationPercentageUtility.calculations(cart_id)
    }
}
