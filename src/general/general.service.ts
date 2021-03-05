import { Injectable, NotFoundException } from '@nestjs/common';
import { getConnection, getManager, LessThan } from "typeorm";
import { Countries } from 'src/entity/countries.entity';
import { States } from 'src/entity/states.entity';
import * as geoip from 'geoip-lite';
import * as publicIp from 'public-ip'
import { Cities } from 'src/entity/cities.entity';
import { Airport } from 'src/entity/airport.entity';
import { MassCommunicationDto } from './dto/send-mass-communication.dto';
import { User } from 'src/entity/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import * as config from "config";
import { Role } from 'src/enum/role.enum';
import { massCommunicationMail } from 'src/config/email_template/mass-communication.html';
import { TestTemplete } from 'src/config/new_email_templete/test.html';
import { LaytripFlightBookingConfirmtionMail } from 'src/config/new_email_templete/flight-booking-confirmation.html';
import { MassCommunication } from 'src/entity/mass-communication.entity';
import { contentType } from 'src/config/content-type';
import { extname } from 'path';
import { LaytripCovidUpdateMail } from 'src/config/new_email_templete/laytrip_covid-mail.html';
import { LaytripCancellationTravelProviderMail } from 'src/config/new_email_templete/laytrip_cancellation-travel-provider-mail.html';
import { LaytripBookingCancellationCustomerMail } from 'src/config/new_email_templete/laytrip_booking-cancellation-customer-mail.html';
import { LaytripPaymentMethodChangeMail } from 'src/config/new_email_templete/laytrip_payment-method-change-mail.html';
import { LaytripVerifyEmailIdTemplete } from 'src/config/new_email_templete/laytrip_email-id-verify-mail.html';
const mailConfig = config.get("email");

@Injectable()
export class GeneralService {

    constructor(private readonly mailerService: MailerService) { }

    async getAllCountry() {
        const countries = await getManager()
            .createQueryBuilder(Countries, "countries")
            .select(["countries.id", "countries.name", "countries.iso3", "countries.iso2", "countries.phonecode", "countries.currency"])
            .where("countries.flag = :flag", { flag: 1 })
            .getMany();
        return countries;
    }

    async getCountryDetails(id) {

        const country = await getManager()
            .createQueryBuilder(Countries, "countries")
            .where("countries.flag = :flag and countries.id=:id", { flag: 1, id })
            .getOne();

        if (country)
            return country;
        else
            throw new NotFoundException(`No country found&&&id`)
    }

    async getStates(id) {

        const states = await getManager()
            .createQueryBuilder(States, "states")
            .select(["states.id", "states.name", "states.iso2"])
            .where("states.countryId=:id and states.flag = :flag", { id, flag: 1 })
            .orderBy(`states.name`)
            .getMany();

        if (states.length)
            return states;
        else
            throw new NotFoundException(`No states found&&&id`)
    }

    async getStateDetails(id) {

        const state = await getManager()
            .createQueryBuilder(States, "states")
            .where("states.flag = :flag and states.id=:id", { flag: 1, id })
            .getOne();

        if (state)
            return state;
        else
            throw new NotFoundException(`No state found&&&id`)
    }

    async getUserLocation(req) {

        let ip = req.ip;
        let geo = geoip.lookup(ip);
        if (typeof geo != 'undefined' && geo != null && Object.keys(geo).length) {

            if (geo.country != '') {

                let query = getManager()
                    .createQueryBuilder(Airport, "airport");

                let country = await getManager()
                    .createQueryBuilder(Countries, "countries")
                    //.select(['"id"','"name"','"iso3"','"iso2"','"phonecode"','"currency"','"flag'])
                    .where("countries.flag = :flag and countries.iso2=:iso2", { flag: 1, iso2: geo.country })
                    .getOne();
                query = query.andWhere(`("airport"."country"=:country or "airport"."country"=:country_code)`, { country: country.name, country_code: country.iso3 });
                let state: any = {}
                if (geo.region != '') {
                    state = await getManager()
                        .createQueryBuilder(States, "states")
                        .where("states.flag = :flag and states.iso2=:iso2 and states.country_code=:country_code", { flag: 1, iso2: geo.region, country_code: geo.country })
                        .getOne();

                }

                let city: any = {}
                if (geo.city != '') {
                    city = await getManager()
                        .createQueryBuilder(Cities, "cities")
                        .where("cities.flag = :flag and cities.state_code=:state_code and cities.name=:name", { flag: 1, state_code: geo.region, name: geo.city })
                        .getOne();

                    console.log(city);
                    if (typeof city != 'undefined')
                        query = query.andWhere(`"airport"."city"=:city`, { city: city.name });
                }

                let airport = await query.getOne();

                return {
                    ip,
                    timezone: geo.timezone,
                    'country': country || {},
                    'state': state || {},
                    'city': city || {},
                    'airport': airport || {}
                }
            }
        }
        else {
            throw new NotFoundException(`No location found`)
        }
    }

    async massCommunication(dto: MassCommunicationDto, user: User, files, siteUrl) {
        const { subject, email_body } = dto
        const role = [Role.FREE_USER, Role.PAID_USER]
       

        let emails = [{
            firstName : 'parth',
            lastName : 'Virani',
            email: 'parthvirani@itoneclick.com'
        }, {
            firstName : 'suresh',
            lastName : 'suthar',
            email: 'suresh@itoneclick.com'
        }, {
            firstName : 'jaymeesh',
            lastName : 'donga',
            email: 'jaymees@itoneclick.com'
        }, {
            firstName : 'jimeet@itoneclick.com',
            lastName : '',
            email: 'jimeet@itoneclick.com'
        }]

        // const emails = await getManager()
        //     .createQueryBuilder(User, "user")
        //     .select(`user.email,
        //         user.firstName,
        //         user.lastName`)
        //     .where(`email != null AND email != '' AND role_id IN (${Role.FREE_USER,Role.PAID_USER})`)
        //     .getMany();
            


        var allemail = '';
        let attachments = []
        const fs = require("fs");
        var path = require('path');
        let filesName = {
            file : []
        }
        if (typeof files.file != "undefined") {
            for await (const file of files.file) {
                
                filesName.file.push(file.filename)
                var fileName = path.resolve('/var/www/html/logs/mail/'+file.filename);
                const fileExtName = extname(file.originalname)
                const cn = contentType[fileExtName]
                console.log(cn);
                
                const attachment =
                {
                    content: fs.readFileSync(fileName).toString('base64'),
                    filename: file.filename,
                    contentType : cn
                }
                attachments.push(attachment)
            }

        }

        const log = new MassCommunication
        log.subject = subject
        log.message = email_body
        log.createdDate = new Date()
        log.createdBy = user.userId
        log.attachment = JSON.stringify(filesName)
        log.total = emails.length
        log.users = emails

        await log.save();

        for await (const email of emails) {
            // allemail += email.email + ','
            this.mailerService
                .sendMail({
                    to: email.email,
                    from: mailConfig.from,
                    bcc: mailConfig.BCC,
                    subject: subject,
                    attachments: attachments,
                    html: await massCommunicationMail({ header: subject, body: email_body }),
                })
                .then((res) => {
                    console.log("res", res);
                })
                .catch((err) => {
                    console.log("err", err);
                });
        }


        return {
            message: `email send succesfully`
        }
    }

    async testEmail(dto: MassCommunicationDto, email) {
        const { subject, email_body } = dto

        var allemail = '';

        // allemail += email.email + ','
        this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: 'BOOKING ID LTCA678GFJ PROVIDER CANCELLATION NOTICE',
                html: await LaytripCancellationTravelProviderMail({userName:'Parth',bookingId:'LTCA678GFJ'})//await LaytripFlightBookingConfirmtionMail(),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });

            this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: 'BOOKING ID LTCA678GFJ CUSTOMER CANCELLATION',
                html: await LaytripBookingCancellationCustomerMail({username:'Parth',bookingId:'LTCA678GFJ'})//await LaytripFlightBookingConfirmtionMail(),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });

            this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                subject: 'PAYMENT METHOD CHANGE CONFIRMATION',
                html: await LaytripPaymentMethodChangeMail({username:'Parth',otp:324232})//await LaytripFlightBookingConfirmtionMail(),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });




        return {
            message: `email send succesfully`
        }
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
                "user.roleId"
            ])
            .orderBy("log.id", "DESC")
            .getManyAndCount();
        if (!result.length) {
            throw new NotFoundException(`No Log found.`);
        }

        for await (const log of result) {
            const attachment = JSON.parse(log.attachment)

            if(attachment?.file.length){
                for (let index = 0; index < attachment?.file.length; index++) {
                    const file = attachment?.file[index];
                    attachment.file[index] = 'https://laytrip.com/logs/mail/' + file
                }
            }
            log.attachment = attachment
        }
        return { data: result, TotalReseult: count };
    }
}
