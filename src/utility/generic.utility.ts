import { getConnection, getManager } from "typeorm";
import { Module } from "src/entity/module.entity";
import { Currency } from "src/entity/currency.entity";
import * as xml2js from "xml2js";
import { PaymentGateway } from "src/entity/payment-gateway.entity";
import { PricelineHotelIds } from "src/entity/hotel_ids.entity";
import moment = require("moment");
import { Instalment } from "./instalment.utility";
import { PaymentType } from "src/enum/payment-type.enum";
import { Supplier } from "src/entity/supplier.entity";

export class Generic {
    static async getCredential(module_name: string) {
        
        const credential = await getConnection()
        .createQueryBuilder()
        .select([
            "supplier.mode",
            "supplier.testCredential",
            "supplier.liveCredential",
        ])
        .from(Supplier, "supplier")
        .where("supplier.name = :module_name", { module_name })
        .cache(`${module_name}_module`, 43200000)
        .getOne();

        return credential;
    }

    static async getAmountTocurrency(code: string = 'USD') {

        code = typeof code == 'string' ? code : 'USD'
        
        const currencyDetails = await getConnection()
            .createQueryBuilder()
            .select(["currency.code", "currency.symbol", "currency.liveRate"])
            .from(Currency, "currency")
            .where("currency.code = :code", { code: code || 'USD' })
            .getOne();
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

    static async calculatePriceSummary(items) {
        try {
            let checkInDates=[];
            let allItemResult=[];
            let type;
            let name;
            let bookingDate = moment(new Date()).format("YYYY-MM-DD");
            
            for(let i=0; i < items.length; i++) {
                if(items[i].paymentMethod == PaymentType.INSTALMENT){
                    if(items[i].type == "flight") {
                        checkInDates.push(moment(items[i].moduleInfo[0].departure_date, "DD/MM/YYYY").format("YYYY-MM-DD"));
                    }
                    if(items[i].type=='hotel'){
                        if(typeof items[i].moduleInfo.items!='undefined')
                            checkInDates.push(items[i].moduleInfo.items[0].input_data.check_in);
                        else
                        checkInDates.push(items[i].moduleInfo[0].input_data.check_in);

                    }
                }
                // if(checkInDate == "" || checkInDate  departureDate) {
                //     checkInDate = departureDate
                // }
            }
            
            let checkInDate;
            if(checkInDates.length > 0) {
                checkInDate = checkInDates.reduce(function (a, b) { return a < b ? a : b; });   
            }
            
            // delete checkInDates;
            let downPayment=0;
            let totalAmount =0;
            let netTotalAmount = 0;
            let totalDownPayment=0;
           
            let instalments;
            for(let i=0; i < items.length; i++) {

                if(items[i].type=='flight'){
                    if(items[i].moduleInfo[0].offer_data.applicable){
                        totalAmount = items[i].moduleInfo[0].discounted_selling_price;
                    }
                    else{

                        totalAmount = items[i].moduleInfo[0].selling_price;
                    }
                    type = items[i].type;
                    name = items[i].moduleInfo[0].airline_name;
                } else if(items[i].type=='hotel'){
                    let hotelModuleInfo = typeof items[i].moduleInfo.items!='undefined'?items[i].moduleInfo.items:items[i].moduleInfo;
                    if(hotelModuleInfo[0].offer_data.applicable){
                        totalAmount = hotelModuleInfo[0].selling.discounted_total;
                    }   
                    else{

                        totalAmount = hotelModuleInfo[0].selling.total;
                    }
                    type = items[i].type;
                    name = hotelModuleInfo[0].hotel_name;
                }
                netTotalAmount += totalAmount
                
                if(items[i].paymentMethod == PaymentType.INSTALMENT){
                    downPayment = items[i].downpayment;
                    totalDownPayment+=Number(downPayment);
                    if(items[i].paymentFrequency =='weekly'){
                        instalments=await Instalment.weeklyInstalment(
                            totalAmount,
                            checkInDate,
                            bookingDate,
                            downPayment,
                            false
                        )
                    }
                    if(items[i].paymentFrequency == 'biweekly'){
                        instalments = await Instalment.biWeeklyInstalment(
                            totalAmount,
                            checkInDate,
                            bookingDate,
                            downPayment,
                            false)
                    }
                    if(items[i].paymentFrequency == 'monthly'){
                        instalments = await Instalment.monthlyInstalment(
                            totalAmount,
                            checkInDate,
                            bookingDate,
                            downPayment,
                            false)
                    }

                    for(let x=0; x<instalments.instalment_date.length; x++){
                        instalments.instalment_date[x].type=type;
                        instalments.instalment_date[x].name=name;
                    }
                    
                    allItemResult = [...allItemResult,...instalments.instalment_date];
                } else{
                    totalDownPayment+=totalAmount;
                }
            }
            let priceSummary=[];
            for(let i=0; i < allItemResult.length; i++){
                
                let find= await priceSummary.findIndex(price=>price.date==allItemResult[i].instalment_date);
                
                if(find!=-1){
                    priceSummary[find].breakdown.push({
                        type : allItemResult[i].type,
                        amount : Generic.formatPriceDecimal(allItemResult[i].instalment_amount),
                        name :  allItemResult[i].name
                    })
                    priceSummary[find].amount+=Generic.formatPriceDecimal(allItemResult[i].instalment_amount)
                }
                else{
                    let breakDown = [{
                        type : allItemResult[i].type,
                        amount :  Generic.formatPriceDecimal(allItemResult[i].instalment_amount),
                        name :  allItemResult[i].name
                    }]
                    priceSummary.push({
                        date : allItemResult[i].instalment_date,
                        amount : Generic.formatPriceDecimal(allItemResult[i].instalment_amount),
                        breakdown : breakDown
                    })
                }
            }
            priceSummary.shift();
            priceSummary.sort((a, b) => {
                var c = new Date(a.date);
                var d = new Date(b.date);
                return c > d ? 1 : -1;
            });
            let remainingAmount = netTotalAmount - totalDownPayment;
            return {
                total_price : Generic.formatPriceDecimal(netTotalAmount),
                remaining_amount : Generic.formatPriceDecimal(remainingAmount),
                total_downpayment : Generic.formatPriceDecimal(totalDownPayment),
                installment_dates : priceSummary
            } 
        } catch(e) {
            console.log("Error---->>>",e)
        } 
    }

    static getMinPriceFlight(routes, priceType) {
        return Math.min.apply(
            null,
            routes.map((item) => item[priceType])
        );
    }

    static getMaxPriceFLight(routes, priceType) {
        return Math.max.apply(
            null,
            routes.map((item) => item[priceType])
        );
    }

    static getStopCounts(routes, type) {
        let stopsData = {
            non_stop: {
                count: 0,
                min_price: null,
            },
            one_stop: {
                count: 0,
                min_price: null,
            },
            two_and_two_plus_stop: {
                count: 0,
                min_price: null,
            },
        };
        routes.forEach((route) => {
            if (route[type] == 0) {
                if (
                    stopsData.non_stop.min_price == null ||
                    stopsData.non_stop.min_price > route.selling_price
                ) {
                    stopsData.non_stop.min_price = route.selling_price;
                }
                stopsData.non_stop.count += 1;
            }

            if (route[type] == 1) {
                if (
                    stopsData.one_stop.min_price == null ||
                    stopsData.one_stop.min_price > route.selling_price
                ) {
                    stopsData.one_stop.min_price = route.selling_price;
                }
                stopsData.one_stop.count += 1;
            }

            if (route[type] > 1) {
                if (
                    stopsData.two_and_two_plus_stop.min_price == null ||
                    stopsData.two_and_two_plus_stop.min_price >
                    route.selling_price
                ) {
                    stopsData.two_and_two_plus_stop.min_price =
                        route.selling_price;
                }
                stopsData.two_and_two_plus_stop.count += 1;
            }
        });
        return stopsData;
    }

    static getAirlineCounts(routes) {
        let airlineList = [];
        let airlineData = {};
        routes.forEach((route) => {
            airlineData = {};
            airlineData["airline_name"] = route.airline_name;
            airlineData["airline_code"] = route.airline;
            airlineData["selling_price"] = route.selling_price;
            airlineList.push(airlineData);
        });

        const result = [
            ...airlineList
                .reduce((mp, o) => {
                    if (!mp.has(o.airline_code))
                        mp.set(o.airline_code, { ...o, count: 0 });
                    mp.get(o.airline_code).count++;
                    return mp;
                }, new Map())
                .values(),
        ];
        return result;
    }

    /**
     *
     * @param routes
     * @param type (departure_time, arrival_time)
     * @param routeType (0=> Outbound 1=>Inbound)
     */
    static getArrivalDepartureTimeSlot(routes, type, routeType) {
        let timeSlots = {
            first_slot: {
                min_price: 0,
                count: 0,
                from_time: "00:00 am",
                to_time: "05:59 am",
            },
            second_slot: {
                min_price: 0,
                count: 0,
                from_time: "06:00 am",
                to_time: "11:59 am",
            },
            third_slot: {
                min_price: 0,
                count: 0,
                from_time: "12:00 pm",
                to_time: "05:59 pm",
            },
            fourth_slot: {
                min_price: 0,
                count: 0,
                from_time: "06:00 pm",
                to_time: "11:59 pm",
            },
        };
        let sourceDate;
        routes.forEach((route) => {
            if (type == "departure_time") {
                sourceDate = moment(
                    route.routes[routeType].stops[0][type],
                    "HH:mm:a"
                );
            } else {
                sourceDate = moment(
                    route.routes[routeType].stops[
                    route.routes[routeType].stops.length - 1
                    ][type],
                    "HH:mm:a"
                );
            }
            if (
                sourceDate.isBetween(
                    moment(timeSlots.first_slot.from_time, "HH:mm:a"),
                    moment(timeSlots.first_slot.to_time, "HH:mm:a")
                )
            ) {
                timeSlots.first_slot.count += 1;
                if (
                    timeSlots.first_slot.min_price == 0 ||
                    timeSlots.first_slot.min_price > route.selling_price
                ) {
                    timeSlots.first_slot.min_price = route.selling_price;
                }
            }

            if (
                sourceDate.isBetween(
                    moment(timeSlots.second_slot.from_time, "HH:mm:a"),
                    moment(timeSlots.second_slot.to_time, "HH:mm:a")
                )
            ) {
                timeSlots.second_slot.count += 1;
                if (
                    timeSlots.second_slot.min_price == 0 ||
                    timeSlots.second_slot.min_price > route.selling_price
                ) {
                    timeSlots.second_slot.min_price = route.selling_price;
                }
            }

            if (
                sourceDate.isBetween(
                    moment(timeSlots.third_slot.from_time, "HH:mm:a"),
                    moment(timeSlots.third_slot.to_time, "HH:mm:a")
                )
            ) {
                timeSlots.third_slot.count += 1;
                if (
                    timeSlots.third_slot.min_price == 0 ||
                    timeSlots.third_slot.min_price > route.selling_price
                ) {
                    timeSlots.third_slot.min_price = route.selling_price;
                }
            }

            if (
                sourceDate.isBetween(
                    moment(timeSlots.fourth_slot.from_time, "HH:mm:a"),
                    moment(timeSlots.fourth_slot.to_time, "HH:mm:a")
                )
            ) {
                timeSlots.fourth_slot.count += 1;
                if (
                    timeSlots.fourth_slot.min_price == 0 ||
                    timeSlots.fourth_slot.min_price > route.selling_price
                ) {
                    timeSlots.fourth_slot.min_price = route.selling_price;
                }
            }
        });
        return timeSlots;
    }
}
