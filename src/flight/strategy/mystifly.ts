import { StrategyAirline } from "./strategy.interface";
import { OneWaySearchFlightDto } from "../dto/oneway-flight.dto";
import { NotFoundException, InternalServerErrorException } from "@nestjs/common";
import { RoundtripSearchFlightDto } from "../dto/roundtrip-flight.dto";
import Axios from 'axios';
import * as xml2js from 'xml2js';
import * as moment from 'moment';
import { DateTime } from "src/utility/datetime.utility";
import { Stop } from "../model/stop.model";
import { Route, RouteType, FlightSearchResult, PriceRange, StopData } from "../model/route.model";
import { Generic } from "src/utility/generic.utility";
import { getManager } from "typeorm";
import { Airport } from "src/entity/airport.entity";
import { Instalment } from "src/utility/instalment.utility";
import { PriceMarkup } from "src/utility/markup.utility";
import { Module } from "src/entity/module.entity";
import { errorMessage } from "src/config/common.config";
import { Markup } from "src/entity/markup.entity";
import { airlines } from "../airline";
const fs = require('fs').promises;

export class Mystifly implements StrategyAirline{

    private headers;
    constructor(
        headers
    ){
        this.headers = headers;
    }

    async getMystiflyCredential(){

        const config = await Generic.getCredential('flight');
        let mystiflyConfig= JSON.parse(config.testCredential)
        if(config.mode){
            mystiflyConfig = JSON.parse(config.liveCredential);
        }
        return mystiflyConfig;
    }
    async createSession(){

        const mystiflyConfig =await this.getMystiflyCredential();
        
        const requestBody = 
            `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mys="Mystifly.OnePoint" xmlns:mys1="http://schemas.datacontract.org/2004/07/Mystifly.OnePoint">
            <soapenv:Header/>
            <soapenv:Body>
            <mys:CreateSession>
                <mys:rq>
                    <mys1:AccountNumber>${mystiflyConfig.account_number}</mys1:AccountNumber>
                    <mys1:Password>${mystiflyConfig.password}</mys1:Password>
                    <mys1:Target>${mystiflyConfig.target}</mys1:Target>
                    <mys1:UserName>${mystiflyConfig.user_name}</mys1:UserName>
                </mys:rq>
            </mys:CreateSession>
            </soapenv:Body>
        </soapenv:Envelope>`;
        let sessionResult =await Axios({
            method: 'POST',
            url: mystiflyConfig.url,
            data: requestBody,
            headers: {
                'content-type':'text/xml',
                'Accept-Encoding':'gzip',
                'soapaction':"Mystifly.OnePoint/OnePoint/CreateSession",
                'charset':'UTF-8',
                'cache-control':'no-cache'
            }
        })

        sessionResult = await xml2js.parseStringPromise(sessionResult.data,{
            normalizeTags :true,
            ignoreAttrs:true
        });
        const sessionToken = sessionResult['s:envelope']['s:body'][0].createsessionresponse[0].createsessionresult[0]['a:sessionid'][0];
        await fs.writeFile("src/flight/mystifly-session.json", JSON.stringify({sessionToken, created_time:new Date()}))
        return sessionToken;
    }
    async startSession(){
        try{
            let sessionDetails = await fs.readFile("src/flight/mystifly-session.json","binary");
            sessionDetails = JSON.parse(sessionDetails);
            let currentTime = new Date();
            let diff = moment(currentTime).diff(sessionDetails.created_time,'seconds')
            if(diff>1200){
               return await this.createSession();
            }
            else{
                return sessionDetails.sessionToken;
            }
        }
        catch(e){
           return await this.createSession();
        }
    }

    async oneWaySearch(searchFlightDto:OneWaySearchFlightDto,user)/* :Promise<FlightSearchResult> */ {
        
        const mystiflyConfig = await this.getMystiflyCredential();
        const sessionToken = await this.startSession();
        const {
            source_location,
            destination_location,
            departure_date,
            flight_class,
            adult_count,
            child_count,
            infant_count
        } = searchFlightDto;

        let module = await getManager()
            .createQueryBuilder(Module, "module")
            .where("module.name = :name", { name:'flight' })
            .getOne();

        if(!module){
            throw new InternalServerErrorException(`Flight module is not configured in database&&&module&&&${errorMessage}`);
        }
        const currencyDetails = await Generic.getAmountTocurrency(this.headers.currency);
        const markUpDetails   = await PriceMarkup.getMarkup(module.id,user.roleId);
        if(!markUpDetails){
            throw new InternalServerErrorException(`Markup is not configured for flight&&&module&&&${errorMessage}`);
        }

        let requestBody = '';
        requestBody += `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mys="Mystifly.OnePoint" xmlns:mys1="http://schemas.datacontract.org/2004/07/Mystifly.OnePoint" xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays">`
        requestBody += `<soapenv:Header/>`
        requestBody += `<soapenv:Body>`
        requestBody += `<mys:AirLowFareSearch>`
        requestBody += `<mys:rq>`
        requestBody += `<mys1:OriginDestinationInformations>`
        requestBody += `<mys1:OriginDestinationInformation>`
        requestBody += `<mys1:DepartureDateTime>${departure_date}T00:00:00</mys1:DepartureDateTime>`
        requestBody += `<mys1:DestinationLocationCode>${destination_location}</mys1:DestinationLocationCode>`
        requestBody += `<mys1:OriginLocationCode>${source_location}</mys1:OriginLocationCode>`
        requestBody += `</mys1:OriginDestinationInformation>`
        requestBody += `</mys1:OriginDestinationInformations>`
        requestBody += `<mys1:PassengerTypeQuantities>`
        if(adult_count>0){

            requestBody += `<mys1:PassengerTypeQuantity>`
            requestBody += `<mys1:Code>ADT</mys1:Code>`
            requestBody += `<mys1:Quantity>${adult_count}</mys1:Quantity>`
            requestBody += `</mys1:PassengerTypeQuantity>`
        }

        if(child_count>0){

            requestBody += `<mys1:PassengerTypeQuantity>`
            requestBody += `<mys1:Code>CHD</mys1:Code>`
            requestBody += `<mys1:Quantity>${child_count}</mys1:Quantity>`
            requestBody += `</mys1:PassengerTypeQuantity>`
        }

        if(infant_count>0){

            requestBody += `<mys1:PassengerTypeQuantity>`
            requestBody += `<mys1:Code>CHD</mys1:Code>`
            requestBody += `<mys1:Quantity>${infant_count}</mys1:Quantity>`
            requestBody += `</mys1:PassengerTypeQuantity>`
        }

        requestBody += `</mys1:PassengerTypeQuantities>`
        requestBody += `<mys1:PricingSourceType>All</mys1:PricingSourceType>`
        requestBody += `<mys1:RequestOptions>Fifty</mys1:RequestOptions>`
        requestBody += `<mys1:SessionId>${sessionToken}</mys1:SessionId>`
        requestBody += `<mys1:Target>${mystiflyConfig.target}</mys1:Target>`
        requestBody += `<mys1:TravelPreferences>`
        requestBody += `<mys1:AirTripType>OneWay</mys1:AirTripType>`
        //requestBody += `<mys1:CabinPreference>Y</mys1:CabinPreference>`
        requestBody += `<mys1:MaxStopsQuantity>All</mys1:MaxStopsQuantity>`
        requestBody += `</mys1:TravelPreferences>`
        requestBody += `<mys1:Preferences>`
        requestBody += `<mys1:CabinClassPreference>`
        requestBody += `<mys1:CabinType>${this.getFlightClass(flight_class)}</mys1:CabinType>`
        requestBody += `<mys1:PreferenceLevel>Restricted</mys1:PreferenceLevel>`
        requestBody += `</mys1:CabinClassPreference>`
        requestBody += `</mys1:Preferences>`
        requestBody += `</mys:rq>`
        requestBody += `</mys:AirLowFareSearch>`
        requestBody += `</soapenv:Body>`
        requestBody += `</soapenv:Envelope>`
        let searchResult =await Axios({
            method: 'POST',
            url: mystiflyConfig.url,
            data: requestBody,
            headers: {
                'content-type':'text/xml',
                'Accept-Encoding':'gzip',
                'soapaction':"Mystifly.OnePoint/OnePoint/AirLowFareSearch",
                'charset':'UTF-8',
                'cache-control':'no-cache'
            }
        })
        searchResult = await xml2js.parseStringPromise(searchResult.data,{
            normalizeTags :true,
            ignoreAttrs:true
        });
        
        if(searchResult['s:envelope']['s:body'][0].airlowfaresearchresponse[0].airlowfaresearchresult[0]['a:success'][0]=="true") {
            
            let bookingDate         = moment(new Date()).format("YYYY-MM-DD");
            let flightRoutes = searchResult['s:envelope']['s:body'][0].airlowfaresearchresponse[0].airlowfaresearchresult[0]['a:priceditineraries'][0]['a:priceditinerary'];
            let stop:Stop;
            let stops:Stop[]=[];
            let routes:Route[]=[];
            let route:Route;
            let routeType:RouteType;
            let flightSegments=[];

            

            for(let i=0; i < flightRoutes.length; i++){
                route=new Route;
                stops=[];
                flightSegments = flightRoutes[i]['a:origindestinationoptions'][0]['a:origindestinationoption'][0]['a:flightsegments'][0]['a:flightsegment'];
                flightSegments.forEach(flightSegment => {
                    stop=new Stop();
                    stop.departure_code        = flightSegment['a:departureairportlocationcode'][0];
                    stop.departure_date        = moment(flightSegment['a:departuredatetime'][0]).format("DD/MM/YYYY")
                    stop.departure_time        = moment(flightSegment['a:departuredatetime'][0]).format("hh:mm A")
                    stop.departure_date_time   = flightSegment['a:departuredatetime'][0];
                    stop.arrival_code          = flightSegment['a:arrivalairportlocationcode'][0];
                    stop.arrival_date          = moment(flightSegment['a:arrivaldatetime'][0]).format("DD/MM/YYYY")
                    stop.arrival_time          = moment(flightSegment['a:arrivaldatetime'][0]).format("hh:mm A")
                    stop.arrival_date_time     = flightSegment['a:arrivaldatetime'][0];
                    stop.eticket               = flightSegment['a:eticket'][0]=='true'?true:false;
                    stop.flight_number         = flightSegment['a:flightnumber'][0];
                    stop.duration              = flightSegment['a:journeyduration'][0];
                    stop.airline               = flightSegment['a:marketingairlinecode'][0];
                    stop.remaining_seat        = parseInt(flightSegment['a:seatsremaining'][0]['a:number'][0]);
                    stop.below_minimum_seat    = flightSegment['a:seatsremaining'][0]['a:belowminimum'][0]=='true'?true:false;
                    stop.is_layover            = false;
                    stop.airline_name          = airlines[flightSegment['a:marketingairlinecode'][0]];
                    stop.airline_logo          = '';
                    if(stops.length>0){

                        stop.is_layover             =  true;
                        let layOverduration         =  DateTime.convertSecondsToHourMinutesSeconds( moment(stop.departure_date_time).diff(stops[stops.length-1].arrival_date_time,'seconds'));
                        stop.layover_duration       =  `${layOverduration.hours} h ${layOverduration.minutes} m`
                        stop.layover_airport_name   =  flightSegment['a:departureairportlocationcode'][0];
                    }
                    stops.push(stop)
                });
                routeType= new RouteType();
                routeType.type          = 'outbound';
                routeType.stops         = stops;
                route.routes[0]         = routeType;
                route.route_code        = flightRoutes[i]['a:airitinerarypricinginfo'][0]['a:faresourcecode'][0];
                route.net_rate          = Generic.convertAmountTocurrency(flightRoutes[i]['a:airitinerarypricinginfo'][0]['a:itintotalfare'][0]['a:totalfare'][0]['a:amount'][0],currencyDetails.liveRate);
                route.selling_price     = PriceMarkup.applyMarkup(route.net_rate,markUpDetails)
                let instalmentDetails   = Instalment.weeklyInstalment(route.net_rate,moment(stops[0].departure_date,'DD/MM/YYYY').format("YYYY-MM-DD"),bookingDate,0);
                if(instalmentDetails.instalment_available){
                    route.start_price   = instalmentDetails.instalment_date[0].instalment_amount;
                }
                else{
                    route.start_price   = '0';
                }
                route.stop_count        = stops.length-1;
                route.departure_code    = source_location;
                route.arrival_code      = destination_location;
                route.departure_date    = stops[0].departure_date;
                route.departure_time    = stops[0].departure_time;
                route.arrival_date      = stops[stops.length-1].arrival_date;
                route.arrival_time      = stops[stops.length-1].arrival_time;
                let totalDuration       = DateTime.convertSecondsToHourMinutesSeconds(moment( stops[stops.length-1].arrival_date_time).diff(stops[0].departure_date_time,'seconds'));
                 
                route.total_duration    = `${totalDuration.hours} h ${totalDuration.minutes} m`;
                route.airline           = stops[0].airline;
                route.airline_name      = airlines[stops[0].airline];
                route.airline_logo      = '';
                route.is_refundable     = flightRoutes[i]['a:airitinerarypricinginfo'][0]['a:isrefundable'][0]=='Yes'?true:false;
                routes.push(route);
            }
            let flightSearchResult= new FlightSearchResult();
            flightSearchResult.items=routes;

            //Get min & max selling price
            let priceRange = new PriceRange();
            let priceType = 'selling_price';
            priceRange.min_price = this.getMinPrice(routes,priceType);
            priceRange.max_price =this.getMaxPrice(routes,priceType);
            flightSearchResult.price_range=priceRange;

            //Get min & max partail payment price
            let partialPaymentPriceRange = new PriceRange();
            priceType='start_price';
            partialPaymentPriceRange.min_price = this.getMinPrice(routes,priceType);
            partialPaymentPriceRange.max_price =this.getMaxPrice(routes,priceType);
            flightSearchResult.partial_payment_price_range=partialPaymentPriceRange;
            //return flightSearchResult;

            //Get Stops count and minprice
            
            let stopsData={
                non_stop:{
                   count:0,
                   min_price:null
                },
                one_stop:{
                    count:0,
                   min_price:null
                },
                two_and_two_plus_stop:{
                    count:0,
                   min_price:null
                }
            };
            routes.forEach(route=>{
                if(route.stop_count==0){
                    if(stopsData.non_stop.min_price==null || (stopsData.non_stop.min_price > route.selling_price)){
                            stopsData.non_stop.min_price=route.selling_price;
                    }
                    stopsData.non_stop.count+=1;
                }

                if(route.stop_count==1){
                    if(stopsData.one_stop.min_price==null || (stopsData.one_stop.min_price > route.selling_price)){
                        stopsData.one_stop.min_price=route.selling_price;
                    }
                    stopsData.one_stop.count+=1;
                }

                if(route.stop_count>1){
                    if(stopsData.two_and_two_plus_stop.min_price==null || (stopsData.two_and_two_plus_stop.min_price > route.selling_price)){
                        stopsData.two_and_two_plus_stop.min_price=route.selling_price;
                    }
                    stopsData.two_and_two_plus_stop.count+=1;
                }
            })

            flightSearchResult.stop_data=stopsData;
            return flightSearchResult;
        }
        else{

            throw new NotFoundException(`No flight founds`)
        }
       
    }

    getMinPrice(routes,priceType){
        return Math.min.apply(null, routes.map(item => item[priceType]))
    }

    getMaxPrice(routes,priceType){
        return Math.max.apply(null, routes.map(item => item[priceType]))
    }

    async roundTripSearch(searchFlightDto:RoundtripSearchFlightDto,user){
        
        const mystiflyConfig = await this.getMystiflyCredential();
        const sessionToken = await this.startSession();
        const {
            source_location,
            destination_location,
            departure_date,
            arrival_date,
            flight_class,
            adult_count,
            child_count,
            infant_count
        } = searchFlightDto;

        let module = await getManager()
        .createQueryBuilder(Module, "module")
        .where("module.name = :name", { name:'flight' })
        .getOne();

        if(!module){
            throw new InternalServerErrorException(`Flight module is not configured in database&&&module&&&${errorMessage}`);
        }
        const currencyDetails = await Generic.getAmountTocurrency(this.headers.currency);
        const markUpDetails   = await PriceMarkup.getMarkup(module.id,user.roleId);
        if(!markUpDetails){
            throw new InternalServerErrorException(`Markup is not configured for flight&&&module&&&${errorMessage}`);
        }

        let requestBody = '';
        requestBody += `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mys="Mystifly.OnePoint" xmlns:mys1="http://schemas.datacontract.org/2004/07/Mystifly.OnePoint" xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays">`
        requestBody += `<soapenv:Header/>`
        requestBody += `<soapenv:Body>`
        requestBody += `<mys:AirLowFareSearch>`
        requestBody += `<mys:rq>`
        requestBody += `<mys1:OriginDestinationInformations>`
        requestBody += `<mys1:OriginDestinationInformation>`
        requestBody += `<mys1:DepartureDateTime>${departure_date}T00:00:00</mys1:DepartureDateTime>`
        requestBody += `<mys1:DestinationLocationCode>${destination_location}</mys1:DestinationLocationCode>`
        requestBody += `<mys1:OriginLocationCode>${source_location}</mys1:OriginLocationCode>`
        requestBody += `</mys1:OriginDestinationInformation>`
        requestBody += `<mys1:OriginDestinationInformation>`
        requestBody += `<mys1:DepartureDateTime>${arrival_date}T00:00:00</mys1:DepartureDateTime>`
        requestBody += `<mys1:DestinationLocationCode>${source_location}</mys1:DestinationLocationCode>`
        requestBody += `<mys1:OriginLocationCode>${destination_location}</mys1:OriginLocationCode>`
        requestBody += `</mys1:OriginDestinationInformation>`
        requestBody += `</mys1:OriginDestinationInformations>`
        requestBody += `<mys1:PassengerTypeQuantities>`
        if(adult_count>0){

            requestBody += `<mys1:PassengerTypeQuantity>`
            requestBody += `<mys1:Code>ADT</mys1:Code>`
            requestBody += `<mys1:Quantity>${adult_count}</mys1:Quantity>`
            requestBody += `</mys1:PassengerTypeQuantity>`
        }

        if(child_count>0){

            requestBody += `<mys1:PassengerTypeQuantity>`
            requestBody += `<mys1:Code>CHD</mys1:Code>`
            requestBody += `<mys1:Quantity>${child_count}</mys1:Quantity>`
            requestBody += `</mys1:PassengerTypeQuantity>`
        }

        if(infant_count>0){

            requestBody += `<mys1:PassengerTypeQuantity>`
            requestBody += `<mys1:Code>CHD</mys1:Code>`
            requestBody += `<mys1:Quantity>${infant_count}</mys1:Quantity>`
            requestBody += `</mys1:PassengerTypeQuantity>`
        }

        requestBody += `</mys1:PassengerTypeQuantities>`
        requestBody += `<mys1:PricingSourceType>All</mys1:PricingSourceType>`
        requestBody += `<mys1:RequestOptions>Fifty</mys1:RequestOptions>`
        requestBody += `<mys1:SessionId>${sessionToken}</mys1:SessionId>`
        requestBody += `<mys1:Target>${mystiflyConfig.target}</mys1:Target>`
        requestBody += `<mys1:TravelPreferences>`
        requestBody += `<mys1:AirTripType>Return</mys1:AirTripType>`
        //requestBody += `<mys1:CabinPreference>Y</mys1:CabinPreference>`
        requestBody += `<mys1:MaxStopsQuantity>All</mys1:MaxStopsQuantity>`
        requestBody += `</mys1:TravelPreferences>`
        requestBody += `<mys1:Preferences>`
        requestBody += `<mys1:CabinClassPreference>`
        requestBody += `<mys1:CabinType>${this.getFlightClass(flight_class)}</mys1:CabinType>`
        requestBody += `<mys1:PreferenceLevel>Restricted</mys1:PreferenceLevel>`
        requestBody += `</mys1:CabinClassPreference>`
        requestBody += `</mys1:Preferences>`
        requestBody += `</mys:rq>`
        requestBody += `</mys:AirLowFareSearch>`
        requestBody += `</soapenv:Body>`
        requestBody += `</soapenv:Envelope>`
        let searchResult =await Axios({
            method: 'POST',
            url: mystiflyConfig.url,
            data: requestBody,
            headers: {
                'content-type':'text/xml',
                'Accept-Encoding':'gzip',
                'soapaction':"Mystifly.OnePoint/OnePoint/AirLowFareSearch",
                'charset':'UTF-8',
                'cache-control':'no-cache'
            }
        })
        searchResult = await xml2js.parseStringPromise(searchResult.data,{
            normalizeTags :true,
            ignoreAttrs:true
        });
        
        if(searchResult['s:envelope']['s:body'][0].airlowfaresearchresponse[0].airlowfaresearchresult[0]['a:success'][0]=="true") {
            
            let bookingDate         = moment(new Date()).format("YYYY-MM-DD");
            let flightRoutes = searchResult['s:envelope']['s:body'][0].airlowfaresearchresponse[0].airlowfaresearchresult[0]['a:priceditineraries'][0]['a:priceditinerary'];
            let stop:Stop;
            let stops:Stop[]=[];
            let routes:Route[]=[];
            let route:Route;
            let routeType:RouteType;
            let outBoundflightSegments=[];
            let inBoundflightSegments=[];
            for(let i=0; i < flightRoutes.length; i++){
                route=new Route;
                stops=[];
                outBoundflightSegments = flightRoutes[i]['a:origindestinationoptions'][0]['a:origindestinationoption'][0]['a:flightsegments'][0]['a:flightsegment'];
                inBoundflightSegments = flightRoutes[i]['a:origindestinationoptions'][0]['a:origindestinationoption'][1]['a:flightsegments'][0]['a:flightsegment'];
                outBoundflightSegments.forEach(flightSegment => {
                    stop=new Stop();
                    stop.departure_code        = flightSegment['a:departureairportlocationcode'][0];
                    stop.departure_date        = moment(flightSegment['a:departuredatetime'][0]).format("DD/MM/YYYY")
                    stop.departure_time        = moment(flightSegment['a:departuredatetime'][0]).format("hh:mm A")
                    stop.departure_date_time   = flightSegment['a:departuredatetime'][0];
                    stop.arrival_code          = flightSegment['a:arrivalairportlocationcode'][0];
                    stop.arrival_date          = moment(flightSegment['a:arrivaldatetime'][0]).format("DD/MM/YYYY")
                    stop.arrival_time          = moment(flightSegment['a:arrivaldatetime'][0]).format("hh:mm A")
                    stop.arrival_date_time     = flightSegment['a:arrivaldatetime'][0];
                    stop.eticket               = flightSegment['a:eticket'][0]=='true'?true:false;
                    stop.flight_number         = flightSegment['a:flightnumber'][0];
                    stop.duration              = flightSegment['a:journeyduration'][0];
                    stop.airline               = flightSegment['a:marketingairlinecode'][0];
                    stop.remaining_seat        = parseInt(flightSegment['a:seatsremaining'][0]['a:number'][0]);
                    stop.below_minimum_seat    = flightSegment['a:seatsremaining'][0]['a:belowminimum'][0]=='true'?true:false;
                    stop.is_layover            = false;
                    if(stops.length>0){

                        stop.is_layover             =  true;
                        let layOverduration         =  DateTime.convertSecondsToHourMinutesSeconds( moment(stop.departure_date_time).diff(stops[stops.length-1].arrival_date_time,'seconds'));
                        stop.layover_duration       =  `${layOverduration.hours} h ${layOverduration.minutes} m`
                        stop.layover_airport_name   =  flightSegment['a:departureairportlocationcode'][0];
                    }
                    stops.push(stop)
                });

                routeType=new RouteType();
                routeType.type          = 'outbound';
                routeType.stops         = stops;
                route.routes[0]         = routeType;
                stops=[];
                inBoundflightSegments.forEach(flightSegment => {
                    stop=new Stop();
                    stop.departure_code        = flightSegment['a:departureairportlocationcode'][0];
                    stop.departure_date        = moment(flightSegment['a:departuredatetime'][0]).format("DD/MM/YYYY")
                    stop.departure_time        = moment(flightSegment['a:departuredatetime'][0]).format("hh:mm A")
                    stop.departure_date_time   = flightSegment['a:departuredatetime'][0];
                    stop.arrival_code          = flightSegment['a:arrivalairportlocationcode'][0];
                    stop.arrival_date          = moment(flightSegment['a:arrivaldatetime'][0]).format("DD/MM/YYYY")
                    stop.arrival_time          = moment(flightSegment['a:arrivaldatetime'][0]).format("hh:mm A")
                    stop.arrival_date_time     = flightSegment['a:arrivaldatetime'][0];
                    stop.eticket               = flightSegment['a:eticket'][0]=='true'?true:false;
                    stop.flight_number         = flightSegment['a:flightnumber'][0];
                    stop.duration              = flightSegment['a:journeyduration'][0];
                    stop.airline               = flightSegment['a:marketingairlinecode'][0];
                    stop.remaining_seat        = parseInt(flightSegment['a:seatsremaining'][0]['a:number'][0]);
                    stop.below_minimum_seat    = flightSegment['a:seatsremaining'][0]['a:belowminimum'][0]=='true'?true:false;
                    stop.is_layover            = false;
                    if(stops.length>0){

                        stop.is_layover             =  true;
                        let layOverduration         =  DateTime.convertSecondsToHourMinutesSeconds( moment(stop.departure_date_time).diff(stops[stops.length-1].arrival_date_time,'seconds'));
                        stop.layover_duration       =  `${layOverduration.hours} h ${layOverduration.minutes} m`
                        stop.layover_airport_name   =  flightSegment['a:departureairportlocationcode'][0];
                    }
                    stops.push(stop)
                });
                routeType=new RouteType();
                routeType.type          = 'inbound';
                routeType.stops         = stops;
                route.routes[1]         = routeType;
                route.route_code        = flightRoutes[i]['a:airitinerarypricinginfo'][0]['a:faresourcecode'][0];
                route.net_rate          = flightRoutes[i]['a:airitinerarypricinginfo'][0]['a:itintotalfare'][0]['a:totalfare'][0]['a:amount'][0];
                route.selling_price     = PriceMarkup.applyMarkup(route.net_rate,markUpDetails)
                let instalmentDetails   = Instalment.weeklyInstalment(route.net_rate,moment(stops[0].departure_date,'DD/MM/YYYY').format("YYYY-MM-DD"),bookingDate,0);
                if(instalmentDetails.instalment_available){
                    route.start_price   = instalmentDetails.instalment_date[0].instalment_amount;
                }
                else{
                    route.start_price   = '0';
                }
                route.stop_count        = stops.length-1;
                route.departure_code    = source_location;
                route.arrival_code      = destination_location;
                route.departure_date    = stops[0].departure_date;
                route.departure_time    = stops[0].departure_time;
                route.arrival_date      = stops[stops.length-1].arrival_date;
                route.arrival_time      = stops[stops.length-1].arrival_time;
                let totalDuration       = DateTime.convertSecondsToHourMinutesSeconds(moment( stops[stops.length-1].arrival_date_time).diff(stops[0].departure_date_time,'seconds'));
                 
                route.total_duration    = `${totalDuration.hours} h ${totalDuration.minutes} m`;
                route.airline           = stops[0].airline;
                route.is_refundable     = flightRoutes[i]['a:airitinerarypricinginfo'][0]['a:isrefundable'][0]=='Yes'?true:false;
                routes.push(route);
            }
            return routes;
        }
        else{

            throw new NotFoundException(`No flight founds`)
        }
    }

    async baggageDetails(routeIdDto){
        
        const { route_code } = routeIdDto;
        let fareRuleResult =await this.fareRule(route_code);
        if(fareRuleResult['s:envelope']['s:body'][0].farerules1_1response[0].farerules1_1result[0]['a:success'][0]=='true'){

            let baggageResult =fareRuleResult['s:envelope']['s:body'][0].farerules1_1response[0].farerules1_1result[0]['a:baggageinfos'][0]['a:baggageinfo'];
            let baggageInfos = [];
            let baggageInfo:any={};
            for(let baggage of baggageResult){
                baggageInfo={};
                baggageInfo.departure_code = baggage['a:departure'][0];
                
                let departureAirPort = await getManager()
                .createQueryBuilder(Airport, "airport")
                .where("airport.code = :code ", { code:baggage['a:departure'][0] })
                .getOne();
                
                baggageInfo.departure_airport = departureAirPort.name;

                let arrivalAirPort = await getManager()
                .createQueryBuilder(Airport, "airport")
                .where("airport.code = :code ", { code:baggage['a:arrival'][0] })
                .getOne();
                baggageInfo.arrival_code =baggage['a:arrival'][0];
                baggageInfo.arrival_airport =arrivalAirPort.name;
                baggageInfo.baggage_capacity = baggage['a:baggage'][0];
                baggageInfo.flight_number = baggage['a:flightno'][0];
                
                baggageInfos.push(baggageInfo);
            }
            return baggageInfos;
        }
        else{
            throw new NotFoundException(`No baggage details is found`)
        }
    }

    async fareRule(route_code){
        const mystiflyConfig = await this.getMystiflyCredential();
        const sessionToken = await this.startSession();

        const requestBody = 
            `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mys="Mystifly.OnePoint" xmlns:mys1="http://schemas.datacontract.org/2004/07/Mystifly.OnePoint.AirRules1_1">
            <soapenv:Header/>
            <soapenv:Body>
               <mys:FareRules1_1>
                <mys:rq>
                 <mys1:FareSourceCode>${route_code}</mys1:FareSourceCode>
                   <mys1:SessionId>${sessionToken}</mys1:SessionId>
                  <mys1:Target>${mystiflyConfig.target}</mys1:Target>
                  </mys:rq>
               </mys:FareRules1_1>
            </soapenv:Body>
         </soapenv:Envelope>`;
        let fareRuleResult =await Axios({
            method: 'POST',
            url: mystiflyConfig.url,
            data: requestBody,
            headers: {
                'content-type':'text/xml',
                'Accept-Encoding':'gzip',
                'soapaction':"Mystifly.OnePoint/OnePoint/FareRules1_1",
                'charset':'UTF-8',
                'cache-control':'no-cache'
            }
        })
        
        fareRuleResult = await xml2js.parseStringPromise(fareRuleResult.data,{
            normalizeTags :true,
            ignoreAttrs:true
        });
        return fareRuleResult;
    }

    async airRevalidate(routeIdDto,user){

        const { route_code } = routeIdDto;
        let module = await getManager()
        .createQueryBuilder(Module, "module")
        .where("module.name = :name", { name:'flight' })
        .getOne();

        if(!module){
            throw new InternalServerErrorException(`Flight module is not configured in database&&&module&&&${errorMessage}`);
        }
        const mystiflyConfig = await this.getMystiflyCredential();
        const sessionToken = await this.startSession();

        const requestBody = 
            `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mys="Mystifly.OnePoint" xmlns:mys1="http://schemas.datacontract.org/2004/07/Mystifly.OnePoint"><soapenv:Header/>
            <soapenv:Body>
               <mys:AirRevalidate>
                     <mys:rq>
                      <mys1:FareSourceCode>${route_code}</mys1:FareSourceCode>
                      <mys1:SessionId>${sessionToken}</mys1:SessionId>
                      <mys1:Target>${mystiflyConfig.target}</mys1:Target>
                  </mys:rq>
              </mys:AirRevalidate>
            </soapenv:Body>
            </soapenv:Envelope>`;
        let airRevalidateResult =await Axios({
            method: 'POST',
            url: mystiflyConfig.url,
            data: requestBody,
            headers: {
                'content-type':'text/xml',
                'Accept-Encoding':'gzip',
                'soapaction':"Mystifly.OnePoint/OnePoint/AirRevalidate",
                'charset':'UTF-8',
                'cache-control':'no-cache'
            }
        })
        
        airRevalidateResult = await xml2js.parseStringPromise(airRevalidateResult.data,{
            normalizeTags :true,
            ignoreAttrs:true
        });

        if(airRevalidateResult['s:envelope']['s:body'][0].airrevalidateresponse[0].airrevalidateresult[0]['a:success'][0]=="true"){

            let bookingDate         = moment(new Date()).format("YYYY-MM-DD");
            let flightRoutes        = airRevalidateResult['s:envelope']['s:body'][0].airrevalidateresponse[0].airrevalidateresult[0]['a:priceditineraries'][0]['a:priceditinerary'];
            let stop:Stop;
            let stops:Stop[]=[];
            let routes:Route[]=[];
            let route:Route;
            let routeType:RouteType;
            let flightSegments=[];
            const currencyDetails =await Generic.getAmountTocurrency(this.headers.currency);
            const markUpDetails   = await PriceMarkup.getMarkup(module.id,user.roleId);
            for(let i=0; i < flightRoutes.length; i++){
                route=new Route;
                stops=[];
                flightSegments = flightRoutes[i]['a:origindestinationoptions'][0]['a:origindestinationoption'][0]['a:flightsegments'][0]['a:flightsegment'];
                flightSegments.forEach(flightSegment => {
                    stop=new Stop();
                    stop.departure_code        = flightSegment['a:departureairportlocationcode'][0];
                    stop.departure_date        = moment(flightSegment['a:departuredatetime'][0]).format("DD/MM/YYYY")
                    stop.departure_time        = moment(flightSegment['a:departuredatetime'][0]).format("hh:mm A")
                    stop.departure_date_time   = flightSegment['a:departuredatetime'][0];
                    stop.arrival_code          = flightSegment['a:arrivalairportlocationcode'][0];
                    stop.arrival_date          = moment(flightSegment['a:arrivaldatetime'][0]).format("DD/MM/YYYY")
                    stop.arrival_time          = moment(flightSegment['a:arrivaldatetime'][0]).format("hh:mm A")
                    stop.arrival_date_time     = flightSegment['a:arrivaldatetime'][0];
                    stop.eticket               = flightSegment['a:eticket'][0]=='true'?true:false;
                    stop.flight_number         = flightSegment['a:flightnumber'][0];
                    stop.duration              = flightSegment['a:journeyduration'][0];
                    stop.airline               = flightSegment['a:marketingairlinecode'][0];
                    stop.remaining_seat        = parseInt(flightSegment['a:seatsremaining'][0]['a:number'][0]);
                    stop.below_minimum_seat    = flightSegment['a:seatsremaining'][0]['a:belowminimum'][0]=='true'?true:false;
                    stop.is_layover            = false;
                    if(stops.length>0){

                        stop.is_layover             =  true;
                        let layOverduration         =  DateTime.convertSecondsToHourMinutesSeconds( moment(stop.departure_date_time).diff(stops[stops.length-1].arrival_date_time,'seconds'));
                        stop.layover_duration       =  `${layOverduration.hours} h ${layOverduration.minutes} m`
                        stop.layover_airport_name   =  flightSegment['a:departureairportlocationcode'][0];
                    }
                    stops.push(stop)
                });
                routeType= new RouteType();
                routeType.type          = 'outbound';
                routeType.stops         = stops;
                route.routes[0]         = routeType;
                route.route_code        = flightRoutes[i]['a:airitinerarypricinginfo'][0]['a:faresourcecode'][0];
                route.net_rate          = Generic.convertAmountTocurrency(flightRoutes[i]['a:airitinerarypricinginfo'][0]['a:itintotalfare'][0]['a:totalfare'][0]['a:amount'][0],currencyDetails.liveRate);
                route.selling_price     = PriceMarkup.applyMarkup(route.net_rate,markUpDetails)
                let instalmentDetails   = Instalment.weeklyInstalment(route.net_rate,moment(stops[0].departure_date,'DD/MM/YYYY').format("YYYY-MM-DD"),bookingDate,0);
                if(instalmentDetails.instalment_available){
                    route.start_price   = instalmentDetails.instalment_date[0].instalment_amount;
                }
                else{
                    route.start_price   = '0';
                }
                route.stop_count        = stops.length-1;
                //route.departure_code    = source_location;
                //route.arrival_code      = destination_location;
                route.departure_date    = stops[0].departure_date;
                route.departure_time    = stops[0].departure_time;
                route.arrival_date      = stops[stops.length-1].arrival_date;
                route.arrival_time      = stops[stops.length-1].arrival_time;
                let totalDuration       = DateTime.convertSecondsToHourMinutesSeconds(moment( stops[stops.length-1].arrival_date_time).diff(stops[0].departure_date_time,'seconds'));
                 
                route.total_duration    = `${totalDuration.hours} h ${totalDuration.minutes} m`;
                route.airline           = stops[0].airline;
                route.is_refundable     = flightRoutes[i]['a:airitinerarypricinginfo'][0]['a:isrefundable'][0]=='Yes'?true:false;
                routes.push(route);
            }
            return routes;
        }
        else{
            throw new NotFoundException(`Flight is not available now`);
        }

    }

    async bookFlight(bookFlightDto,traveles){

        const { route_code } = bookFlightDto;
        const mystiflyConfig = await this.getMystiflyCredential();
        const sessionToken = await this.startSession();

        let requestBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mys="Mystifly.OnePoint" xmlns:mys1="http://schemas.datacontract.org/2004/07/Mystifly.OnePoint" xmlns:mys2="Mystifly.OnePoint.OnePointEntities">`;
            requestBody += `<soapenv:Header/>`
            requestBody += `<soapenv:Body>`
            requestBody += `<mys:BookFlight>`
            requestBody += `<mys:rq>`
            requestBody += `<mys1:FareSourceCode>${route_code}</mys1:FareSourceCode>`
            requestBody += `<mys1:SessionId>${sessionToken}</mys1:SessionId>`
            requestBody += `<mys1:Target>${mystiflyConfig.target}</mys1:Target>`
            requestBody += `<mys1:TravelerInfo>`
            requestBody += `<mys1:AirTravelers>`
            requestBody += `<mys1:AirTraveler>`
            requestBody += `<mys1:DateOfBirth>1989-04-01T00:00:00</mys1:DateOfBirth>`
            requestBody += `<mys1:Gender>M</mys1:Gender>`
            requestBody += `<mys1:PassengerName>`
            requestBody += `<mys1:PassengerFirstName>Paul</mys1:PassengerFirstName>`
            requestBody += `<mys1:PassengerLastName>Rodger</mys1:PassengerLastName>`
            requestBody += `<mys1:PassengerTitle>MR</mys1:PassengerTitle>`
            requestBody += `</mys1:PassengerName>`
            requestBody += `<mys1:PassengerType>ADT</mys1:PassengerType>`
            requestBody += `<mys1:Passport>`
            requestBody += `<mys1:Country>UK</mys1:Country>`
            requestBody += `<mys1:ExpiryDate>2022-06-04T00:00:00</mys1:ExpiryDate>`
            requestBody += `<mys1:PassportNumber>PA3456789</mys1:PassportNumber>`
            requestBody += `</mys1:Passport>`
            requestBody += `</mys1:AirTraveler>`
            requestBody += `<mys1:AirTraveler>`
            requestBody += `<mys1:DateOfBirth>2010-04-01T00:00:00</mys1:DateOfBirth>`
            requestBody += `<mys1:Gender>F</mys1:Gender>`
            requestBody += `<mys1:PassengerName>`
            requestBody += `<mys1:PassengerFirstName>Saddy</mys1:PassengerFirstName>`
            requestBody += `<mys1:PassengerLastName>Rodger</mys1:PassengerLastName>`
            requestBody += `<mys1:PassengerTitle>MISS</mys1:PassengerTitle>`
            requestBody += `</mys1:PassengerName>`
            requestBody += `<mys1:PassengerType>CHD</mys1:PassengerType>`
            requestBody += `<mys1:Passport>`
            requestBody += `<mys1:Country>UK</mys1:Country>`
            requestBody += `<mys1:ExpiryDate>2022-06-04T00:00:00</mys1:ExpiryDate>`
            requestBody += `<mys1:PassportNumber>CHD456789</mys1:PassportNumber>`
            requestBody += `</mys1:Passport>`
            requestBody += `</mys1:AirTraveler>`
            requestBody += `<mys1:AirTraveler>`
            requestBody += `<mys1:DateOfBirth>2015-11-01T00:00:00</mys1:DateOfBirth>`
            requestBody += `<mys1:Gender>M</mys1:Gender>`
            requestBody += `<mys1:PassengerName>`
            requestBody += `<mys1:PassengerFirstName>Peter</mys1:PassengerFirstName>`
            requestBody += `<mys1:PassengerLastName>Kin</mys1:PassengerLastName>`
            requestBody += `<mys1:PassengerTitle>INF</mys1:PassengerTitle>`
            requestBody += `</mys1:PassengerName>`
            requestBody += `<mys1:PassengerType>INF</mys1:PassengerType>`
            requestBody += `<mys1:Passport>`
            requestBody += `<mys1:Country>UK</mys1:Country>`
            requestBody += `<mys1:ExpiryDate>2022-06-04T00:00:00</mys1:ExpiryDate>`
            requestBody += `<mys1:PassportNumber>INF456789</mys1:PassportNumber>`
            requestBody += `</mys1:Passport>`
            requestBody += `</mys1:AirTraveler>`
            requestBody += `</mys1:AirTravelers>`
            requestBody += `<mys1:AreaCode>141</mys1:AreaCode>`
            requestBody += `<mys1:CountryCode>44</mys1:CountryCode>`
            requestBody += `<mys1:Email>peter@gmail.com</mys1:Email>`
            requestBody += `<mys1:PhoneNumber>5467890</mys1:PhoneNumber>`
            requestBody += `<mys1:PostCode>G1 1QN</mys1:PostCode>`
            requestBody += `</mys1:TravelerInfo>`
            requestBody += `</mys:rq>`
            requestBody += `</mys:BookFlight>`
            requestBody += `</soapenv:Body>`
            requestBody += `</soapenv:Envelope>`

        let airRevalidateResult =await Axios({
            method: 'POST',
            url: mystiflyConfig.url,
            data: requestBody,
            headers: {
                'content-type':'text/xml',
                'Accept-Encoding':'gzip',
                'soapaction':"Mystifly.OnePoint/OnePoint/AirRevalidate",
                'charset':'UTF-8',
                'cache-control':'no-cache'
            }
        })
        
        airRevalidateResult = await xml2js.parseStringPromise(airRevalidateResult.data,{
            normalizeTags :true,
            ignoreAttrs:true
        });
    }

    getFlightClass(className){

        const flightClass={
            'Economy':'Y',
            'Business':'C',
            'First':'F'
        }
        return flightClass[className];
    }
} 