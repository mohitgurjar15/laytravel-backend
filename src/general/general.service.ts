import { Injectable, NotFoundException } from '@nestjs/common';
import {getManager} from "typeorm";
import { Countries } from 'src/entity/countries.entity';
import { States } from 'src/entity/states.entity';

@Injectable()
export class GeneralService {

    async getAllCountry(){
        const countries = await getManager()
        .createQueryBuilder(Countries, "countries")
        .select(["countries.id","countries.name","countries.iso3","countries.iso2","countries.phonecode","countries.currency"])
        .where("countries.flag = :flag", { flag: 1 })
        .getMany();
        return countries;
    }

    async getCountryDetails(id){

        const country = await getManager()
        .createQueryBuilder(Countries, "countries")
        .where("countries.flag = :flag and countries.id=:id", { flag: 1, id })
        .getOne();

        if(country)
            return country;
        else
            throw new NotFoundException(`No country found&&&id`)
    }

    async getStates(id){

        const states = await getManager()
        .createQueryBuilder(States, "states")
        .select(["states.id","states.name","states.iso2"])
        .where("states.countryId=:id and states.flag = :flag", { id, flag: 1 })
        .orderBy(`states.name`)
        .getMany();

        if(states.length)
            return states;
        else    
            throw new NotFoundException(`No states found&&&id`)
    }

    async getStateDetails(id){

        const state = await getManager()
        .createQueryBuilder(States, "states")
        .where("states.flag = :flag and states.id=:id", { flag: 1, id })
        .getOne();

        if(state)
            return state;
        else
            throw new NotFoundException(`No state found&&&id`)
    }
}
