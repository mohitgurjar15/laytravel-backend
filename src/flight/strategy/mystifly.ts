import { StrategyAirline } from "./strategy.interface";
import { OneWaySearchFlightDto } from "../dto/oneway-flight.dto";
import { NotFoundException } from "@nestjs/common";
import { RoundtripSearchFlightDto } from "../dto/roundtrip-flight.dto";
import Axios from 'axios';
import *as config from 'config';
import * as xml2js from 'xml2js';
import * as moment from 'moment';
import { DateTime } from "src/utility/datetime.utility";
import { Stop } from "../model/stop.model";
import { Route, RouteType } from "../model/route.model";
import { Generic } from "src/utility/generic.utility";
const fs = require('fs').promises;

export class Mystifly implements StrategyAirline{

    private headers;
    constructor(
        headers
    ){
        this.headers = headers;
    }

    async createSession(){

        const config = await Generic.getCredential('flight');
        let mystiflyConfig= JSON.parse(config.testCredential)
        if(config.mode){
            mystiflyConfig = JSON.parse(config.liveCredential);
        }
        console.log(mystiflyConfig)
        
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
        console.log("createSession")
        return sessionToken;
    }
    async startSession(){
        try{
            let sessionDetails = await fs.readFile("src/flight/mystifly-session.json","binary");
            sessionDetails = JSON.parse(sessionDetails);
            let currentTime = new Date();
            let diff = moment(currentTime).diff(sessionDetails.created_time,'seconds')
            console.log(sessionDetails.created_time,currentTime,diff);
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

        //console.log(sessionDetails);
        
    }

    async oneWaySearch(searchFlightDto:OneWaySearchFlightDto)/* :Promise<Route[]> */{

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
        //console.log(searchResult.data)
        searchResult = await xml2js.parseStringPromise(searchResult.data,{
            normalizeTags :true,
            ignoreAttrs:true
        });
        //console.log(JSON.stringify(searchResult));
        
        if(searchResult['s:envelope']['s:body'][0].airlowfaresearchresponse[0].airlowfaresearchresult[0]['a:success'][0]=="true") {
            
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
                    if(stops.length>0){

                        stop.is_layover             =  true;
                        let layOverduration         =  DateTime.convertSecondsToHourMinutesSeconds( moment(stop.departure_date_time).diff(stops[stops.length-1].arrival_date_time,'seconds'));
                        stop.layover_duration       =  `${layOverduration.hours} h ${layOverduration.minutes} m`
                        stop.layover_airport_name   =  flightSegment['a:departureairportlocationcode'][0];
                    }
                    stops.push(stop)
                });
                //console.log(routes)
                routeType= new RouteType();
                routeType.type          = 'outbound';
                routeType.stops         = stops;
                console.log(routeType)
                route.routes[0]         = routeType;
                route.route_code        = flightRoutes[i]['a:airitinerarypricinginfo'][0]['a:faresourcecode'][0];
                route.net_rate          = flightRoutes[i]['a:airitinerarypricinginfo'][0]['a:itintotalfare'][0]['a:totalfare'][0]['a:amount'][0];
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
            //console.log(JSON.stringify(routes))
        }
        else{

            throw new NotFoundException(`No flight founds`)
        }
       
    }

    async roundTripSearch(searchFlightDto:RoundtripSearchFlightDto){
        
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
        requestBody += `<mys1:SessionId>bccbcbae-ab4a-4fe9-9d73-728643bf1cc2</mys1:SessionId>`
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
        //console.log(searchResult.data)
        searchResult = await xml2js.parseStringPromise(searchResult.data,{
            normalizeTags :true,
            ignoreAttrs:true
        });
        //console.log(requestBody);
        console.log(JSON.stringify(searchResult));
        
        if(searchResult['s:envelope']['s:body'][0].airlowfaresearchresponse[0].airlowfaresearchresult[0]['a:success'][0]=="true") {
            
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
            //console.log(JSON.stringify(routes))
        }
        else{

            throw new NotFoundException(`No flight founds`)
        }
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