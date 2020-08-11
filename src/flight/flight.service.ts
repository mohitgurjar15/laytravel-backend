import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Strategy } from './strategy/strategy';
import { Static } from './strategy/static';
import { OneWaySearchFlightDto } from './dto/oneway-flight.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FlightRepository } from './flight.repository';
import { AirportRepository } from './airport.repository';
import { SeatAllocationRepository } from './seat-allocation.repository';
import { getManager } from 'typeorm';
import { RouteIdsDto } from './dto/routeids.dto';
import { RoundtripSearchFlightDto } from './dto/roundtrip-flight.dto';
import { Mystifly } from './strategy/mystifly';
import { Currency } from 'src/entity/currency.entity';
import { Language } from 'src/entity/language.entity';

@Injectable()
export class FlightService {

    constructor(
        @InjectRepository(FlightRepository)
        private flightRepository:FlightRepository,

        @InjectRepository(AirportRepository)
        private airportRepository:AirportRepository,

        @InjectRepository(SeatAllocationRepository)
        private seatAllocationRepository:SeatAllocationRepository
    ){}
    
    async searchAirport(name:String){

        try{
            let result = await this.airportRepository.find({
                where : `("code" ILIKE '%${name}%' or "name" ILIKE '%${name}%' or "city" ILIKE '%${name}%' or "country" ILIKE '%${name}%') and status=true and is_deleted=false`,
                cache : {
                    id:'flight_search',
                    milliseconds:15000
                }
            })

            if(!result.length)
                throw new NotFoundException(`No Airport Found.&&&name`)
            return result;
        }
        catch(error){

            if (typeof error.response!=='undefined' && error.response.statusCode == 404) {
                throw new NotFoundException(`No Airport Found.`)
            }
            throw new InternalServerErrorException(error.message)
        }
    }

    async searchOneWayFlight(searchFlightDto:OneWaySearchFlightDto,headers){

        this.validateHeaders(headers);
        const mystifly = new Strategy(new Mystifly(headers));
        const result = new Promise((resolve) => resolve(mystifly.oneWaySearch(searchFlightDto)));
        return result;
    }

    async baggageDetails(routeIdDto:RouteIdsDto){    
        const mystifly = new Strategy(new Mystifly(this.flightRepository));
        const result = new Promise((resolve) => resolve(mystifly.baggageDetails(routeIdDto)));
        return result;
     }

     
     async cancellationPolicy(routeIdsDto:RouteIdsDto){

        
        
     }

     async searchRoundTripFlight(searchFlightDto:RoundtripSearchFlightDto){
        //const local = new Strategy(new Static(this.flightRepository));
        const mystifly = new Strategy(new Mystifly(this.flightRepository));
        const result = new Promise((resolve) => resolve(mystifly.roundTripSearch(searchFlightDto)));
        return result;
     }

     async airRevalidate(routeIdDto,headers){
        this.validateHeaders(headers);
        const mystifly = new Strategy(new Mystifly(headers));
        const result = new Promise((resolve) => resolve(mystifly.airRevalidate(routeIdDto)));
        return result;
     }

     async validateHeaders(headers){

        let currency = headers.currency;
        let language=headers.language;
        if(typeof currency=='undefined' || currency==''){
            throw new BadRequestException(`Please enter currency code&&&currency`)
        }
        else if(typeof language=='undefined' || language==''){
            throw new BadRequestException(`Please enter language code&&&language`)
        }

        let currencyDetails = await getManager().createQueryBuilder(Currency,"currency").where(`"currency"."code"=:currency and "currency"."status"=true`,{currency}).getOne();
        if(!currencyDetails){
            throw new BadRequestException(`Invalid currency code sent!`)
        }

        let languageDetails = await getManager().createQueryBuilder(Language,"language").where(`"language"."iso_1_code"=:language and "language"."active"=true`,{language}).getOne();
        if(!languageDetails){
            throw new BadRequestException(`Invalid language code sent!`)
        }
     }
}
