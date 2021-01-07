import { Injectable, NotFoundException } from '@nestjs/common';
import { getConnection, getManager } from "typeorm";
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

    async massCommunication(dto: MassCommunicationDto) {
        const { subject, email_body, role } = dto

        // let emails = await getManager()
        //     .createQueryBuilder(User, "user")
        //     .select([
        //         "user.email"
        //     ])
        //     .where(`"user"."is_deleted"=:is_deleted`, {
        //         is_deleted: false,
        //     })
        //     .andWhere(role ? `"user"."role_id" in (:...role) ` : `1=1`, {
        //         role
        //     })
        //     .getMany();

        let emails = [{
            email: 'parthvirani@itoneclick.com'
        }, {
            email: 'suresh@itoneclick.com'
        }, {
            email: 'jaymees@itoneclick.com'
        }]
        var allemail = '';
        for await (const email of emails) {
            // allemail += email.email + ','
            this.mailerService
                .sendMail({
                    to: email.email,
                    from: mailConfig.from,
                    cc: mailConfig.BCC,
                    subject: subject,
                    html: email_body,
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
}
