import { getConnection, getManager } from "typeorm";
import { Module } from "src/entity/module.entity";
import { Currency } from "src/entity/currency.entity";
import * as xml2js from "xml2js";
import { PaymentGateway } from "src/entity/payment-gateway.entity";
import { PricelineHotelIds } from "src/entity/hotel_ids.entity";

export class Generic {
    static async getCredential(module_name: string) {
        const credentail = await getConnection()
            .createQueryBuilder()
            .select([
                "module.mode",
                "module.testCredential",
                "module.liveCredential",
            ])
            .from(Module, "module")
            .where("module.name = :module_name", { module_name })
            .cache(`${module_name}_module`, 43200000)
            .getOne();
        return credentail;
    }

    static async getAmountTocurrency(code: string = 'USD') {

        code = typeof code == 'string' ? code : 'USD'
        
        const currencyDetails = await getConnection()
            .createQueryBuilder()
            .select(["currency.code", "currency.symbol", "currency.liveRate"])
            .from(Currency, "currency")
            .where("currency.code = :code", { code: code || 'USD' })
            .getOne();
        console.log('currencyDetails',currencyDetails)
        return currencyDetails;
    }

    static convertAmountTocurrency(amount, rate = null) {
        if (rate) {
            return amount * rate;
        }
        return amount;
    }

    static async xmlToJson(xmlData) {
        const result = await xml2js.parseStringPromise(xmlData, {
            normalizeTags: true,
            ignoreAttrs: true,
        });
        return result;
    }

    static formatPriceDecimal(price: number) {

        if (typeof price != 'number'){
            price = parseFloat(price);
        }
        //console.log(" price", price);
         return Number(price.toFixed(2));
    }

    static async getPaymentCredential() {
        const gatewayName = "stripe";
        const credentail = await getConnection()
            .createQueryBuilder()
            .select(["gateway.gatewayName", "gateway.paymentMode"])
            .addSelect(
                `CASE
                        WHEN "gateway"."payment_mode" = '0'  THEN "gateway"."test_credentials"
                        WHEN "gateway"."payment_mode" = '1'  THEN "gateway"."live_credentials"
                    END`,
                "credentials"
            )
            .from(PaymentGateway, "gateway")
            .where("gateway.gateway_name = :gatewayName", {
                gatewayName,
            })
            .getRawOne();
        return credentail;
    }

    static convertKGtoLB(weight) {
        return Number((weight * 2.2).toFixed(2));
    }

    static async getRefidFromHotelId(hotelId: string) {
        const hotel = await getManager()
            .createQueryBuilder(PricelineHotelIds, "pricelineIds")
            .where(`hotel_id = :hotelId`, { hotelId })
            .getOne();
        
        return hotel?.refId2;
        //return '9033'
    }
}
