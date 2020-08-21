import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Strategy } from './strategy/strategy';
import { OneWaySearchFlightDto } from './dto/oneway-flight.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AirportRepository } from './airport.repository';
import { getManager, getConnection } from 'typeorm';
import { RouteIdsDto } from './dto/routeids.dto';
import { RoundtripSearchFlightDto } from './dto/roundtrip-flight.dto';
import { Mystifly } from './strategy/mystifly';
import { Currency } from 'src/entity/currency.entity';
import { Language } from 'src/entity/language.entity';
import { BookFlightDto } from './dto/book-flight.dto';
import { User } from 'src/entity/user.entity';
import * as moment from 'moment';
import { PaymentType } from 'src/enum/payment-type.enum';

@Injectable()
export class FlightService {

    constructor(

        @InjectRepository(AirportRepository)
        private airportRepository:AirportRepository
    ){}
    
    async searchAirport(name:String){

        try{
            let result = await this.airportRepository.find({
                where : `("code" ILIKE '%${name}%' or "name" ILIKE '%${name}%' or "city" ILIKE '%${name}%' or "country" ILIKE '%${name}%') and status=true and is_deleted=false`
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

    async searchOneWayFlight(searchFlightDto:OneWaySearchFlightDto,headers,user){

        await this.validateHeaders(headers);
        const mystifly = new Strategy(new Mystifly(headers));
        const result = new Promise((resolve) => resolve(mystifly.oneWaySearch(searchFlightDto,user)));
        return result;
    }

    async baggageDetails(routeIdDto:RouteIdsDto){    
        const mystifly = new Strategy(new Mystifly({}));
        const result = new Promise((resolve) => resolve(mystifly.baggageDetails(routeIdDto)));
        return result;
    }

     
    async cancellationPolicy(routeIdsDto:RouteIdsDto){
    
    }

     async searchRoundTripFlight(searchFlightDto:RoundtripSearchFlightDto){
        //const local = new Strategy(new Static(this.flightRepository));
        const mystifly = new Strategy(new Mystifly({}));
        const result = new Promise((resolve) => resolve(mystifly.roundTripSearch(searchFlightDto)));
        return result;
     }

     async airRevalidate(routeIdDto,headers){
        await this.validateHeaders(headers);
        const mystifly = new Strategy(new Mystifly(headers));
        const result = new Promise((resolve) => resolve(mystifly.airRevalidate(routeIdDto)));
        return result;
     }

     async bookFlight(bookFlightDto:BookFlightDto,headers){
        await this.validateHeaders(headers);

        let { 
            travelers, payment_type, 
            adult_count, child_count,infant_count } = bookFlightDto;
        let travelersDetails = await this.getTravelersInfo(travelers);
        
        if(adult_count!=travelersDetails.adults.length)
            throw new BadRequestException(`Adults count is not match with search request!`)

        if(child_count!=travelersDetails.children.length)
            throw new BadRequestException(`Children count is not match with search request`)
        
        if(infant_count!=travelersDetails.infants.length)
            throw new BadRequestException(`Infants count is not match with search request`)
        
        /* if(payment_type==PaymentType.INSTALMENT){

        } */
        /* const mystifly = new Strategy(new Mystifly(headers));
        const result = new Promise((resolve) => resolve(mystifly.bookFlight(bookFlightDto,travelersDetails)));
        return result; */
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

     async getTravelersInfo(travelers){

        let travelerIds = travelers.map(traveler=>{
            return traveler.traveler_id;
        })

        let travelersResult = await getManager()
        .createQueryBuilder(User,"user")
        .leftJoinAndSelect("user.country","countries")
            .select([
                "user.userId","user.title",
                "user.firstName","user.lastName","user.email",
                "user.countryCode","user.phoneNo","user.zipCode",
                "user.gender","user.dob","user.passportNumber",
                "user.passportExpiry",
                "countries.name","countries.iso2","countries.iso3","countries.id",
            ])
            .where('"user"."user_id" IN (:...travelerIds)',{ travelerIds})
            .getMany();
        
        let traveleDetails ={
            adults:[],
            children:[],
            infants:[]
        };

        if(travelersResult.length>0){

            for(let traveler of travelersResult){

                let ageDiff = moment(new Date()).diff(moment(traveler.dob),'years');

                if(traveler.title==null || traveler.title=='')
                    throw new BadRequestException(`Title is missing for traveler ${traveler.firstName}`)
                if(traveler.email==null || traveler.email=='')
                    throw new BadRequestException(`Email is missing for traveler ${traveler.firstName}`)
                if(traveler.countryCode==null || traveler.countryCode=='')
                    throw new BadRequestException(`Country code is missing for traveler ${traveler.firstName}`)
                if(traveler.phoneNo==null || traveler.phoneNo=='')
                    throw new BadRequestException(`Phone number is missing for traveler ${traveler.firstName}`)
                if(traveler.gender==null || traveler.gender=='')
                    throw new BadRequestException(`Gender is missing for traveler ${traveler.firstName}`)
                if(traveler.dob==null || traveler.dob=='')
                    throw new BadRequestException(`Dob is missing for traveler ${traveler.firstName}`)
                if(ageDiff>2 && (traveler.passportNumber==null || traveler.passportNumber==''))
                    throw new BadRequestException(`Passport Number is missing for traveler ${traveler.firstName}`)
                if(ageDiff>2 &&  (traveler.passportExpiry==null || traveler.passportExpiry==''))
                    throw new BadRequestException(`Passport Expiry is missing for traveler ${traveler.firstName}`)
                if(traveler.country==null || (typeof traveler.country.iso2!=='undefined' && traveler.country.iso2==''))
                    throw new BadRequestException(`Country code is missing for traveler ${traveler.firstName}`)
                
                if(ageDiff < 2){
                    traveleDetails.infants.push(traveler)
                }
                else if(ageDiff>2 && ageDiff<10){
                    traveleDetails.children.push(traveler)
                }
                else if(ageDiff>10){
                    traveleDetails.adults.push(traveler)
                }
            }
            return traveleDetails;
        }
        else{
            throw new BadRequestException(`Please enter valid traveler(s) id`)
        }

     }
}
