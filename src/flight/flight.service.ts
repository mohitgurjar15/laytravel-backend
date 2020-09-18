import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException, HttpException } from '@nestjs/common';
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
import { PaymentService } from 'src/payment/payment.service';
import { GenderTilte } from 'src/enum/gender-title.enum';
import { FlightJourney } from 'src/enum/flight-journey.enum';
import { DateTime } from 'src/utility/datetime.utility';
import { BookingRepository } from 'src/booking/booking.repository';
import { FlightBookingEmailParameterModel } from 'src/config/email_template/model/flight-booking-email-parameter.model';
import { FlightBookingConfirmtionMail } from 'src/config/email_template/flight-booking-confirmation-mail.html';
import { MailerService } from '@nestjs-modules/mailer';
//import { Airport } from 'src/entity/airport.entity';
//import { allAirpots } from './all-airports';

@Injectable()
export class FlightService {

    constructor(

        @InjectRepository(AirportRepository)
        private airportRepository:AirportRepository,

        @InjectRepository(BookingRepository)
        private bookingRepository:BookingRepository,

        private paymentService:PaymentService,
        private readonly mailerService: MailerService
    ){}
    
    async searchAirport(name:String){

        try{
            let result = await this.airportRepository.find({
                where : `("code" ILIKE '%${name}%' or "name" ILIKE '%${name}%' or "city" ILIKE '%${name}%' or "country" ILIKE '%${name}%') and status=true and is_deleted=false`
            })
            //result = this.getNestedChildren(result,0)
            if(!result.length)
                throw new NotFoundException(`No Airport Found.&&&name`)
            return result;
        }
        catch(error){

            if (typeof error.response!=='undefined' && error.response.statusCode == 404) {
                throw new NotFoundException(`No Airport Found.&&&name`)
            }
            throw new InternalServerErrorException(error.message)
        }
    }

    getNestedChildren(arr, parent) {

        let out = []
        for(let i in arr) {
            arr[i].display_name=  `${arr[i].city},${arr[i].country},(${arr[i].code}),${arr[i].name}`
            if(arr[i].parentId == parent) {
                let children = this.getNestedChildren(arr, arr[i].id)
    
                if(children.length) {
                    arr[i].sub_airport = children
                }
                else{
                    arr[i].sub_airport = []
                }
                arr[i].display_name=  `${arr[i].city},${arr[i].country},(${arr[i].code}),${arr[i].name}`
                out.push(arr[i])
            }
        }
        return out
    }

    /* async mapChildParentAirport(name:String){

        for(let airport of allAirpots){

            await getConnection()
            .createQueryBuilder()
                .update(Airport)
                .set({ 
                    parentId : airport.id
                })
                .where(`(country=:country and city=:city and  name!=:name)`, { country:airport.country, city:airport.city, name:airport.name })
                .execute();
        }
        return true;
    } */
            

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
            route_code, additional_amount, custom_instalment_amount, custom_instalment_no
        } = bookFlightDto;

        const mystifly = new Strategy(new Mystifly(headers));
        const airRevalidateResult =await mystifly.airRevalidate({route_code},user);
        let isPassportRequired=false;
        let bookingRequestInfo:any={};
        if(airRevalidateResult){
            bookingRequestInfo.adult_count = airRevalidateResult[0].adult_count;
            bookingRequestInfo.child_count = typeof airRevalidateResult[0].child_count!='undefined'?airRevalidateResult[0].child_count:0;
            bookingRequestInfo.infant_count = typeof airRevalidateResult[0].infant_count!='undefined'?airRevalidateResult[0].infant_count:0;
            bookingRequestInfo.net_rate   = airRevalidateResult[0].net_rate;
            bookingRequestInfo.selling_price   = airRevalidateResult[0].selling_price;
            bookingRequestInfo.departure_date = DateTime.convertDateFormat(airRevalidateResult[0].departure_date,'DD/MM/YYYY','YYYY-MM-DD');
            bookingRequestInfo.arrival_date = DateTime.convertDateFormat(airRevalidateResult[0].arrival_date,'DD/MM/YYYY','YYYY-MM-DD');
            bookingRequestInfo.source_location = airRevalidateResult[0].departure_code;
            bookingRequestInfo.destination_location  = airRevalidateResult[0].arrival_code;
            bookingRequestInfo.flight_class = 'Economy';
            bookingRequestInfo.instalment_type = instalment_type;
            bookingRequestInfo.additional_amount =additional_amount;
            isPassportRequired=airRevalidateResult[0].is_passport_required;
            if(airRevalidateResult[0].routes.length==1){

                bookingRequestInfo.journey_type = FlightJourney.ONEWAY;
            }
            else{
                bookingRequestInfo.journey_type = FlightJourney.ROUNDTRIP;
            }
        }
        let {   
            selling_price, departure_date , adult_count,
            child_count, infant_count
        }=bookingRequestInfo;

        let bookingDate = moment(new Date()).format("YYYY-MM-DD");
        let travelersDetails = await this.getTravelersInfo(travelers,isPassportRequired);


        let currencyId = headerDetails.currency.id;
        const userId = user.user_id;
        if(adult_count!=travelersDetails.adults.length)
            throw new BadRequestException(`Adults count is not match with search request!`)

        if(child_count!=travelersDetails.children.length)
            throw new BadRequestException(`Children count is not match with search request`)
        
        if(infant_count!=travelersDetails.infants.length)
            throw new BadRequestException(`Infants count is not match with search request`)
        
        if(payment_type==PaymentType.INSTALMENT){
            let instalmentDetails;

            let totalAdditionalAmount = additional_amount || 0;

            //let layCreditAmount =  
            //save entry for future booking
            if(instalment_type==InstalmentType.WEEKLY){
                instalmentDetails=Instalment.weeklyInstalment(selling_price,departure_date,bookingDate,totalAdditionalAmount,custom_instalment_amount,custom_instalment_no);
            }
            if(instalment_type==InstalmentType.BIWEEKLY){
                instalmentDetails=Instalment.biWeeklyInstalment(selling_price,departure_date,bookingDate,totalAdditionalAmount,custom_instalment_amount,custom_instalment_no);
            }
            if(instalment_type==InstalmentType.MONTHLY){
                instalmentDetails=Instalment.monthlyInstalment(selling_price,departure_date,bookingDate,totalAdditionalAmount,custom_instalment_amount,custom_instalment_no);
            }

            if(instalmentDetails.instalment_available){

                let firstInstalemntAmount = instalmentDetails.instalment_date[0].instalment_amount;
                let authCardResult=await this.paymentService.authorizeCard('Ci7r1e6ps7tApi7xZgWrN8deTGJ','aNtkbIgloI2ECtICXtK8io6p3zW',Math.ceil(firstInstalemntAmount*100),'USD');
                if(authCardResult.status==true){
                    let authCardToken = authCardResult.token;
                    let captureCardresult =await this.paymentService.captureCard(authCardToken);
                    if(captureCardresult.status==true){
                        let laytripBookingResult = await this.saveBooking(bookingRequestInfo,currencyId,bookingDate,BookingType.INSTALMENT,userId,airRevalidateResult,instalmentDetails,captureCardresult,null);
                        this.sendBookingEmail(laytripBookingResult.id);
                        return {
                            laytrip_booking_id  : laytripBookingResult.id,
                            booking_status      : 'pending',
                            supplier_booking_id : '',
                            success_message     : `Booking is in pending state!`,
                            error_message       : '',
                            booking_details     : await this.bookingRepository.getBookingDetails(laytripBookingResult.id)
                        }
                    }
                    else{
                        throw new BadRequestException(`Card capture is failed&&&card_token&&&${errorMessage}`)
                    }
                }
                else{
                    throw new BadRequestException(`Card authorization is failed&&&card_token&&&${errorMessage}`)
                }
            }
            else{

                throw new BadRequestException(`Instalment option is not available for your search criteria`);
            }
        }
        else if(payment_type==PaymentType.NOINSTALMENT){

            let authCardResult=await this.paymentService.authorizeCard('UHf0cMrLXWjSLxdXqJLmKBoc53F','aNtkbIgloI2ECtICXtK8io6p3zW',Math.ceil(selling_price*100),'USD');
            if(authCardResult.status==true){
                const mystifly = new Strategy(new Mystifly(headers));
                const bookingResult = await mystifly.bookFlight(bookFlightDto,travelersDetails);
                let authCardToken = authCardResult.token;
                if(bookingResult.booking_status == 'success'){
                    let captureCardresult =await this.paymentService.captureCard(authCardToken);
                    let laytripBookingResult = await this.saveBooking(bookingRequestInfo,currencyId,bookingDate,BookingType.NOINSTALMENT,userId,airRevalidateResult,null,captureCardresult,bookingResult);
                    //send email here
                    this.sendBookingEmail(laytripBookingResult.id);
                    bookingResult.laytrip_booking_id = laytripBookingResult.id;
                    bookingResult.booking_details    = await this.bookingRepository.getBookingDetails(laytripBookingResult.id)
                    return bookingResult;
                }
                else{

                    await this.paymentService.voidCard(authCardToken)
                    throw new HttpException({
                        status  : 424,
                        message : bookingResult.error_message,
                        }, 424);
                }
            }
            else{
                throw new BadRequestException(`Card authorization is failed&&&card_token&&&${errorMessage}`)
            }
        }
        
     }

    async saveBooking(
        bookFlightDto,currencyId,bookingDate,
        bookingType,userId,airRevalidateResult,instalmentDetails=null,captureCardresult=null,supplierBookingData
    ){
        const {
            selling_price, net_rate, journey_type,
            departure_date, source_location, destination_location,
            adult_count, child_count, infant_count,flight_class,
            instalment_type, arrival_date
        } = bookFlightDto;

        let moduleDetails = await getManager().createQueryBuilder(Module,"module").where(`"module"."name"=:name`,{name:'flight'}).getOne();
        if(!moduleDetails){
            throw new BadRequestException(`Please configure flight module in database&&&module_id&&&${errorMessage}`)
        }

        let currencyDetails = await getManager().createQueryBuilder(Currency,"currency").where(`"currency"."id"=:currencyId and "currency"."status"=true`,{currencyId}).getOne();
        

        let booking= new Booking();
        booking.id =uuidv4();
        booking.moduleId=moduleDetails.id;
        
        booking.bookingType=bookingType;
        booking.currency=currencyId;
        booking.totalAmount=selling_price.toString();
        booking.netRate=net_rate.toString();
        booking.markupAmount = (selling_price-net_rate).toString();
        booking.bookingDate=bookingDate;
        booking.usdFactor = currencyDetails.liveRate.toString()
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

            booking.bookingStatus=BookingStatus.PENDING;
            booking.paymentStatus = PaymentStatus.PENDING;
            booking.supplierBookingId="";
            booking.isPredictive=true;
        }
        else{
            //pass here mystifly booking id
            //booking.supplierBookingId=supplierBookingData.booking_id;
            booking.supplierBookingId="";
            booking.bookingStatus=BookingStatus.CONFIRM;
            booking.paymentStatus = PaymentStatus.CONFIRM;
            booking.isPredictive=false;
            booking.totalInstallments=0;
        }
        /* let moduleInfo={
            journey_type,
            departure_date,
            arrival_date,
            source_location,
            destination_location,
            adult_count,
            child_count,
            infant_count,
            flight_class
        } */
        booking.moduleInfo=airRevalidateResult;
        try{

            let bookingDetails =  await booking.save();
            if(instalmentDetails){
                let bookingInstalments:BookingInstalments[] = [];
                let bookingInstalment = new BookingInstalments();
                let i=0;
                for(let instalment of instalmentDetails.instalment_date){
                    bookingInstalment=new BookingInstalments();
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
    
                await getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(BookingInstalments)
                    .values(bookingInstalments)
                    .execute();
            }
            return bookingDetails;
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

     async getTravelersInfo(travelers,isPassportRequired=null){

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
                if((traveler.email==null || traveler.email=='') && ageDiff>=12)
                    throw new BadRequestException(`Email is missing for traveler ${traveler.firstName}`)
                if((traveler.countryCode==null || traveler.countryCode=='') && ageDiff>=12)
                    throw new BadRequestException(`Country code is missing for traveler ${traveler.firstName}`)
                if((traveler.phoneNo==null || traveler.phoneNo=='') && ageDiff>=12)
                    throw new BadRequestException(`Phone number is missing for traveler ${traveler.firstName}`)
                if(traveler.gender==null || traveler.gender=='')
                    throw new BadRequestException(`Gender is missing for traveler ${traveler.firstName}`)
                if(traveler.dob==null || traveler.dob=='')
                    throw new BadRequestException(`Dob is missing for traveler ${traveler.firstName}`)
                if(ageDiff>2 && isPassportRequired && (traveler.passportNumber==null || traveler.passportNumber==''))
                    throw new BadRequestException(`Passport Number is missing for traveler ${traveler.firstName}`)
                if(ageDiff>2 && isPassportRequired && (traveler.passportExpiry==null || traveler.passportExpiry==''))
                    throw new BadRequestException(`Passport Expiry is missing for traveler ${traveler.firstName}`)
                if(traveler.country==null || (typeof traveler.country.iso2!=='undefined' && traveler.country.iso2==''))
                    throw new BadRequestException(`Country code is missing for traveler ${traveler.firstName}`)
                
                traveler.title = GenderTilte[traveler.title]
                if(ageDiff < 2){
                    traveleDetails.infants.push(traveler)
                }
                else if(ageDiff>=2 && ageDiff<12){
                    traveleDetails.children.push(traveler)
                }
                else if(ageDiff>=12){
                    traveleDetails.adults.push(traveler)
                }
            }
            return traveleDetails;
        }
        else{
            throw new BadRequestException(`Please enter valid traveler(s) id`)
        }

     }

     async sendBookingEmail(bookingId){
        const Data = await this.bookingRepository.getBookingDetails(bookingId);
        const bookingData = Data[0];
        var param = new FlightBookingEmailParameterModel();
		const user = bookingData.user;
		const moduleInfo = bookingData.moduleInfo;
		const currency = bookingData.currency2;
		const netPrice = bookingData.netRate;
		param.user_name = `${user.firstName}  ${user.firstName}`;
		param.date = moduleInfo.departure_date;
		param.laytrip_points = bookingData.laytrip_points ? 0 : 0;
		param.travelers = [`${user.firstName}  ${user.firstName}`];
		param.airline = moduleInfo.airline ? moduleInfo.airline : "";
		param.pnr_no = moduleInfo.pnr_no ? moduleInfo.pnr_no : "";
		param.ticket_no = bookingData.id;
		param.flight_name = moduleInfo.flight_name ? moduleInfo.flight_name : "";
		param.class = moduleInfo.flight_class ? moduleInfo.flight_class : "";
		param.rout = moduleInfo.flight_rout ? moduleInfo.flight_rout : "";
		param.duration = moduleInfo.duration ? moduleInfo.duration : "";
		param.cardholder_name = bookingData.cardholder_name
			? bookingData.cardholder_name
			: "";
		param.visa_ending_in = user.passportExpiry ? user.passportExpiry : null;
		param.amount = `${currency.symbol} ${bookingData.totalAmount} ${currency.code}`;
		param.base_fare = `${currency.symbol} ${netPrice} ${currency.code}`;
		param.tax = bookingData.tax
			? `${currency.symbol}${bookingData.tax} ${currency.code}`
			: "0";

		var status = "";
		if (bookingData.bookingStatus > 2) {
			bookingData.bookingStatus == 0 ? "Pending" : "Confirm";
		} else {
			bookingData.bookingStatus == 2 ? "Failed" : "Canceled";
		}
		param.status = status;
		this.mailerService
			.sendMail({
                to: user.email,
                //to:'suresh@itoneclick.com',
				from: "no-reply@laytrip.com",
				subject: "Flight booking Confirmation",
				html: FlightBookingConfirmtionMail(param),
			})
			.then((res) => {
				console.log("res", res);
			})
			.catch((err) => {
				console.log("err", err);
			});

     }

    
}
