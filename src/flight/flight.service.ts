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
import { Instalment } from 'src/utility/instalment.utility';
import { InstalmentType } from 'src/enum/instalment-type.enum';
import { Booking } from 'src/entity/booking.entity';
import { v4 as uuidv4 } from "uuid";
import { BookingStatus } from 'src/enum/booking-status.enum';
import { BookingType } from 'src/enum/booking-type.enum';
import { PaymentStatus } from 'src/enum/payment-status.enum';
import { Module } from 'src/entity/module.entity';
import { errorMessage } from 'src/config/common.config';
import { BookingInstalments } from 'src/entity/booking-instalments.entity';
import { InstalmentStatus } from 'src/enum/instalment-status.enum';

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
        
        const mystifly = new Strategy(new Mystifly({}));
        const result = new Promise((resolve) => resolve(mystifly.cancellationPolicy(routeIdsDto)));
        return result;
    }

     async searchRoundTripFlight(searchFlightDto:RoundtripSearchFlightDto,headers,user){
        
        await this.validateHeaders(headers);
        const mystifly = new Strategy(new Mystifly(headers));
        const result = new Promise((resolve) => resolve(mystifly.roundTripSearch(searchFlightDto,user)));
        return result;
     }

     async airRevalidate(routeIdDto,headers,user){
        await this.validateHeaders(headers);
        const mystifly = new Strategy(new Mystifly(headers));
        const result = new Promise((resolve) => resolve(mystifly.airRevalidate(routeIdDto,user)));
        return result;
     }

     async bookFlight(bookFlightDto:BookFlightDto,headers,user){
        let headerDetails = await this.validateHeaders(headers);

        let { 
            travelers, payment_type, instalment_type,
            adult_count, child_count,infant_count, 
            selling_price, additional_amount,
            departure_date, route_code
        } = bookFlightDto;

        let bookingDate = moment(new Date()).format("YYYY-MM-DD");
        let travelersDetails = await this.getTravelersInfo(travelers);
        let currencyId = headerDetails.currency.id;
        const userId = user.user_id;
        if(adult_count!=travelersDetails.adults.length)
            throw new BadRequestException(`Adults count is not match with search request!`)

        if(child_count!=travelersDetails.children.length)
            throw new BadRequestException(`Children count is not match with search request`)
        
        if(infant_count!=travelersDetails.infants.length)
            throw new BadRequestException(`Infants count is not match with search request`)
        
        const mystifly = new Strategy(new Mystifly(headers));
        const airRevalidateResult =await mystifly.airRevalidate({route_code},user);
        console.log(airRevalidateResult);

        if(payment_type==PaymentType.INSTALMENT){
            let instalmentDetails;
            if(!additional_amount){

                //let layCreditAmount =  
                //save entry for future booking
                if(instalment_type==InstalmentType.WEEKLY){
                    instalmentDetails=Instalment.weeklyInstalment(selling_price,departure_date,bookingDate,additional_amount);
                }
                if(instalment_type==InstalmentType.BIWEEKLY){
                    instalmentDetails=Instalment.biWeeklyInstalment(selling_price,departure_date,bookingDate);
                }
                if(instalment_type==InstalmentType.MONTHLY){
                    instalmentDetails=Instalment.monthlyInstalment(selling_price,departure_date,bookingDate);
                }

                this.saveBooking(bookFlightDto,currencyId,bookingDate,BookingType.INSTALMENT,userId,instalmentDetails);

            }
        }
        /* const mystifly = new Strategy(new Mystifly(headers));
        const result = new Promise((resolve) => resolve(mystifly.bookFlight(bookFlightDto,travelersDetails)));
        return result; */
     }

    async saveBooking(
        bookFlightDto:BookFlightDto,currencyId,bookingDate,
        bookingType,userId,instalmentDetails=null
    ){
        const {
            selling_price, net_rate, journey_type,
            departure_date, source_location, destination_location,
            adult_count, child_count, infant_count,flight_class,
            instalment_type
        } = bookFlightDto;

        let moduleDetails = await getManager().createQueryBuilder(Module,"module").where(`"module"."name"=:name`,{name:'flight'}).getOne();
        if(!moduleDetails){
            throw new BadRequestException(`Please configure flight module in database&&&module_id&&&${errorMessage}`)
        }

        let booking= new Booking();
        booking.id =uuidv4();
        booking.moduleId=moduleDetails.id;
        booking.isPredictive=true;
        booking.bookingType=bookingType;
        booking.bookingStatus=BookingStatus.PENDING;
        booking.currency=currencyId;
        booking.totalAmount=selling_price.toString();
        booking.netRate=net_rate.toString();
        booking.markupAmount = (selling_price-net_rate).toString();
        booking.bookingDate=bookingDate;
        booking.locationInfo={
            journey_type,
            source_location,
            destination_location
        }
        
        booking.userId=userId;

        if(instalmentDetails){
            booking.totalInstallments= instalmentDetails.instalment_date.length;
            if(instalmentDetails.instalment_date.length>1){
                booking.nextInstalmentDate=instalmentDetails.instalment_date[1].instalment_date;
            }

            booking.paymentStatus = PaymentStatus.PENDING;
            booking.supplierBookingId="";
        }
        else{
            //pass here mystifly booking id
            booking.supplierBookingId="";
        }
        let moduleInfo={
            journey_type,
            departure_date,
            source_location,
            destination_location,
            adult_count,
            child_count,
            infant_count,
            flight_class
        }
        booking.moduleInfo=moduleInfo;
        try{

            let bookingDetails =  await booking.save();
            if(instalmentDetails){
                let bookingInstalments:BookingInstalments[] = [];
                let bookingInstalment = new BookingInstalments();
                let i=0;
                for(let instalment of instalmentDetails.instalment_date){
                    bookingInstalment.bookingId=bookingDetails.id;
                    bookingInstalment.userId=userId;
                    bookingInstalment.moduleId=moduleDetails.id;
                    bookingInstalment.instalmentType=instalment_type;
                    bookingInstalment.instalmentDate= instalment.instalment_date;
                    bookingInstalment.currencyId=currencyId;
                    bookingInstalment.amount = instalment.instalment_amount;
                    bookingInstalment.instalmentStatus = (i==0)?InstalmentStatus.PAID:InstalmentStatus.PENDING;
                    bookingInstalment.paymentStatus = (i==0)?PaymentStatus.CONFIRM : PaymentStatus.PENDING;
                    bookingInstalment.supplierId=1;
                    bookingInstalment.isPaymentProcessedToSupplier=0;
                    bookingInstalment.isInvoiceGenerated=0;
                    i++;
                    bookingInstalments.push(bookingInstalment)
                }
    
                console.log(bookingInstalments)
                await getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(BookingInstalments)
                    .values(bookingInstalments)
                    .execute();
            }
        }
        catch(error){

            console.log(error)
        }
        

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
        return {
            currency:currencyDetails,
            language:languageDetails
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
