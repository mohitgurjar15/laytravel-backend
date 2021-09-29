import { BadRequestException, HttpService, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import moment = require("moment");
import { errorMessage, s3BucketUrl } from "src/config/common.config";
import { Instalment } from "src/utility/instalment.utility";
import { PriceMarkup } from "src/utility/markup.utility";
import { getConnection, getManager } from "typeorm";
import { OneWaySearchFlightDto } from "../dto/oneway-flight.dto";
import { StrategyAirline } from "./strategy.interface";
import * as md5 from "md5";
import { HttpRequest } from "src/utility/http.utility";
const axios = require('axios')
import * as zlib from "zlib";
import * as xml2js from "xml2js";
import { FlightRoute } from "src/entity/flight-route.entity";
import { Airport } from "src/entity/airport.entity";
import { Stop } from "../model/stop.model";
import { FlightSearchResult, PriceRange, Route, RouteType } from "../model/route.model";
import { DateTime } from "src/utility/datetime.utility";
import { airlines } from "../airline";
import { Generic } from "src/utility/generic.utility";
import { LandingPage } from "src/utility/landing-page.utility";
import { RouteCategory } from "src/utility/route-category.utility";
import { PaymentConfigurationUtility } from "src/utility/payment-config.utility";
import { InstalmentType } from "src/enum/instalment-type.enum";
import { PaymentConfiguration } from "src/entity/payment-configuration.entity";
import { airports } from "../airports";
import { RoundtripSearchFlightDto } from "../dto/roundtrip-flight.dto";
import { Module } from "src/entity/module.entity";

export const flightClass = {
    Economy : "Economy",
    Premium : "Premium",
    First : "First",
    Business : "Business",
};

export const credential = {
    pkfare_partner_id: "r4Zu8O3xRMXvBlo8mv+UZr0xemY=",
    pkfare_partner_key: "NzgyZmJhNDBlMzA3OWFhZWI1M2VkMWIzNzg1MWYxOTE=",
    pkfare_api_url: "https://mwrlife-api.pkfare.com/",
    
}

const blacklistedAirlines = [""]
export class PKFare implements StrategyAirline {
    private httpsService: HttpService;
    private headers;
    private cacheManager;
    private ttl: number = 1200;
    private sessionName: string = "pkfare-session";
    constructor(headers, cacheManager) {
        this.headers = headers;
        this.cacheManager = cacheManager;
    }

    async startSession(){

    }

    async getMystiflyCredential() {

    }

    async oneWaySearch(
        searchFlightDto: OneWaySearchFlightDto,
        user,
        referralId
    ) {
        try {
            const {
                source_location,
                destination_location,
                departure_date,
                flight_class,
                adult_count,
                child_count,
                infant_count,
            } = searchFlightDto;
    
            const [caegory] = await getConnection().query(`select 
            (select name from laytrip_category where id = flight_route.category_id)as categoryName 
            from flight_route 
            where from_airport_code  = '${source_location}' and to_airport_code = '${destination_location}'`);
            let categoryName = caegory?.categoryname;
            
            let blacklistedAirports = await this.getBlacklistedAirports()
            let bookingDate = moment(new Date()).format("YYYY-MM-DD");
    
            let isInstalmentAvaible = Instalment.instalmentAvailbility(
                departure_date,
                bookingDate
            );
    
            
            let markup = await this.getMarkupDetails(
                departure_date,
                bookingDate,
                user,
                1
            );
            let markUpDetails = markup.markUpDetails;
            let secondaryMarkUpDetails = markup.secondaryMarkUpDetails;
            if (!markUpDetails) {
                throw new InternalServerErrorException(
                    `Markup is not configured for flight&&&module&&&${errorMessage}`
                );
            }
            const currencyDetails = await Generic.getAmountTocurrency(
                this.headers.currency
            );
    
            const sign = await this.getSign();
            
            let requestParam = "";
            requestParam += `{`;
            requestParam += `"authentication": {`;
            requestParam += `"partnerId": "${credential.pkfare_partner_id}",`;
            requestParam += `"sign": "${sign}"`;
            requestParam += `},`
            requestParam += `"search": {`;
            if(adult_count > 0) {
                requestParam += `"adults": ${adult_count},`;
            }
    
            requestParam += `"airline": "",`
            
            if(child_count > 0) {
                requestParam += `"children": ${child_count},`;
            }
    
            requestParam += `"nonstop": 0,`;
            requestParam += `"searchAirLegs": [`;
            requestParam += `{`
            requestParam += `"cabinClass": "${this.getFlightClass(flight_class)}",`;
            requestParam += `"departureDate": "${departure_date}",`;
            requestParam += `"destination": "${destination_location}",`;
            requestParam += `"origin": "${source_location}"`;
            requestParam += `}`;
            requestParam += `],`;
            requestParam += `"solutions": 0`;
            requestParam += `}`;
            requestParam += `}`;
    
            let param = await this.convertToBase64(requestParam);
            
            let url = `${credential.pkfare_api_url}shoppingV2?param=${param}`;
            let responce: any = {};
    
            let searchResult = await HttpRequest.pkFareRequestGzip(
                url,
                param,
                "ShoppingV2"
            )
            
            let results: any = await new Promise((resolve) => { 
                zlib.gunzip(searchResult, function (_err, output) {
                    resolve(output.toString())
                })
            });

            results = JSON.parse(results);
            if(results.data.flights && results.data.flights.length > 0) {  
                let paymentConfigCase = {}
                let instalmentEligibilityCase = {}
                let filteredListes = await this.getRoutes(source_location, destination_location, false)
                let flightRoutes = results.data.flights;
                let stop: Stop;
                let stops: Stop[] = [];
                let routes: Route[] = [];
                let route: Route;
                let routeType: RouteType;
                let flightSegments = [];
                let stopDuration;
                let otherSegments = [];
                let totalDuration;
                let uniqueCode;
                let segmentId;
                let solutions;
                let flightSegmentDetails;
                let journey = [];


                for(let i = 0; i < flightRoutes.length; i++) {
                    
                    let blacklistedAirlinesFound = 0
                    let blacklistedAirportsFound = 0
                    route = new Route();
                    stops = [];
                    totalDuration = 0;
                    uniqueCode = "";
                    flightSegments = flightRoutes[i].segmengtIds
                    journey = []
                    
                    for(let j = 0; j < flightSegments.length; j++) {
                        segmentId = flightSegments[j]
                        
                        flightSegmentDetails = results.data.segments.filter(item => item.segmentId == segmentId)
                        
                        if(flightSegmentDetails) {
                            totalDuration += flightSegmentDetails[0].flightTime * 60;
                            stop = new Stop();
                            
                            stop.departure_code = flightSegmentDetails[0].departure;
                            
                            stop.departure_date = moment(flightSegmentDetails[0].departureDate).format("DD/MM/YYYY");
                            
                            stop.departure_time = moment(flightSegmentDetails[0].strDepartureTime,"HH:mm").format("h:mm A");
                            
                            let departure_date_time = flightSegmentDetails[0].strDepartureDate +'T'+ flightSegmentDetails[0].strDepartureTime;
                            
                            stop.departure_date_time = moment(departure_date_time).format("YYYY-MM-DDTHH:mm:SS");
                            stop.departure_info = 
                                typeof airports[stop.departure_code] !== "undefined"
                                ? airports[stop.departure_code]
                                : {};
                            stop.arrival_code = flightSegmentDetails[0].arrival;
                            stop.arrival_date = moment(flightSegmentDetails[0].arrivalDate).format("DD/MM/YYYY");
                            stop.arrival_time = moment(flightSegmentDetails[0].strArrivalTime,"HH:mm").format("h:mm A");
                            
                            let arrival_date_time = flightSegmentDetails[0].strArrivalDate +'T'+ flightSegmentDetails[0].strArrivalTime;
                            stop.arrival_date_time = moment(arrival_date_time).format("YYYY-MM-DDTHH:mm:SS");
                            stop.arrival_info = 
                                typeof airports[stop.arrival_code] !== "undefined"
                                        ? airports[stop.arrival_code]
                                        : {};
                            stop.eticket = true; // please check this
                            stop.flight_number = flightSegmentDetails[0].flightNum;
                            stop.cabin_class = Generic.generateTitleCase(flightSegmentDetails[0].cabinClass)
                            stopDuration = DateTime.convertSecondsToHourMinutesSeconds(
                                flightSegmentDetails[0].flightTime * 60
                            );
                            
                            stop.duration = `${stopDuration.hours}h ${stopDuration.minutes}m`;
                            stop.airline = flightSegmentDetails[0].airline;
                            stop.remaining_seat = parseInt(flightSegmentDetails[0].availabilityCount);
                            stop.below_minimum_seat = parseInt(flightSegmentDetails[0].availabilityCount) < 5 ? true : false; // please correct this line
                            stop.is_layover = false; // static
                            
                            stop.airline_name = airlines[flightSegmentDetails[0].airline];
                            stop.airline_logo = `${s3BucketUrl}/assets/images/airline/108x92/${stop.airline}.png`;
                            blacklistedAirportsFound = blacklistedAirports.includes(stop.departure_code) && blacklistedAirports.includes(stop.arrival_code) ? blacklistedAirportsFound + 1 : blacklistedAirportsFound
                            blacklistedAirlinesFound = blacklistedAirlines.includes(stop.airline) ? blacklistedAirlinesFound + 1 : blacklistedAirlinesFound
                            stop.cabin_baggage = ""; // please check
                            stop.checkin_baggage = ""; // please check
                            stop.meal = "";
                            
                            let layOverduration = "";
                            stop.is_layover = false;
                            stop.layover_duration = "";
                            stop.layover_airport_name = ""
                            if(stops.length > 0) {
                                stop.is_layover = true;
                                let layOverduration = 
                                    DateTime.convertSecondsToHourMinutesSeconds(
                                        moment(stop.departure_date_time).diff(
                                            stops[stops.length - 1].arrival_date_time,
                                            "seconds"
                                        )
                                    );
                                totalDuration +=  
                                    moment(stop.departure_date_time).diff(
                                        stops[stops.length - 1].arrival_date_time,
                                        "seconds"
                                    );
                                stop.layover_duration = `${layOverduration.hours}h ${layOverduration.minutes}m`;
                                stop.layover_airport_name = flightSegmentDetails[0].departure;

                            }
                            // console.log("flightSegmentDetails[0]",flightSegmentDetails[0])
                            //creating route_code journey details
                            var journeyArr = {
                                "airline": stop.airline,
                                "arrival": stop.arrival_code,
                                "arrivalDate": flightSegmentDetails[0].strArrivalDate,
                                "arrivalTime": flightSegmentDetails[0].strArrivalTime,
                                "bookingCode": flightSegmentDetails[0].bookingCode,
                                "departure": flightSegmentDetails[0].departure,
                                "departureDate": flightSegmentDetails[0].strDepartureDate,
                                "departureTime": flightSegmentDetails[0].strDepartureTime,
                                "flightNum": flightSegmentDetails[0].flightNum
                            }

                            journey.push(journeyArr)
                            uniqueCode += stop.flight_number;
                            uniqueCode += stop.airline;
                            uniqueCode += stop.cabin_class;
                            
                            stops.push(stop);
                            
                        }
                    }
                    // console.log(journey)
                    if(blacklistedAirportsFound == 0 && blacklistedAirlinesFound == 0) {
                        let routeCode = await this.generateRouteCode(journey, adult_count, child_count, sign, "oneway")
                        routeType = new RouteType();
                        routeType.type = "outbound";
                        // console.log("Route COde--->>", routeCode)
                        routeType.stops = stops;
                        let duration = DateTime.convertSecondsToHourMinutesSeconds(
                            totalDuration
                        );
                        routeType.duration = `${duration.hours}h ${duration.minutes}m`;
                        route.routes[0] = routeType;
                        // route.route_code = flightRoutes[i].flightId;
                        route.route_code = routeCode;
                        solutions = results.data.solutions.filter(item => item.journeys.journey_0 == flightRoutes[i].flightId)
                        route.fare_type = "" // discussion needed
                        
                        let totalAmount = solutions[0].adtFare + solutions[0].adtTax + solutions[0].chdFare + solutions[0].chdTax + solutions[0].infFare + solutions[0].infTax +solutions[0].qCharge + solutions[0].tktFee;
                        // console.log("total_amount", totalAmount)
                        route.net_rate = Generic.convertAmountTocurrency(
                            totalAmount,
                            currencyDetails.liveRate
                        );
                        route.fare_break_dwon = [];
                        if (
                            typeof secondaryMarkUpDetails != "undefined" &&
                            Object.keys(secondaryMarkUpDetails).length
                        ) {
                            route.secondary_fare_break_down = [];
                        };
                        route.selling_price = Generic.formatPriceDecimal(
                            PriceMarkup.applyMarkup(route.net_rate, markUpDetails)
                        )
                        let searchData = { departure: stops[0].departure_code, arrival: stops[stops.length - 1].arrival_code, checkInDate: departure_date };
                        let offerData = await LandingPage.getOfferData(referralId, 'flight', searchData);
                        route.discounted_selling_price = LandingPage.applyDiscount(offerData, route.selling_price);
                        if(offerData.applicable==true && route.discounted_selling_price<25){
                            continue;
                        }
                        route.start_price = 0;
                        route.secondary_start_price = 0;
                        route.discounted_start_price = 0;
                        route.discounted_secondary_start_price = 0;
                        route.no_of_weekly_installment = 0;
                        let instalmentDetails;
                        let discountedInstalmentDetails;
                        let instalmentEligibility: {
                            available: boolean;
                            categoryId: number;
                        } | {
                            available: boolean;
                            categoryId?: undefined;
                        }
    
                        let instalmentEligibilityIndex = `${searchData.departure}-${searchData.arrival}`;
                        if (typeof instalmentEligibilityCase[instalmentEligibilityIndex] != "undefined") {
                            instalmentEligibility = instalmentEligibilityCase[instalmentEligibilityIndex]
                        } else {
                            instalmentEligibility = await RouteCategory.checkInstalmentEligibility(
                                searchData
                            );
                            instalmentEligibilityCase[instalmentEligibilityIndex] = instalmentEligibility
                        }

                        let daysUtilDepature = moment(departure_date).diff(moment().format("YYYY-MM-DD"), 'days')

                        let configCaseIndex = `${instalmentEligibility.categoryId}-${daysUtilDepature}`
                        let paymentConfig: PaymentConfiguration

                        if (typeof paymentConfigCase[configCaseIndex] != "undefined") {
                            paymentConfig = paymentConfigCase[configCaseIndex]
                        } else {
                            paymentConfig = await PaymentConfigurationUtility.getPaymentConfig(1, instalmentEligibility.categoryId, daysUtilDepature)
                            paymentConfigCase[configCaseIndex] = paymentConfig
                        }

                        route.payment_config = paymentConfig || {}

                        if (instalmentEligibility.available && typeof paymentConfig != 'undefined') {

                            let weeklyCustomDownPayment = LandingPage.getDownPayment(offerData, 0);
                            let downPaymentOption: any = paymentConfig.downPaymentOption
                            if (paymentConfig.isWeeklyInstallmentAvailable) {
                                instalmentDetails = Instalment.weeklyInstalment(
                                    route.selling_price,
                                    departure_date,
                                    bookingDate,
                                    weeklyCustomDownPayment!=null?weeklyCustomDownPayment:downPaymentOption[0],
                                    weeklyCustomDownPayment!=null?false:paymentConfig.isDownPaymentInPercentage
                                );
                                
                                if (instalmentDetails.instalment_available) {
                                    route.start_price =
                                        instalmentDetails.instalment_date[0].instalment_amount;
    
                                    route.secondary_start_price =
                                        instalmentDetails.instalment_date[1].instalment_amount;
                                    route.no_of_weekly_installment =
                                        instalmentDetails.instalment_date.length - 1;
                                }
                                else{
                                    paymentConfig.isWeeklyInstallmentAvailable=false;
                                }
    
                            }
    
                            if (paymentConfig.isBiWeeklyInstallmentAvailable) {
                                let instalmentDetails2 = Instalment.biWeeklyInstalment(
                                    route.selling_price,
                                    departure_date,
                                    bookingDate,
                                    downPaymentOption[0],
                                    paymentConfig.isDownPaymentInPercentage
                                );
                                
                                if(instalmentDetails2.instalment_available){
                                    route.second_down_payment =
                                    instalmentDetails2.instalment_date[0].instalment_amount;
                                    route.secondary_start_price_2 =
                                    instalmentDetails2.instalment_date[1].instalment_amount;
                                    route.no_of_weekly_installment_2 =
                                    instalmentDetails2.instalment_date.length - 1;
                                }
                                else{
                                    paymentConfig.isBiWeeklyInstallmentAvailable=false;
                                }
                                
                            }
    
    
                            if (paymentConfig.isMonthlyInstallmentAvailable) {
                                let instalmentDetails3 = Instalment.monthlyInstalment(
                                    route.selling_price,
                                    departure_date,
                                    bookingDate,
                                    downPaymentOption[0],
                                    paymentConfig.isDownPaymentInPercentage
                                );
                                if (instalmentDetails3.instalment_available) {
                                    // console.log("INSTALLMENT DETAILS", instalmentDetails3)
                                    route.third_down_payment =
                                    instalmentDetails3.instalment_date[0].instalment_amount;
                                    route.secondary_start_price_3 =
                                    instalmentDetails3.instalment_date[1].instalment_amount;
                                    route.no_of_weekly_installment_3 =
                                    instalmentDetails3.instalment_date.length - 1;
                                }
                                else{
                                    paymentConfig.isMonthlyInstallmentAvailable=false;
                                }
                                
                            }
    
                            discountedInstalmentDetails =await Instalment.weeklyInstalment(
                                route.discounted_selling_price,
                                departure_date,
                                bookingDate,
                                weeklyCustomDownPayment!=null?weeklyCustomDownPayment:downPaymentOption[0],
                                weeklyCustomDownPayment!=null?false:paymentConfig.isDownPaymentInPercentage
                            );
    
                            if (discountedInstalmentDetails.instalment_available) {
                                route.discounted_start_price =
                                    discountedInstalmentDetails.instalment_date[0].instalment_amount;
    
                                route.discounted_secondary_start_price =
                                    discountedInstalmentDetails.instalment_date[1].instalment_amount;
    
                                route.discounted_no_of_weekly_installment =
                                    discountedInstalmentDetails.instalment_date.length - 1;
                            }
                        }
    
                        if (offerData.applicable && typeof paymentConfig != 'undefined') {
                            instalmentEligibility.available = true
                            route.payment_object = {
                                installment_type: InstalmentType.WEEKLY,
                                weekly: {
                                    down_payment: route.discounted_start_price,
                                    installment: route.discounted_secondary_start_price,
                                    installment_count: route.discounted_no_of_weekly_installment,
                                    actual_installment: route.secondary_start_price
                                }
                            }
                        } else if (instalmentEligibility.available && typeof paymentConfig != 'undefined') {
                            route.payment_object = {}
                            let t
                            if (paymentConfig.isWeeklyInstallmentAvailable) {
                                t = InstalmentType.WEEKLY
    
                            } else if (paymentConfig.isBiWeeklyInstallmentAvailable) {
                                t = InstalmentType.BIWEEKLY
    
                            } else if (paymentConfig.isMonthlyInstallmentAvailable) {
                                t = InstalmentType.MONTHLY
                            }
                            if (paymentConfig.isWeeklyInstallmentAvailable) {
                                route.payment_object[InstalmentType.WEEKLY] = {
                                    down_payment: route.discounted_start_price,
                                    installment: route.discounted_secondary_start_price,
                                    installment_count: route.discounted_no_of_weekly_installment
                                }
                            }
                            if (paymentConfig.isBiWeeklyInstallmentAvailable) {
                                
                                route.payment_object[InstalmentType.BIWEEKLY] = {
                                    down_payment: route.second_down_payment,
                                    installment: route.secondary_start_price_2,
                                    installment_count: route.no_of_weekly_installment_2
                                }
                            }
                            if (paymentConfig.isMonthlyInstallmentAvailable) {
                                route.payment_object[InstalmentType.MONTHLY] = {
                                    down_payment: route.third_down_payment,
                                    installment: route.secondary_start_price_3,
                                    installment_count: route.no_of_weekly_installment_3
                                }
                            }
                            route.payment_object['installment_type'] = t
    
                        } else {
                            route.payment_object = {
                                selling_price: route.discounted_selling_price
                            }
                        }
                        route.is_installment_available = instalmentEligibility.available

                        if (
                            typeof secondaryMarkUpDetails != "undefined" &&
                            Object.keys(secondaryMarkUpDetails).length
                        ) {
                            route.secondary_selling_price = Generic.formatPriceDecimal(
                                PriceMarkup.applyMarkup(
                                    route.net_rate,
                                    secondaryMarkUpDetails
                                )
                            );
                        } else {
                            route.secondary_selling_price = 0;
                        }
    
                        route.stop_count = stops.length - 1;
                        route.is_passport_required = null; // discussion needed
    
                        route.departure_code = stops[0].departure_code;
                        route.arrival_code = stops[stops.length - 1].arrival_code;
                        route.departure_date = stops[0].departure_date;
                        route.departure_time = stops[0].departure_time;
                        route.arrival_date = stops[stops.length - 1].arrival_date;
                        route.arrival_time = stops[stops.length - 1].arrival_time;
                        route.departure_info =
                            typeof airports[source_location] !== "undefined"
                                ? airports[source_location]
                                : {};
                        route.arrival_info =
                            typeof airports[destination_location] !== "undefined"
                                ? airports[destination_location]
                                : {};
    
                        route.total_duration = `${duration.hours}h ${duration.minutes}m`;
                        route.airline = stops[0].airline;
                        route.airline_name = airlines[stops[0].airline];
                        route.airline_logo = `${s3BucketUrl}/assets/images/airline/108x92/${stops[0].airline}.png`;
                        route.is_refundable = false; // needs discussion
                        route.unique_code = md5(uniqueCode);
                        route.category_name = categoryName;
                        route.offer_data = offerData;
                        route.supplier = "pkfare";
                        routes.push(route);                        
                    }
                }
                
                return routes;
                
            } else {
                throw new NotFoundException(`No flight founds`);
            }
        }catch(error) {
            console.log("ERROR--->>>", error)
        }

    }

    async oneWaySearchZip(
        searchFlightDto: OneWaySearchFlightDto,
        user,
        mystiflyConfig,
        sessionToken,
        module,
        currencyDetails
    ) {
        
    }

    async roundTripSearchZip(
        param1,
        param2,
        param3,
        param4,
        param5,
        param6
    ) {

    }

    async oneWaySearchZipWithFilter(
        param1,
        param2,
        param3,
        param4,
        param5,
        param6
    ) {

    }

    async roundTripSearchZipWithFilter(
        param1,
        param2,
        param3,
        param4,
        param5,
        param6
    ) {

    }

    async cancelBooking(param1) {

    }

    async roundTripSearch(
        searchFlightDto: RoundtripSearchFlightDto, 
        user, 
        referralId
    ) {
        try {
            const {
                source_location,
                destination_location,
                departure_date,
                flight_class,
                adult_count,
                child_count,
                infant_count,
            } = searchFlightDto;
            
            const [caegory] = await getConnection().query(`select 
            (select name from laytrip_category where id = flight_route.category_id)as categoryName 
            from flight_route 
            where from_airport_code  = '${source_location}' and to_airport_code = '${destination_location}'`);
            let categoryName = caegory?.categoryname;
            
            let blacklistedAirports = await this.getBlacklistedAirports()
            let bookingDate = moment(new Date()).format("YYYY-MM-DD");
            const currencyDetails = await Generic.getAmountTocurrency(
                this.headers.currency
            );
            
            //const markUpDetails   = await PriceMarkup.getMarkup(module.id,user.roleId);
            let routeDetails: any = await RouteCategory.flightRouteAvailability(
                source_location,
                destination_location
            );
            
            let markup = await this.getMarkupDetails(
                departure_date,
                bookingDate,
                user,
                1
            );
            let markUpDetails = markup.markUpDetails;
            let secondaryMarkUpDetails = markup.secondaryMarkUpDetails;
            if (!markUpDetails) {
                throw new InternalServerErrorException(
                    `Markup is not configured for flight&&&module&&&${errorMessage}`
                );
            }

            const sign = await this.getSign();
            
            
            const reqParamJson = {
                "authentication": {
                    "partnerId": `${credential.pkfare_partner_id}`,
                    "sign": `${sign}`
                },
                "search": {
                    "adults": `${adult_count}`,
                    "airline": "",
                    "children": `${child_count}`,
                    "nonstop": 0,
                    "searchAirLegs": [
                        {
                            "cabinClass": `${this.getFlightClass(flight_class)}`,
                            "departureDate": `${departure_date}`,
                            "destination": `${destination_location}`,
                            "origin": `${source_location}`
                        },
                        {
                            "cabinClass": `${this.getFlightClass(flight_class)}`,
                            "departureDate": `${departure_date}`,
                            "destination": `${source_location}`,
                            "origin": `${destination_location}`
                        }
                    ],
                    "solutions": 0
                }
            }
            let param = await this.convertToBase64(JSON.stringify(reqParamJson) );
            
            
            let url = `${credential.pkfare_api_url}shoppingV2?param=${param}`;
            let responce: any = {};
    
            let searchResult = await HttpRequest.pkFareRequestGzip(
                url,
                param,
                "ShoppingV2"
            )
            
            let results: any = await new Promise((resolve) => { 
                zlib.gunzip(searchResult, function (_err, output) {
                    resolve(output.toString())
                })
            });

            results = JSON.parse(results);
            let instalmentEligibilityCase = {}
            let paymentConfigCase = {}
            if(results.data.flights && results.data.flights.length > 0) {
                let filteredListes = await this.getRoutes(source_location, destination_location, true)
            
                let flightRoutes = results.data.solutions;
                
                let stop: Stop;
                let stops: Stop[] = [];
                let routes: Route[] = [];
                let route: Route;
                let routeType: RouteType;
                let outBoundflightSegments = [];
                let inBoundflightSegments = [];
                let stopDuration;
                let otherSegments = [];
                let j;
                let totalDuration, inTotalDuration;
                let uniqueCode;
                let outboundFlightDetails;
                let inboundFlightDetails;
                let flightSegments;
                let flightSegmentDetails;
                let depatureOfInbound;
                let arrivalCodeOfOutbound;
                let outboundJourney = [];
                let inboundJourney = [];
                for (let i = 0; i < flightRoutes.length; i++) {
                    let blacklistedAirlinesFound = 0
                    let blacklistedAirportsFound = 0
                    totalDuration = 0;
                    inTotalDuration = 0;
                    route = new Route();
                    stops = [];
                    j = 0;
                    uniqueCode = "";
                    outboundJourney = [];
                    inboundJourney = [];
                    outBoundflightSegments = flightRoutes[i].journeys.journey_0;
                    inBoundflightSegments = flightRoutes[i].journeys.journey_1;
                    outboundFlightDetails = results.data.flights.filter(item => item.flightId == outBoundflightSegments)
                    inboundFlightDetails = results.data.flights.filter(item => item.flightId == inBoundflightSegments)
                    
                    if(outboundFlightDetails) {

                        flightSegments = outboundFlightDetails[0].segmengtIds
                        
                        for(let x = 0; x < flightSegments.length; x++) {
                            
                            flightSegmentDetails = results.data.segments.filter(item => item.segmentId == flightSegments[x])
                            if(flightSegmentDetails) {
                                stop = new Stop();
                                totalDuration += flightSegmentDetails[0].flightTime * 60;
                                
                                stop.departure_code = flightSegmentDetails[0].departure;
                                
                                stop.departure_date = moment(flightSegmentDetails[0].departureDate).format("DD/MM/YYYY");
                                
                                stop.departure_time = moment(flightSegmentDetails[0].strDepartureTime,"HH:mm").format("h:mm A");
                                
                                let departure_date_time = flightSegmentDetails[0].strDepartureDate +'T'+ flightSegmentDetails[0].strDepartureTime;
                                
                                stop.departure_date_time = moment(departure_date_time).format("YYYY-MM-DDTHH:mm:SS");
                                
                                stop.departure_info = 
                                typeof airports[stop.departure_code] !== "undefined"
                                    ? airports[stop.departure_code]
                                    : {};
                                
                                stop.arrival_code = flightSegmentDetails[0].arrival;
                                stop.arrival_date = moment(flightSegmentDetails[0].arrivalDate).format("DD/MM/YYYY");
                                stop.arrival_time = moment(flightSegmentDetails[0].strArrivalTime,"HH:mm").format("h:mm A");
                                
                                let arrival_date_time = flightSegmentDetails[0].strArrivalDate +'T'+ flightSegmentDetails[0].strArrivalTime;
                                stop.arrival_date_time = moment(arrival_date_time).format("YYYY-MM-DDTHH:mm:SS");
                                stop.arrival_info = 
                                    typeof airports[stop.arrival_code] !== "undefined"
                                    ? airports[stop.arrival_code]
                                    : {};
                                stop.eticket = true; // please check this
                                stop.flight_number = flightSegmentDetails[0].flightNum;
                                stop.cabin_class = Generic.generateTitleCase(flightSegmentDetails[0].cabinClass);
                                stopDuration = DateTime.convertSecondsToHourMinutesSeconds(
                                    flightSegmentDetails[0].flightTime * 60
                                );
                                
                                stop.duration = `${stopDuration.hours}h ${stopDuration.minutes}m`;
                                stop.airline = flightSegmentDetails[0].airline;
                                stop.remaining_seat = parseInt(flightSegmentDetails[0].availabilityCount);
                                stop.below_minimum_seat = parseInt(flightSegmentDetails[0].availabilityCount) < 5 ? true : false; // please correct this line
                                stop.is_layover = false; // static
                                
                                stop.airline_name = airlines[flightSegmentDetails[0].airline];
                                stop.airline_logo = `${s3BucketUrl}/assets/images/airline/108x92/${stop.airline}.png`;
                                blacklistedAirportsFound = blacklistedAirports.includes(stop.departure_code) && blacklistedAirports.includes(stop.arrival_code) ? blacklistedAirportsFound + 1 : blacklistedAirportsFound
                                blacklistedAirlinesFound = blacklistedAirlines.includes(stop.airline) ? blacklistedAirlinesFound + 1 : blacklistedAirlinesFound
                                stop.cabin_baggage = ""; // please check
                                stop.checkin_baggage = ""; // please check
                                stop.meal = "";
                                
                                let layOverduration = "";
                                stop.is_layover = false;
                                stop.layover_duration = "";
                                stop.layover_airport_name = ""
                                if(stops.length > 0) {
                                    stop.is_layover = true;
                                    let layOverduration = 
                                        DateTime.convertSecondsToHourMinutesSeconds(
                                            moment(stop.departure_date_time).diff(
                                                stops[stops.length - 1].arrival_date_time,
                                                "seconds"
                                            )
                                        );
                                    totalDuration +=  
                                        moment(stop.departure_date_time).diff(
                                            stops[stops.length - 1].arrival_date_time,
                                            "seconds"
                                        );
                                    stop.layover_duration = `${layOverduration.hours}h ${layOverduration.minutes}m`;
                                    stop.layover_airport_name = flightSegmentDetails[0].departure;

                                }
                                // for routeCode generation
                                var outboundJourneyArr = {
                                    "airline": stop.airline,
                                    "arrival": stop.arrival_code,
                                    "arrivalDate": flightSegmentDetails[0].strArrivalDate,
                                    "arrivalTime": flightSegmentDetails[0].strArrivalTime,
                                    "bookingCode": flightSegmentDetails[0].bookingCode,
                                    "departure": flightSegmentDetails[0].departure,
                                    "departureDate": flightSegmentDetails[0].strDepartureDate,
                                    "departureTime": flightSegmentDetails[0].strDepartureTime,
                                    "flightNum": flightSegmentDetails[0].flightNum
                                }
                                outboundJourney.push(outboundJourneyArr)
                                uniqueCode += stop.flight_number;
                                uniqueCode += stop.airline;
                                uniqueCode += stop.cabin_class;
                                stops.push(stop);
                            }
                        }
                        routeType = new RouteType();
                        routeType.type = "outbound";
                        routeType.stops = stops;
                        
                        let outBoundDuration = DateTime.convertSecondsToHourMinutesSeconds(
                            totalDuration
                        );
                        
                        routeType.duration = `${outBoundDuration.hours}h ${outBoundDuration.minutes}m`;
                        route.routes[0] = routeType;
                        route.is_passport_required = null; //
                        depatureOfInbound = stops[0].departure_code
                        route.departure_code = stops[0].departure_code;
                        route.departure_date = stops[0].departure_date;
                        route.departure_time = stops[0].departure_time;
                        arrivalCodeOfOutbound =
                            stops[stops.length - 1].arrival_code;
                        route.stop_count = stops.length - 1;
                    }

                    
                    stops = [];
                    
                    if(inboundFlightDetails) {
                        
                        flightSegments = inboundFlightDetails[0].segmengtIds
                        
                        for(let x = 0; x < flightSegments.length; x++) {
                            
                            flightSegmentDetails = results.data.segments.filter(item => item.segmentId == flightSegments[x])
                            if(flightSegmentDetails) {
                                stop = new Stop();
                                
                                inTotalDuration += flightSegmentDetails[0].flightTime * 60;
                                
                                stop.departure_code = flightSegmentDetails[0].departure;
                                
                                stop.departure_date = moment(flightSegmentDetails[0].departureDate).format("DD/MM/YYYY");
                                
                                stop.departure_time = moment(flightSegmentDetails[0].strDepartureTime,"HH:mm").format("h:mm A");
                                
                                let departure_date_time = flightSegmentDetails[0].strDepartureDate +'T'+ flightSegmentDetails[0].strDepartureTime;
                                
                                stop.departure_date_time = moment(departure_date_time).format("YYYY-MM-DDTHH:mm:SS");
                                stop.departure_info = 
                                typeof airports[stop.departure_code] !== "undefined"
                                    ? airports[stop.departure_code]
                                    : {};
                                
                                stop.arrival_code = flightSegmentDetails[0].arrival;
                                stop.arrival_date = moment(flightSegmentDetails[0].arrivalDate).format("DD/MM/YYYY");
                                stop.arrival_time = moment(flightSegmentDetails[0].strArrivalTime,"HH:mm").format("h:mm A");
                                
                                let arrival_date_time = flightSegmentDetails[0].strArrivalDate +'T'+ flightSegmentDetails[0].strArrivalTime;
                                stop.arrival_date_time = moment(arrival_date_time).format("YYYY-MM-DDTHH:mm:SS");
                                stop.arrival_info = 
                                    typeof airports[stop.arrival_code] !== "undefined"
                                    ? airports[stop.arrival_code]
                                    : {};
                                
                                stop.eticket = true; // please check this
                                stop.flight_number = flightSegmentDetails[0].flightNum;
                                stop.cabin_class = Generic.generateTitleCase(flightSegmentDetails[0].cabinClass);
                                stopDuration = DateTime.convertSecondsToHourMinutesSeconds(
                                    flightSegmentDetails[0].flightTime * 60
                                );
                                
                                stop.duration = `${stopDuration.hours}h ${stopDuration.minutes}m`;
                                stop.airline = flightSegmentDetails[0].airline;
                                stop.remaining_seat = parseInt(flightSegmentDetails[0].availabilityCount);
                                stop.below_minimum_seat = parseInt(flightSegmentDetails[0].availabilityCount) < 5 ? true : false; // please correct this line
                                stop.is_layover = false; // static
                                
                                stop.airline_name = airlines[flightSegmentDetails[0].airline];
                                stop.airline_logo = `${s3BucketUrl}/assets/images/airline/108x92/${stop.airline}.png`;
                                blacklistedAirportsFound = blacklistedAirports.includes(stop.departure_code) && blacklistedAirports.includes(stop.arrival_code) ? blacklistedAirportsFound + 1 : blacklistedAirportsFound
                                blacklistedAirlinesFound = blacklistedAirlines.includes(stop.airline) ? blacklistedAirlinesFound + 1 : blacklistedAirlinesFound
                                stop.cabin_baggage = ""; // please check
                                stop.checkin_baggage = ""; // please check
                                stop.meal = "";
                                
                                let layOverduration = "";
                                stop.is_layover = false;
                                stop.layover_duration = "";
                                stop.layover_airport_name = ""
                                if(stops.length > 0) {
                                    stop.is_layover = true;
                                    let layOverduration = 
                                        DateTime.convertSecondsToHourMinutesSeconds(
                                            moment(stop.departure_date_time).diff(
                                                stops[stops.length - 1].arrival_date_time,
                                                "seconds"
                                            )
                                        );
                                    inTotalDuration +=  
                                        moment(stop.departure_date_time).diff(
                                            stops[stops.length - 1].arrival_date_time,
                                            "seconds"
                                        );
                                    stop.layover_duration = `${layOverduration.hours}h ${layOverduration.minutes}m`;
                                    stop.layover_airport_name = flightSegmentDetails[0].departure;

                                }
                                // for routeCode generation
                                var inboundjourneyArr = {
                                    "airline": stop.airline,
                                    "arrival": stop.arrival_code,
                                    "arrivalDate": flightSegmentDetails[0].strArrivalDate,
                                    "arrivalTime": flightSegmentDetails[0].strArrivalTime,
                                    "bookingCode": flightSegmentDetails[0].bookingCode,
                                    "departure": flightSegmentDetails[0].departure,
                                    "departureDate": flightSegmentDetails[0].strDepartureDate,
                                    "departureTime": flightSegmentDetails[0].strDepartureTime,
                                    "flightNum": flightSegmentDetails[0].flightNum
                                }
                                inboundJourney.push(inboundjourneyArr);
                                uniqueCode += stop.flight_number;
                                uniqueCode += stop.airline;
                                uniqueCode += stop.cabin_class;
                                stops.push(stop);
                                
                            }
                            
                        }
                        
                        if(blacklistedAirportsFound == 0 && blacklistedAirlinesFound == 0) {
                            routeType = new RouteType();
                            routeType.type = "inbound";
                            routeType.stops = stops;
                            
                            let duration = DateTime.convertSecondsToHourMinutesSeconds(
                                inTotalDuration
                            );
                            let routeCode = await this.generateRouteCode(outboundJourney, adult_count, child_count, sign, "roundtrip", inboundJourney);
                            routeType.duration = `${duration.hours}h ${duration.minutes}m`;
                            route.routes[1] = routeType;
                            // route.route_code = flightRoutes[i].flightId;
                            route.route_code = routeCode;
                            
                            route.fare_type = "" // discussion needed
                            
                            let totalAmount = flightRoutes[i].adtFare + flightRoutes[i].adtTax + flightRoutes[i].chdFare + flightRoutes[i].chdTax + flightRoutes[i].infFare + flightRoutes[i].infTax + flightRoutes[i].qCharge + flightRoutes[i].tktFee;
                            route.net_rate = Generic.convertAmountTocurrency(
                                totalAmount,
                                currencyDetails.liveRate
                            );
                            route.fare_break_dwon = [];
                            if (
                                typeof secondaryMarkUpDetails != "undefined" &&
                                Object.keys(secondaryMarkUpDetails).length
                            ) {
                                route.secondary_fare_break_down = [];
                            };
                            route.selling_price = Generic.formatPriceDecimal(
                                PriceMarkup.applyMarkup(route.net_rate, markUpDetails)
                            )
                            let searchData = { departure: depatureOfInbound, arrival: arrivalCodeOfOutbound, checkInDate: departure_date };
                            
                            let offerData = await LandingPage.getOfferData(referralId, 'flight', searchData);
                            route.discounted_selling_price = LandingPage.applyDiscount(offerData, route.selling_price);
                            if(offerData.applicable==true && route.discounted_selling_price<25){
                                continue;
                            }
                            route.start_price = 0;
                            route.secondary_start_price = 0;
                            route.discounted_start_price = 0;
                            route.discounted_secondary_start_price = 0;
                            route.no_of_weekly_installment = 0;
                            let instalmentDetails;
                            let discountedInstalmentDetails;
                            let instalmentEligibility: {
                                available: boolean;
                                categoryId: number;
                            } | {
                                available: boolean;
                                categoryId?: undefined;
                            }
        
                            let instalmentEligibilityIndex = `${searchData.departure}-${searchData.arrival}`;
                            if (typeof instalmentEligibilityCase[instalmentEligibilityIndex] != "undefined") {
                                instalmentEligibility = instalmentEligibilityCase[instalmentEligibilityIndex]
                            } else {
                                instalmentEligibility = await RouteCategory.checkInstalmentEligibility(
                                    searchData
                                );
                                instalmentEligibilityCase[instalmentEligibilityIndex] = instalmentEligibility
                            }
    
                            let daysUtilDepature = moment(departure_date).diff(moment().format("YYYY-MM-DD"), 'days')
    
                            let configCaseIndex = `${instalmentEligibility.categoryId}-${daysUtilDepature}`
                            let paymentConfig: PaymentConfiguration
    
                            if (typeof paymentConfigCase[configCaseIndex] != "undefined") {
                                paymentConfig = paymentConfigCase[configCaseIndex]
                            } else {
                                paymentConfig = await PaymentConfigurationUtility.getPaymentConfig(1, instalmentEligibility.categoryId, daysUtilDepature)
                                paymentConfigCase[configCaseIndex] = paymentConfig
                            }
    
                            route.payment_config = paymentConfig || {}
    
                            if (instalmentEligibility.available && typeof paymentConfig != 'undefined') {
    
                                let weeklyCustomDownPayment = LandingPage.getDownPayment(offerData, 0);
                                let downPaymentOption: any = paymentConfig.downPaymentOption
                                if (paymentConfig.isWeeklyInstallmentAvailable) {
                                    instalmentDetails = Instalment.weeklyInstalment(
                                        route.selling_price,
                                        departure_date,
                                        bookingDate,
                                        weeklyCustomDownPayment!=null?weeklyCustomDownPayment:downPaymentOption[0],
                                        weeklyCustomDownPayment!=null?false:paymentConfig.isDownPaymentInPercentage
                                    );
                                    
                                    if (instalmentDetails.instalment_available) {
                                        route.start_price =
                                            instalmentDetails.instalment_date[0].instalment_amount;
        
                                        route.secondary_start_price =
                                            instalmentDetails.instalment_date[1].instalment_amount;
                                        route.no_of_weekly_installment =
                                            instalmentDetails.instalment_date.length - 1;
                                    } else{
                                        paymentConfig.isWeeklyInstallmentAvailable=false;
                                    }
        
                                }
        
                                if (paymentConfig.isBiWeeklyInstallmentAvailable) {
                                    let instalmentDetails2 = Instalment.biWeeklyInstalment(
                                        route.selling_price,
                                        departure_date,
                                        bookingDate,
                                        downPaymentOption[0],
                                        paymentConfig.isDownPaymentInPercentage
                                    );
                                    
                                    if (instalmentDetails2.instalment_available) {
                                        route.second_down_payment =
                                        instalmentDetails2.instalment_date[0].instalment_amount;
                                        route.secondary_start_price_2 =
                                        instalmentDetails2.instalment_date[1].instalment_amount;
                                        route.no_of_weekly_installment_2 =
                                        instalmentDetails2.instalment_date.length - 1;
                                    }else{
                                        paymentConfig.isBiWeeklyInstallmentAvailable=false;
                                    }
                                    
                                }
        
        
                                if (paymentConfig.isMonthlyInstallmentAvailable) {
                                    let instalmentDetails3 = Instalment.monthlyInstalment(
                                        route.selling_price,
                                        departure_date,
                                        bookingDate,
                                        downPaymentOption[0],
                                        paymentConfig.isDownPaymentInPercentage
                                    );
                                    if(instalmentDetails3.instalment_available){
                                        route.third_down_payment =
                                        instalmentDetails3.instalment_date[0].instalment_amount;
                                        route.secondary_start_price_3 =
                                        instalmentDetails3.instalment_date[1].instalment_amount;
                                        route.no_of_weekly_installment_3 =
                                        instalmentDetails3.instalment_date.length - 1;
                                    } else{
                                        paymentConfig.isMonthlyInstallmentAvailable=false;
                                    }
                                    
                                }
        
                                discountedInstalmentDetails =await Instalment.weeklyInstalment(
                                    route.discounted_selling_price,
                                    departure_date,
                                    bookingDate,
                                    weeklyCustomDownPayment!=null?weeklyCustomDownPayment:downPaymentOption[0],
                                    weeklyCustomDownPayment!=null?false:paymentConfig.isDownPaymentInPercentage
                                );
        
                                if (discountedInstalmentDetails.instalment_available) {
                                    route.discounted_start_price =
                                        discountedInstalmentDetails.instalment_date[0].instalment_amount;
        
                                    route.discounted_secondary_start_price =
                                        discountedInstalmentDetails.instalment_date[1].instalment_amount;
        
                                    route.discounted_no_of_weekly_installment =
                                        discountedInstalmentDetails.instalment_date.length - 1;
                                }
                            }
        
                            if (offerData.applicable && typeof paymentConfig != 'undefined') {
                                instalmentEligibility.available = true
                                route.payment_object = {
                                    installment_type: InstalmentType.WEEKLY,
                                    weekly: {
                                        down_payment: route.discounted_start_price,
                                        installment: route.discounted_secondary_start_price,
                                        installment_count: route.discounted_no_of_weekly_installment,
                                        actual_installment: route.secondary_start_price
                                    }
                                }
                            } else if (instalmentEligibility.available && typeof paymentConfig != 'undefined') {
                                route.payment_object = {}
                                let t
                                if (paymentConfig.isWeeklyInstallmentAvailable) {
                                    t = InstalmentType.WEEKLY
        
                                } else if (paymentConfig.isBiWeeklyInstallmentAvailable) {
                                    t = InstalmentType.BIWEEKLY
        
                                } else if (paymentConfig.isMonthlyInstallmentAvailable) {
                                    t = InstalmentType.MONTHLY
                                }
                                if (paymentConfig.isWeeklyInstallmentAvailable) {
                                    route.payment_object[InstalmentType.WEEKLY] = {
                                        down_payment: route.discounted_start_price,
                                        installment: route.discounted_secondary_start_price,
                                        installment_count: route.discounted_no_of_weekly_installment
                                    }
                                }
                                if (paymentConfig.isBiWeeklyInstallmentAvailable) {
                                    
                                    route.payment_object[InstalmentType.BIWEEKLY] = {
                                        down_payment: route.second_down_payment,
                                        installment: route.secondary_start_price_2,
                                        installment_count: route.no_of_weekly_installment_2
                                    }
                                }
                                if (paymentConfig.isMonthlyInstallmentAvailable) {
                                    route.payment_object[InstalmentType.MONTHLY] = {
                                        down_payment: route.third_down_payment,
                                        installment: route.secondary_start_price_3,
                                        installment_count: route.no_of_weekly_installment_3
                                    }
                                }
                                route.payment_object['installment_type'] = t
        
                            } else {
                                route.payment_object = {
                                    selling_price: route.discounted_selling_price
                                }
                            }
                            route.instalment_details = instalmentDetails;
                            route.is_installment_available = instalmentEligibility.available
    
                            if (
                                typeof secondaryMarkUpDetails != "undefined" &&
                                Object.keys(secondaryMarkUpDetails).length
                            ) {
                                route.secondary_selling_price = Generic.formatPriceDecimal(
                                    PriceMarkup.applyMarkup(
                                        route.net_rate,
                                        secondaryMarkUpDetails
                                    )
                                );
                            } else {
                                route.secondary_selling_price = 0;
                            }
        
                            route.inbound_stop_count = stops.length - 1;
                            
                            route.is_passport_required = null; // discussion needed
                            let depatureCodeOfInbound = stops[0].departure_code;
                            route.arrival_code = stops[stops.length - 1].arrival_code;
                            route.departure_info =
                                typeof airports[source_location] !== "undefined"
                                    ? airports[source_location]
                                    : {};
                            route.arrival_info =
                                typeof airports[destination_location] !== "undefined"
                                    ? airports[destination_location]
                                    : {};
                            route.arrival_date = stops[stops.length - 1].arrival_date;
                            route.arrival_time = stops[stops.length - 1].arrival_time;
                            
                            let duartion = DateTime.convertSecondsToHourMinutesSeconds(
                                totalDuration + inTotalDuration
                            );
                            
                            route.total_duration = `${duartion.hours}h ${duartion.minutes}m`;
                            route.airline = stops[0].airline;
                            route.airline_name = airlines[stops[0].airline];
                            route.airline_logo = `${s3BucketUrl}/assets/images/airline/108x92/${stops[0].airline}.png`;
                            route.is_refundable = false;
                            route.unique_code = md5(uniqueCode);
                            route.category_name = categoryName;
                            route.offer_data = offerData;
                            route.supplier = "pkfare";
                            routes.push(route);                        
                        }
                    }
                }
                    
                let flightSearchResult = new FlightSearchResult();
                flightSearchResult.items = routes;

                //Get min & max selling price
                let priceRange = new PriceRange();
                let priceType = "discounted_selling_price";
                priceRange.min_price = this.getMinPrice(routes, priceType);
                priceRange.max_price = this.getMaxPrice(routes, priceType);
                flightSearchResult.price_range = priceRange;

                //Get min & max partail payment price
                let partialPaymentPriceRange = new PriceRange();
                priceType = "discounted_secondary_start_price";
                partialPaymentPriceRange.min_price = this.getMinPrice(
                    routes,
                    priceType
                );
                partialPaymentPriceRange.max_price = this.getMaxPrice(
                    routes,
                    priceType
                );
                flightSearchResult.partial_payment_price_range = partialPaymentPriceRange;
                //return flightSearchResult;

                //Get Stops count and minprice
                flightSearchResult.stop_data = this.getStopCounts(
                    routes,
                    "stop_count"
                );

                //Get Stops count and minprice
                flightSearchResult.inbound_stop_data = this.getStopCounts(
                    routes,
                    "inbound_stop_count"
                );

                //Get airline and min price
                flightSearchResult.airline_list = this.getAirlineCounts(routes);
                
                //Get outbound Departure time slot
                flightSearchResult.depature_time_slot = this.getArrivalDepartureTimeSlot(
                    routes,
                    "departure_time",
                    0
                );
                
                //Get outbound Arrival time slot
                flightSearchResult.arrival_time_slot = this.getArrivalDepartureTimeSlot(
                    routes,
                    "arrival_time",
                    0
                );

                //Get inbound Departure time slot
                // flightSearchResult.inbound_depature_time_slot = this.getArrivalDepartureTimeSlot(
                //     routes,
                //     "departure_time",
                //     1
                // );
                
                //Get inbound Arrival time slot
                // flightSearchResult.inbound_arrival_time_slot = this.getArrivalDepartureTimeSlot(
                //     routes,
                //     "arrival_time",
                //     1
                // );
                
                flightSearchResult.category_name = categoryName;
                // console.log("results.data",JSON.stringify(results.data))
                return flightSearchResult;
                // return results
            } else {
                throw new NotFoundException(`No flight founds`);
            }
                

                
        } catch(error) {
            console.log("ERROR---->>", error)
        }

    }

    async baggageDetails(param1) {

    }

    async airRevalidate(
        routeIdDto,
        user,
        referralId
    ) {
        const { route_code } = routeIdDto;
        let url = `${credential.pkfare_api_url}precisePricing_V2?param=${route_code}`;
        let responce: any = {};
        const currencyDetails = await Generic.getAmountTocurrency(
            this.headers.currency
        );

        let results = await HttpRequest.pkFareRequest(
            url,
            route_code,
            "precisePricing_V2"
        )
        const logFile = results["log_file"];
        let instalmentEligibilityCase = {}
        let paymentConfigCase = {}

        if(results.data != null && results.data.flights && results.data.flights.length > 0) {
            let bookingDate = moment(new Date()).format("YYYY-MM-DD");
            let flightRoutes = results.data.solution;
            
            let stop: Stop;
            let stops: Stop[] = [];
            let routes: Route[] = [];
            let route: Route;
            let routeType: RouteType;
            let outBoundflightSegments = [];
            let inBoundflightSegments = [];
            let stopDuration;

            let totalDuration;
            let uniqueCode;
            let otherSegments;
            let departureDate = "";
            let inTotalDuration;
            let outboundJourney;
            let inboundJourney;
            let outboundFlightDetails;
            let inboundFlightDetails;
            let flightSegments;
            let flightSegmentDetails;

            
                totalDuration = 0;
                inTotalDuration = 0;
                route = new Route();
                stops = [];
                uniqueCode = "";
                outboundJourney = [];
                inboundJourney = [];
                outBoundflightSegments = flightRoutes.journeys.journey_0;
                
                outboundFlightDetails = results.data.flights.filter(item => item.flightId == outBoundflightSegments);
                
                if(outboundFlightDetails) {
                    flightSegments = outboundFlightDetails[0].segmentIds
                    
                    for(let x = 0; x < flightSegments.length; x++) {
                        
                        flightSegmentDetails = results.data.segments.filter(item => item.segmentId == flightSegments[x])
                        if(flightSegmentDetails) {
                                      
                            stop = new Stop();
                            totalDuration += flightSegmentDetails[0].flightTime * 60;
                            console.log("Total Duration up", totalDuration)
                            stop.departure_code = flightSegmentDetails[0].departure;
                            
                            stop.departure_date = moment(flightSegmentDetails[0].departureDate).format("DD/MM/YYYY");
                            
                            stop.departure_time = moment(flightSegmentDetails[0].strDepartureTime,"HH:mm").format("h:mm A");
                            
                            let departure_date_time = flightSegmentDetails[0].strDepartureDate +'T'+ flightSegmentDetails[0].strDepartureTime;
                            
                            stop.departure_date_time = moment(departure_date_time).format("YYYY-MM-DDTHH:mm:SS");
                            
                            stop.departure_info = 
                            typeof airports[stop.departure_code] !== "undefined"
                                ? airports[stop.departure_code]
                                : {};
                            
                            stop.arrival_code = flightSegmentDetails[0].arrival;
                            stop.arrival_date = moment(flightSegmentDetails[0].arrivalDate).format("DD/MM/YYYY");
                            stop.arrival_time = moment(flightSegmentDetails[0].strArrivalTime,"HH:mm").format("h:mm A");
                            
                            let arrival_date_time = flightSegmentDetails[0].strArrivalDate +'T'+ flightSegmentDetails[0].strArrivalTime;
                            stop.arrival_date_time = moment(arrival_date_time).format("YYYY-MM-DDTHH:mm:SS");
                            stop.arrival_info = 
                                typeof airports[stop.arrival_code] !== "undefined"
                                ? airports[stop.arrival_code]
                                : {};
                            stop.eticket = true; // please check this
                            stop.flight_number = flightSegmentDetails[0].flightNum;
                            stop.cabin_class = Generic.generateTitleCase(flightSegmentDetails[0].cabinClass)
                            stopDuration = DateTime.convertSecondsToHourMinutesSeconds(
                                flightSegmentDetails[0].flightTime * 60
                            );
                            
                            stop.duration = `${stopDuration.hours}h ${stopDuration.minutes}m`;
                            stop.airline = flightSegmentDetails[0].airline;
                            stop.remaining_seat = parseInt(flightSegmentDetails[0].availabilityCount);
                            stop.below_minimum_seat = parseInt(flightSegmentDetails[0].availabilityCount) < 5 ? true : false; // please correct this line
                            stop.is_layover = false; // static
                            
                            stop.airline_name = airlines[flightSegmentDetails[0].airline];
                            stop.airline_logo = `${s3BucketUrl}/assets/images/airline/108x92/${stop.airline}.png`;
                            
                            stop.cabin_baggage = ""; // please check
                            stop.checkin_baggage = ""; // please check
                            stop.meal = "";
                            
                            let layOverduration = "";
                            stop.is_layover = false;
                            stop.layover_duration = "";
                            stop.layover_airport_name = ""
                            if(stops.length > 0) {
                                stop.is_layover = true;
                                let layOverduration = 
                                    DateTime.convertSecondsToHourMinutesSeconds(
                                        moment(stop.departure_date_time).diff(
                                            stops[stops.length - 1].arrival_date_time,
                                            "seconds"
                                        )
                                    );
                                
                                totalDuration +=  
                                    moment(stop.departure_date_time).diff(
                                        stops[stops.length - 1].arrival_date_time,
                                        "seconds"
                                    );
                                
                                stop.layover_duration = `${layOverduration.hours}h ${layOverduration.minutes}m`;
                                stop.layover_airport_name = flightSegmentDetails[0].departure;

                            }
                            // for routeCode generation
                            var outboundJourneyArr = {
                                "airline": stop.airline,
                                "arrival": stop.arrival_code,
                                "arrivalDate": flightSegmentDetails[0].strArrivalDate,
                                "arrivalTime": flightSegmentDetails[0].strArrivalTime,
                                "bookingCode": flightSegmentDetails[0].bookingCode,
                                "departure": flightSegmentDetails[0].departure,
                                "departureDate": flightSegmentDetails[0].strDepartureDate,
                                "departureTime": flightSegmentDetails[0].strDepartureTime,
                                "flightNum": flightSegmentDetails[0].flightNum
                            }
                            outboundJourney.push(outboundJourneyArr)
                            uniqueCode += stop.flight_number;
                            uniqueCode += stop.airline;
                            uniqueCode += stop.cabin_class;
                            stops.push(stop);
                        }
                    }
                    
                    routeType = new RouteType();
                    routeType.type = "outbound";
                    routeType.stops = stops;
                    
                    let outBoundDuration = DateTime.convertSecondsToHourMinutesSeconds(
                        totalDuration
                    );

                    routeType.duration = `${outBoundDuration.hours}h ${outBoundDuration.minutes}m`;
                    route.routes[0] = routeType;
                    route.is_passport_required = null; //
                    route.departure_code = stops[0].departure_code;
                    route.departure_date = stops[0].departure_date;
                    route.departure_time = stops[0].departure_time;
                    route.arrival_code = stops[stops.length - 1].arrival_code;
                }
                if(flightRoutes.journeys.journey_1 != undefined) {
                    
                    stops = [];
                    inBoundflightSegments = flightRoutes.journeys.journey_1;
                    inboundFlightDetails = results.data.flights.filter(item => item.flightId == inBoundflightSegments);

                    if(inboundFlightDetails) {
                        
                        flightSegments = inboundFlightDetails[0].segmengtIds
                        
                        for(let x = 0; x < flightSegments.length; x++) {
                            
                            flightSegmentDetails = results.data.segments.filter(item => item.segmentId == flightSegments[x])
                            if(flightSegmentDetails) {
                                
                                stop = new Stop();
                                
                                inTotalDuration += flightSegmentDetails[0].flightTime * 60;
                                
                                stop.departure_code = flightSegmentDetails[0].departure;
                                
                                stop.departure_date = moment(flightSegmentDetails[0].departureDate).format("DD/MM/YYYY");
                                
                                stop.departure_time = moment(flightSegmentDetails[0].strDepartureTime,"HH:mm").format("h:mm A");
                                
                                let departure_date_time = flightSegmentDetails[0].strDepartureDate +'T'+ flightSegmentDetails[0].strDepartureTime;
                                
                                stop.departure_date_time = moment(departure_date_time).format("YYYY-MM-DDTHH:mm:SS");
                                stop.departure_info = 
                                typeof airports[stop.departure_code] !== "undefined"
                                    ? airports[stop.departure_code]
                                    : {};
                                
                                stop.arrival_code = flightSegmentDetails[0].arrival;
                                stop.arrival_date = moment(flightSegmentDetails[0].arrivalDate).format("DD/MM/YYYY");
                                stop.arrival_time = moment(flightSegmentDetails[0].strArrivalTime,"HH:mm").format("h:mm A");
                                
                                let arrival_date_time = flightSegmentDetails[0].strArrivalDate +'T'+ flightSegmentDetails[0].strArrivalTime;
                                stop.arrival_date_time = moment(arrival_date_time).format("YYYY-MM-DDTHH:mm:SS");
                                stop.arrival_info = 
                                    typeof airports[stop.arrival_code] !== "undefined"
                                    ? airports[stop.arrival_code]
                                    : {};
                                
                                stop.eticket = true; // please check this
                                stop.flight_number = flightSegmentDetails[0].flightNum;
                                stop.cabin_class = flightSegmentDetails[0].cabinClass
                                stopDuration = DateTime.convertSecondsToHourMinutesSeconds(
                                    flightSegmentDetails[0].flightTime * 60
                                );
                                
                                stop.duration = `${stopDuration.hours}h ${stopDuration.minutes}m`;
                                stop.airline = flightSegmentDetails[0].airline;
                                stop.remaining_seat = parseInt(flightSegmentDetails[0].availabilityCount);
                                stop.below_minimum_seat = parseInt(flightSegmentDetails[0].availabilityCount) < 5 ? true : false; // please correct this line
                                stop.is_layover = false; // static
                                
                                stop.airline_name = airlines[flightSegmentDetails[0].airline];
                                stop.airline_logo = `${s3BucketUrl}/assets/images/airline/108x92/${stop.airline}.png`;
                                stop.cabin_baggage = ""; // please check
                                stop.checkin_baggage = ""; // please check
                                stop.meal = "";
                                
                                let layOverduration = "";
                                stop.is_layover = false;
                                stop.layover_duration = "";
                                stop.layover_airport_name = ""
                                if(stops.length > 0) {
                                    stop.is_layover = true;
                                    let layOverduration = 
                                        DateTime.convertSecondsToHourMinutesSeconds(
                                            moment(stop.departure_date_time).diff(
                                                stops[stops.length - 1].arrival_date_time,
                                                "seconds"
                                            )
                                        );
                                    inTotalDuration +=  
                                        moment(stop.departure_date_time).diff(
                                            stops[stops.length - 1].arrival_date_time,
                                            "seconds"
                                        );
                                    stop.layover_duration = `${layOverduration.hours}h ${layOverduration.minutes}m`;
                                    stop.layover_airport_name = flightSegmentDetails[0].departure;

                                }
                                // for routeCode generation
                                var inboundjourneyArr = {
                                    "airline": stop.airline,
                                    "arrival": stop.arrival_code,
                                    "arrivalDate": flightSegmentDetails[0].strArrivalDate,
                                    "arrivalTime": flightSegmentDetails[0].strArrivalTime,
                                    "bookingCode": flightSegmentDetails[0].bookingCode,
                                    "departure": flightSegmentDetails[0].departure,
                                    "departureDate": flightSegmentDetails[0].strDepartureDate,
                                    "departureTime": flightSegmentDetails[0].strDepartureTime,
                                    "flightNum": flightSegmentDetails[0].flightNum
                                }
                                inboundJourney.push(inboundjourneyArr);
                                uniqueCode += stop.flight_number;
                                uniqueCode += stop.airline;
                                uniqueCode += stop.cabin_class;
                                stops.push(stop);
                            }
                        }
                        
                        routeType = new RouteType();
                        routeType.type = "inbound";
                        routeType.stops = stops;
                        
                        let duration = DateTime.convertSecondsToHourMinutesSeconds(
                            inTotalDuration
                        );
                        
                        routeType.duration = `${duration.hours}h ${duration.minutes}m`;
                        route.routes[1] = routeType;
                        
                    }
                }
                
                let markup = await this.getMarkupDetails(
                    moment(stops[0].departure_date, "DD/MM/YYYY").format(
                        "YYYY-MM-DD"
                    ),
                    bookingDate,
                    user,
                    1
                );

                let markUpDetails = markup.markUpDetails;
                console.log("markUpDetails", markUpDetails)
                let secondaryMarkUpDetails = markup.secondaryMarkUpDetails;
                if (!markUpDetails) {
                    throw new InternalServerErrorException(
                        `Markup is not configured for flight&&&module&&&${errorMessage}`
                    );
                }

                
                route.route_code = route_code; // i used it from requestBody;
                route.fare_type = "" // discussion needed
                // route.arrival_code = stops[stops.length - 1].arrival_code;
                            
                let totalAmount = flightRoutes.adtFare + flightRoutes.adtTax + flightRoutes.chdFare + flightRoutes.chdTax + flightRoutes.tktFee + flightRoutes.platformServiceFee;
                // console.log("total_amount", totalAmount,flightRoutes.adtFare,flightRoutes.adtTax,flightRoutes.chdFare,flightRoutes.chdTax,flightRoutes.infFare,flightRoutes.infTax,flightRoutes.tktFee  )
                route.net_rate = Generic.convertAmountTocurrency(
                    totalAmount,
                    currencyDetails.liveRate
                );
                route.fare_break_dwon = [];
                if (
                    typeof secondaryMarkUpDetails != "undefined" &&
                    Object.keys(secondaryMarkUpDetails).length
                ) {
                    route.secondary_fare_break_down = [];
                };
                route.selling_price = Generic.formatPriceDecimal(
                    PriceMarkup.applyMarkup(route.net_rate, markUpDetails)
                )
                console.log("route.selling_price", route.selling_price)
                let routeDetails: any = await RouteCategory.flightRouteAvailability(
                    route.departure_code,
                    route.arrival_code
                );

                
                let searchData = {
                    departure: route.departure_code, arrival: route.arrival_code, checkInDate: moment(stops[0].departure_date, "DD/MM/YYYY").format(
                        "YYYY-MM-DD"
                    )
                }
                let offerData = await LandingPage.getOfferData(referralId, 'flight', searchData)
                route.discounted_selling_price = LandingPage.applyDiscount(offerData, route.selling_price)
                route.start_price = 0;
                route.secondary_start_price = 0;
                route.instalment_avail_after = 
                    routeDetails?.category?.installmentAvailableAfter;
                let instalmentEligibility: {
                    available: boolean;
                    categoryId: number;
                } | {
                    available: boolean;
                    categoryId?: undefined;
                }

                
                let instalmentEligibilityIndex = `${searchData.departure}-${searchData.arrival}`
                if (typeof instalmentEligibilityCase[instalmentEligibilityIndex] != "undefined") {
                    instalmentEligibility = instalmentEligibilityCase[instalmentEligibilityIndex]
                } else {
                    instalmentEligibility = await RouteCategory.checkInstalmentEligibility(
                        searchData
                    );
                    instalmentEligibilityCase[instalmentEligibilityIndex] = instalmentEligibility
                }
                route.is_installment_available = instalmentEligibility.available
                let instalmentDetails;
                let discountedInstalmentDetails;
                let departure_date = moment(stops[0].departure_date, "DD/MM/YYYY").format(
                    "YYYY-MM-DD"
                )
                let daysUtilDepature = moment(departure_date).diff(moment().format("YYYY-MM-DD"), 'days')
                let configCaseIndex = `${instalmentEligibility.categoryId}-${daysUtilDepature}`
                let paymentConfig: PaymentConfiguration

                if (typeof paymentConfigCase[configCaseIndex] != "undefined") {
                    paymentConfig = paymentConfigCase[configCaseIndex]
                    //console.log("oldUsed", configCaseIndex, typeof paymentConfigCase[configCaseIndex])

                } else {
                    paymentConfig = await PaymentConfigurationUtility.getPaymentConfig(1, instalmentEligibility.categoryId, daysUtilDepature)
                    paymentConfigCase[configCaseIndex] = paymentConfig
                    //console.log("new_config", configCaseIndex,typeof paymentConfigCase[configCaseIndex])
                }

                route.payment_config = paymentConfig || {}

                //console.log("paymentConfig", paymentConfig)



                if (instalmentEligibility.available) {

                    let weeklyCustomDownPayment = LandingPage.getDownPayment(offerData, 0);
                    let downPaymentOption: any = paymentConfig.downPaymentOption
                    if (paymentConfig.isWeeklyInstallmentAvailable) {
                        instalmentDetails = Instalment.weeklyInstalment(
                            route.selling_price,
                            departure_date,
                            bookingDate,
                            weeklyCustomDownPayment!=null?weeklyCustomDownPayment:downPaymentOption[0],
                            weeklyCustomDownPayment!=null?false:paymentConfig.isDownPaymentInPercentage
                        );
                        if (instalmentDetails.instalment_available) {
                            route.start_price =
                                instalmentDetails.instalment_date[0].instalment_amount;

                            route.secondary_start_price =
                                instalmentDetails.instalment_date[1].instalment_amount;
                            route.no_of_weekly_installment =
                                instalmentDetails.instalment_date.length - 1;
                        }
                        else{
                            paymentConfig.isWeeklyInstallmentAvailable=false;
                        }

                    }

                    if (paymentConfig.isBiWeeklyInstallmentAvailable) {
                        let instalmentDetails2 = Instalment.biWeeklyInstalment(
                            route.selling_price,
                            departure_date,
                            bookingDate,
                            downPaymentOption[0],
                            paymentConfig.isDownPaymentInPercentage
                        );
                        
                        if(instalmentDetails2.instalment_available){

                            route.second_down_payment =
                            instalmentDetails2.instalment_date[0].instalment_amount;
                            route.secondary_start_price_2 =
                            instalmentDetails2.instalment_date[1].instalment_amount;
                            route.no_of_weekly_installment_2 =
                            instalmentDetails2.instalment_date.length - 1;
                        }
                        else{
                            paymentConfig.isBiWeeklyInstallmentAvailable=false;
                        }
                    }


                    if (paymentConfig.isMonthlyInstallmentAvailable) {
                        let instalmentDetails3 = Instalment.monthlyInstalment(
                            route.selling_price,
                            departure_date,
                            bookingDate,
                            downPaymentOption[0],
                            paymentConfig.isDownPaymentInPercentage
                        );

                        if(instalmentDetails3.instalment_available){

                            route.third_down_payment =
                            instalmentDetails3.instalment_date[0].instalment_amount;
                            route.secondary_start_price_3 =
                            instalmentDetails3.instalment_date[1].instalment_amount;
                            route.no_of_weekly_installment_3 =
                            instalmentDetails3.instalment_date.length - 1;
                        }
                        else{
                            paymentConfig.isMonthlyInstallmentAvailable=false;
                        }
                    }


                    discountedInstalmentDetails = Instalment.weeklyInstalment(
                        route.discounted_selling_price,
                        departure_date,
                        bookingDate,
                        weeklyCustomDownPayment!=null?weeklyCustomDownPayment:downPaymentOption[0],
                        weeklyCustomDownPayment!=null?false:paymentConfig.isDownPaymentInPercentage
                    );

                    if (discountedInstalmentDetails.instalment_available) {
                        route.discounted_start_price =
                            discountedInstalmentDetails.instalment_date[0].instalment_amount;

                        route.discounted_secondary_start_price =
                            discountedInstalmentDetails.instalment_date[1].instalment_amount;

                        route.discounted_no_of_weekly_installment =
                            discountedInstalmentDetails.instalment_date.length - 1;
                    }
                }

                if (offerData.applicable) {
                    instalmentEligibility.available = true
                    route.payment_object = {
                        installment_type: InstalmentType.WEEKLY,
                        weekly: {
                            down_payment: route.discounted_start_price,
                            installment: route.discounted_secondary_start_price,
                            installment_count: route.discounted_no_of_weekly_installment,
                            actual_installment: route.secondary_start_price
                        }
                    }
                } else if (instalmentEligibility.available) {
                    route.payment_object = {}
                    let t
                    if (paymentConfig.isWeeklyInstallmentAvailable) {
                        t = InstalmentType.WEEKLY

                    } else if (paymentConfig.isBiWeeklyInstallmentAvailable) {
                        t = InstalmentType.BIWEEKLY

                    } else if (paymentConfig.isMonthlyInstallmentAvailable) {
                        t = InstalmentType.MONTHLY
                    }
                    if (paymentConfig.isWeeklyInstallmentAvailable) {
                        route.payment_object[InstalmentType.WEEKLY] = {
                            down_payment: route.discounted_start_price,
                            installment: route.discounted_secondary_start_price,
                            installment_count: route.discounted_no_of_weekly_installment
                        }
                    }
                    if (paymentConfig.isBiWeeklyInstallmentAvailable) {
                       
                        route.payment_object[InstalmentType.BIWEEKLY] = {
                            down_payment: route.second_down_payment,
                            installment: route.secondary_start_price_2,
                            installment_count: route.no_of_weekly_installment_2
                        }
                    }
                    if (paymentConfig.isMonthlyInstallmentAvailable) {
                       
                        route.payment_object[InstalmentType.MONTHLY] = {
                            down_payment: route.third_down_payment,
                            installment: route.secondary_start_price_3,
                            installment_count: route.no_of_weekly_installment_3
                        }
                    }
                    route.payment_object['installment_type'] = t

                } else {
                    route.payment_object = {
                        selling_price: route.discounted_selling_price
                    }
                }
                route.is_installment_available = instalmentEligibility.available

                if (
                    typeof secondaryMarkUpDetails != "undefined" &&
                    Object.keys(secondaryMarkUpDetails).length
                ) {
                    route.secondary_selling_price = Generic.formatPriceDecimal(
                        PriceMarkup.applyMarkup(
                            route.net_rate,
                            secondaryMarkUpDetails
                        )
                    );
                } else {
                    route.secondary_selling_price = 0;
                }
                route.instalment_details = instalmentDetails;
                route.stop_count = stops.length - 1;

                route.arrival_date = stops[stops.length - 1].arrival_date;
                route.arrival_time = stops[stops.length - 1].arrival_time;
                let duration = DateTime.convertSecondsToHourMinutesSeconds(
                    totalDuration
                );
                console.log("Total Duration down", totalDuration);
                console.log("duration", duration)

                route.total_duration = `${duration.hours}h ${duration.minutes}m`;
                route.airline = stops[0].airline;
                route.airline_name = airlines[stops[0].airline];
                route.airline_logo = `${s3BucketUrl}/assets/images/airline/108x92/${stops[0].airline}.png`;
                route.is_refundable = null;
                route.fare_break_dwon = [];
                route.unique_code = md5(uniqueCode);
                route.offer_data = offerData;
                
                const [caegory] = await getConnection().query(`select 
                    (select name from laytrip_category where id = flight_route.category_id)as categoryName 
                    from flight_route 
                    where from_airport_code  = '${route.departure_code}' and to_airport_code = '${route.arrival_code}'`);

                let categoryName = caegory?.categoryname;
                route.category_name = categoryName;
                route.log_file = logFile
                route.markUpDetails = JSON.stringify(markUpDetails)
                route.supplier = "pkfare";
                routes.push(route);

            return routes
        } else {
            throw new NotFoundException(`Flight is not available now. Log File : ${logFile}`);
        }
    }

    async bookFlight(
       param,
       param1,
       param2
    ) {

    }

    async tripDetails(param1) {

    }

    async cancellationPolicy(param1) {

    }

    async ticketFlight(param1) {

    }

    async getMarkupDetails(departure_date, bookingDate, user, module) {
        let isInstalmentAvaible = Instalment.instalmentAvailbility(
            departure_date,
            bookingDate
        );

        let markUpDetails;
        let secondaryMarkUpDetails;
        if (!user?.roleId || user?.roleId == 7) {
            markUpDetails = await PriceMarkup.getMarkup(
                module,
                7,
                "no-instalment"
            );
        } else if (
            isInstalmentAvaible &&
            (user.roleId == 5 || user.roleId == 6)
        ) {
            markUpDetails = await PriceMarkup.getMarkup(
                module,
                user.roleId,
                "instalment"
            );
            secondaryMarkUpDetails = await PriceMarkup.getMarkup(
                module,
                user.roleId,
                "no-instalment"
            );
        } else {
            markUpDetails = await PriceMarkup.getMarkup(
                module,
                user.roleId,
                "no-instalment"
            );
        }

        if (!markUpDetails) {
            throw new InternalServerErrorException(
                `Markup is not configured for flight&&&module&&&${errorMessage}`
            );
        } else {
            return {
                markUpDetails,
                secondaryMarkUpDetails,
            };
        }
    }

    async getSign() {
        return md5(credential.pkfare_partner_id+credential.pkfare_partner_key);
    }

    getFlightClass(className) {
        return flightClass[className];
    }

    convertToBase64(requestBody) {
        let buffRequestBody = Buffer.from(requestBody);
        let base64RequestBody = buffRequestBody.toString('base64');
        return base64RequestBody;
    }

    async getRoutes(fromLocation, toLocation, isRoundTrip) {
        let fromLocations = [];
        let toLocations = [];
        let combinations = [];


        let from = await getConnection()
            .createQueryBuilder(Airport, "airport")

            .where(`airport.code = '${fromLocation}'`)
            .getOne();
        let to = await getConnection()
            .createQueryBuilder(Airport, "airport")
            .where(`airport.code = '${toLocation}'`)
            .getOne()
        if (from && to) {

            let fromParent = from?.parentId ? from.parentId : -1;
            let toParent = to?.parentId ? to.parentId : -1;
            let q1 = await getConnection()
                .createQueryBuilder(Airport, "airport")
                .where(`airport.id = ${from.id} OR airport.parent_id = ${from.id}`)
            if (fromParent) {
                q1.orWhere(`airport.parent_id = ${fromParent} OR airport.id = ${fromParent}`)
            }
            let getAllfrom = await q1.getMany()
            for await (const iterator of getAllfrom) {
                fromLocations.push(iterator.code)
            }


            let q2 = await getConnection()
                .createQueryBuilder(Airport, "airport")
                .where(`airport.id = ${to.id} OR  airport.parent_id = ${to.id}`)

            if (toParent) {
                q2.orWhere(`airport.parent_id = ${toParent} OR airport.id = ${toParent}`)
            }
            let getAllTo = await q2.getMany()
            for await (const iterator of getAllTo) {
                toLocations.push(iterator.code)
            }
        }

        if (fromLocations.length && toLocations.length) {

            let where = `from_airport_code in (:...fromLocations) AND to_airport_code in (:...toLocations) AND "is_deleted" = false`
            if (isRoundTrip) {
                where = `((from_airport_code in (:...fromLocations) AND to_airport_code in (:...toLocations))OR(from_airport_code in (:...toLocations) AND to_airport_code in (:...fromLocations))) AND "is_deleted" = false`
            }
            let flightRoutes = await getConnection()
                .createQueryBuilder(FlightRoute, "flightRoute")
                .where(where, { fromLocations, toLocations })
                .getMany()

            
            if (flightRoutes.length) {
                let res = []
                for await (const iterator of flightRoutes) {
                    res.push(`${iterator.fromAirportCode + '-' + iterator.toAirportCode}`)
                }

                return res
            } else {
                return;
            }

        } else {
            return
        }
    }

    getKeyByValue(object, value) {
        return Object.keys(object).find((key) => object[key] === value);
    }

    async getBlacklistedAirports() {
        const result = await getConnection().query(`select "name" from airport where is_blacklisted = true or is_deleted  = true `)
        return result
    }

    getBaggageDetails(code) {
        let bags = {
            SB: "Standard Baggage",
        };

        if (typeof bags[code] !== "undefined" && code !== "0PC") {
            return bags[code];
        } else if (code == "0PC") {
            return "";
        } else return code;
    }

    getMinPrice(routes, priceType) {
        return Math.min.apply(
            null,
            routes.map((item) => item[priceType])
        );
    }

    getMaxPrice(routes, priceType) {
        return Math.max.apply(
            null,
            routes.map((item) => item[priceType])
        );
    }

    getStopCounts(routes, type) {
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

    getAirlineCounts(routes) {
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
    getArrivalDepartureTimeSlot(routes, type, routeType) {
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

    generateRouteCode(journey, adults = 0, children = 0, sign, type, journey1 = []) {
        // console.log("Journey-->", journey)
        let requestParam = {};
        if(type == "oneway") {
            requestParam = {
                "authentication": {
                    "partnerId": `${credential.pkfare_partner_id}`,
                    "sign": `${sign}`
                },
                "pricing": {
                    "adults": `${adults}`,
                    "children": `${children}`,
                    "journeys": {
                        "journey_0": journey
                    }
                }
            }
        } else if(type == "roundtrip") {
            requestParam = {
                "authentication": {
                    "partnerId": `${credential.pkfare_partner_id}`,
                    "sign": `${sign}`
                },
                "pricing": {
                    "adults": `${adults}`,
                    "children": `${children}`,
                    "journeys": {
                        "journey_0": journey,
                        "journey_1": journey1
                    }
                }
            }
        }
        
        
        return this.convertToBase64(JSON.stringify(requestParam));
    }

}