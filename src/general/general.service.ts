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
import { massCommunicationMail } from "src/config/email_template/mass-communication.html";
import { TestTemplete } from "src/config/new_email_templete/test.html";
import { LaytripFlightBookingConfirmtionMail } from "src/config/new_email_templete/flight-booking-confirmation.html";
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
import { BookingReminderMail } from "src/config/email_template/booking-reminder-mail.html";
import { LaytripInquiryAutoReplayMail } from "src/config/new_email_templete/laytrip_inquiry-auto-replay-mail.html";
import { TravelProviderReconfirmationMail } from "src/config/new_email_templete/flight-reconfirmation.html";
import { FlightChangeAsperUserRequestMail } from "src/config/new_email_templete/flight-change-as-per-user-request.html";
import { LaytripFlightReminderMail } from "src/config/new_email_templete/flight-reminder.html";
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

    async ListMassCommunication() {
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
                const travelerInfo: TravelerInfoModel = {
                    firstName: userData.firstName,
                    passportExpiry: userData.passportExpiry,
                    passportNumber: userData.passportNumber,
                    lastName: userData.lastName,
                    email: userData.email,
                    phoneNo: userData.phoneNo,
                    countryCode: userData.countryCode,
                    dob: userData.dob,
                    countryId: userData.countryId,
                    gender: userData.gender,
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

        // let mail1 = await CartDataUtility.CartMailModelDataGenerate(
        //     fullBookingConfirm
        // );

        

        //     await this.mailerService
        //         .sendMail({
        //             to: email,
        //             from: mailConfig.from,
        //             // bcc: mailConfig.BCC,
        //             subject: "BOOKING ID LTCKLUSXYJL CONFIRMATION",
        //             html: await LaytripCartBookingConfirmtionMail(mail1.param),
        //         })
        //         .then((res) => {
        //             console.log("res", res);
        //         })
        //         .catch((err) => {
        //             console.log("err", err);
        //         });

        // let mail2 = await CartDataUtility.CartMailModelDataGenerate(
        //     partialBooking
        // );

        // await this.mailerService
        //     .sendMail({
        //         to: email,
        //         from: mailConfig.from,
        //         bcc: mailConfig.BCC,
        //         subject: "BOOKING ID LTCKM3BOFDB CONFIRMATION",
        //         html: await LaytripCartBookingConfirmtionMail(mail2.param),
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
        //         subject: `BOOKING ID ${partialBooking} UPCOMING PAYMENT REMINDER`,
        //         html: await LaytripPaymentReminderTemplete({
        //             userName: "Parth",
        //             amount: "$55.40",
        //             date: "June 20, 2021",
        //             bookingId: partialBooking,
        //         }),
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
        //         subject: `BOOKING ID ${partialBooking} MISSED PAYMENT REMINDER #1`,
        //         html: await LaytripMissedPaymentTemplete({
        //             userName: "Parth",
        //             amount: "$55.40",
        //             date: "June 20, 2021",
        //             bookingId: partialBooking,
        //             try: 1,
        //             nextDate: "June 23, 2021",
        //         }),
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
        //         subject: `BOOKING ID ${partialBooking} MISSED PAYMENT REMINDER #2`,
        //         html: await LaytripMissedPaymentTemplete({
        //             userName: "Parth",
        //             amount: "$55.40",
        //             date: "June 20, 2021",
        //             bookingId: partialBooking,
        //             try: 2,
        //             nextDate: "June 27, 2021",
        //         }),
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
        //         subject: `BOOKING ID ${partialBooking} FINAL MISSED PAYMENT REMINDER #3`,
        //         html: await LaytripMissedPaymentTemplete({
        //             userName: "Parth",
        //             amount: "$55.40",
        //             date: "June 20, 2021",
        //             bookingId: partialBooking,
        //             try: 3,
        //             nextDate: "June 30, 2021",
        //         }),
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
        //         subject: `BOOKING ID ${partialBooking} NOTICE OF DEFAULT AND CANCELLATION`,
        //         html: await LaytripPaymentFailedTemplete({
        //             userName: "Parth",
        //             amount: "$55.40",
        //             date: "June 20, 2021",
        //             bookingId: partialBooking,
        //             try: 4,
        //         }),
        //     })
        //     .then((res) => {
        //         console.log("res", res);
        //     })
        //     .catch((err) => {
        //         console.log("err", err);
        //     });
        // let mail8 = await CartDataUtility.CartMailModelDataGenerate(
        //     partialBooking
        // );

        // await this.mailerService
        //     .sendMail({
        //         to: email,
        //         from: mailConfig.from,
        //         bcc: mailConfig.BCC,
        //         subject: `BOOKING ID ${partialBooking} COMPLETION NOTICE`,
        //         html: await LaytripCartBookingComplationMail(mail8.param),
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
        //         subject: `BOOKING ID ${partialBooking} PROVIDER CANCELLATION NOTICE`,
        //         html: await LaytripCancellationTravelProviderMail({
        //             userName: "Parth",
        //             bookingId: partialBooking,
        //         }),
        //     })
        //     .then((res) => {
        //         console.log("res", res);
        //     })
        //     .catch((err) => {
        //         console.log("err", err);
        //     });
        // let mail10 = await CartDataUtility.cartData(
        //     "7135e9e5-63cd-4188-95fe-bef628881695"
        // );
        // await this.mailerService
        //     .sendMail({
        //         to: email,
        //         from: mailConfig.from,
        //         bcc: mailConfig.BCC,
        //         subject: `BOOKING ID ${partialBooking} INSTALLMENT RECEIVED`,
        //         html: await LaytripInstallmentRecevied({
        //             userName: "Parth",
        //             orderId: partialBooking,
        //             date: "March 11, 2021",
        //             amount: 5.66,
        //             installmentId: 3,
        //             complitedAmount: mail10.paidAmountNumeric,
        //             totalAmount: mail10.totalAmounNumerict,
        //             currencySymbol: "$",
        //             nextDate: "March 18, 2021",
        //         }),
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
        //         subject: `BOOKING ID ${partialBooking} CUSTOMER CANCELLATION`,
        //         html: await LaytripBookingCancellationCustomerMail({
        //             username: "Parth",
        //             bookingId: partialBooking,
        //         }),
        //     })
        //     .then((res) => {
        //         console.log("res", res);
        //     })
        //     .catch((err) => {
        //         console.log("err", err);
        //     });
        let mail18 = await flightDataUtility.flightData(ConfirmFlight);
        // await this.mailerService
        //     .sendMail({
        //         to: email,
        //         from: mailConfig.from,
        //         bcc: mailConfig.BCC,
        //         subject: `BOOKING ID ${mail18.param.cart.cartId} CUSTOMER CHANGE`,
        //         html: await FlightChangeAsperUserRequestMail(mail18.param),
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
        //         subject: `BOOKING NOT COMPLETED`,
        //         html: await BookingNotCompletedMail({
        //             userName: "Parth",
        //         }),
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
        //         subject: `PASSWORD RESET`,
        //         html: await LaytripResetPasswordMail({
        //             username: "Parth",
        //         }),
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
        //         subject: `PAYMENT METHOD CHANGE CONFIRMATION`,
        //         html: await LaytripPaymentMethodChangeMail({
        //             username: "Parth",
        //         }),
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
        //         subject: `WELCOME TO LAYTRIP!`,
        //         html: await NewsLetterMail(),
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
        //         subject: `WELCOME TO LAYTRIP!`,
        //         html: await LaytripWelcomeBoardMail(),
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
        //         subject: `BOOKING ID ${mail18.param.cart.cartId} CHANGE BY TRAVEL PROVIDER`,
        //         html: await TravelProviderConfiramationMail(mail18.param),
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
        //         subject: `PASSWORD RESET ONE TIME PIN`,
        //         html: await LaytripForgotPasswordMail({
        //             username: "Parth",
        //             otp: 645343,
        //         }),
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
        //         subject: `Verify your Account`,
        //         html: await LaytripVerifyEmailIdTemplete({
        //             username: "Parth",
        //             otp: 254656,
        //         }),
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
        //         subject: `BOOKING ID ${partialBooking} REMINDER FOR YOUR UPCOMING TRIP`,
        //         html: await LaytripFlightReminderMail(mail18.param),
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
        //         // bcc: mailConfig.BCC,
        //         subject: "HOW DID WE DO?",
        //         html: await HowDidWeDoMail({
        //             username: "Parth",
        //             bookingId: "LTCKM3BOFDB",
        //         }),
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
        //         subject: `COVID TRAVEL UPDATE`,
        //         html: await LaytripCovidUpdateMail({
        //             username: "Parth",
        //         }),
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
                subject: `MESSAGE RECEIVED`,
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
        //         subject: `TRAVEL PROVIDER RESERVATION CONFIRMATION #${mail18.param.flight[0].droups[0].depature.pnr_no}`,
        //         html: await LaytripFlightBookingConfirmtionMail(mail18.param),
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
                subject: `REMINDER - TRAVEL PROVIDER RESERVATION CONFIRMATION #${mail18.param.flight[0].droups[0].depature.pnr_no}`,
                html: await TravelProviderReconfirmationMail(mail18.param),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });
    }
}
