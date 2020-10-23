
import { getConnection } from "typeorm";
import { Module } from "src/entity/module.entity";
import { Currency } from "src/entity/currency.entity";
import * as xml2js from 'xml2js';

export class  Generic{

    static async getCredential(module_name:string){

        const credentail = await getConnection()
            .createQueryBuilder()
            .select(["module.mode","module.testCredential","module.liveCredential"])
            .from(Module, "module")
            .where("module.name = :module_name", { module_name })
            .cache(`${module_name}_module`,43200000)
            .getOne();
        return credentail;
    }

    static async getAmountTocurrency(code:string){
        const currencyDetails = await getConnection()
            .createQueryBuilder()
            .select(["currency.code","currency.symbol","currency.liveRate"])
            .from(Currency, "currency")
            .where("currency.code = :code", { code })
            .getOne();
        return currencyDetails;
    }

    static convertAmountTocurrency(amount,rate=null){

        if(rate){
            return amount*rate;
        }
        return amount;
    }

    static async xmlToJson(xmlData)
    {
        const result = await xml2js.parseStringPromise(xmlData,{
            normalizeTags :true,
            ignoreAttrs:true
        });
        return result
    }
    
    static formatPriceDecimal(price){
        return Number(price.toFixed(2))
    }
}