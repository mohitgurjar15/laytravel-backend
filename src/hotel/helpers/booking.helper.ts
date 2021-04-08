import { BadRequestException, Inject } from "@nestjs/common";
import { errorMessage } from "src/config/common.config";
import { Booking } from "src/entity/booking.entity";
import { Currency } from "src/entity/currency.entity";
import { Module } from "src/entity/module.entity";
import { getManager } from "typeorm";
import { v4 as uuidv4 } from 'uuid';
import * as uniqid from 'uniqid';
import { LayCreditRedeem } from "src/entity/lay-credit-redeem.entity";
import * as moment from "moment";
import { PaymentStatus } from "src/enum/payment-status.enum";
import { BookingInstalments } from "src/entity/booking-instalments.entity";
import { InstalmentStatus } from "src/enum/instalment-status.enum";
import { collect } from "collect.js";
import { Role } from "src/enum/role.enum";
import { TravelerInfo } from "src/entity/traveler-info.entity";
import { HotelBookingParam } from "src/config/email_template/model/hotel-booking-param.model";
import { MailerService } from "@nestjs-modules/mailer";
import * as config from "config";
import { PredictiveBookingData } from "src/entity/predictive-booking-data.entity";
const mailConfig = config.get("email");

export class BookingHelper{
    
    constructor(
        @Inject(MailerService)
        private readonly mailerService: MailerService
    ) {
        
    }
    async saveBooking(bookDto, bookingData) {

        let moduleDetails : any = await this.getModule('hotel');

		let currencyDetails : any = await this.getCurrency(bookDto.currency);
        
        let booking = {
            id : uuidv4(),
            moduleId : moduleDetails.id,
            laytripBookingId : `LTH${uniqid.time().toUpperCase()}`,
            currency : currencyDetails.id,
            usdFactor : currencyDetails.liveRate.toString(),
            locationInfo: {},
            fareType : '',
            isTicketd: false,
            ...bookingData
        }
        
        let bookingRepository = getManager().getRepository(Booking);
        
        let bookingDetails = await bookingRepository.save(booking);
        
        await this.saveGuests(bookingDetails, bookDto.guests);
        
        return bookingDetails;

    }
    
    async getModule(name) {
        
        let moduleDetails = await getManager()
			.createQueryBuilder(Module, "module")
			.where('"module"."name"=:name', { name })
            .getOne();
        
        if (!moduleDetails) {
			throw new BadRequestException(
                'Please configure ' + name + ' module in database&&&module_id&&&' + errorMessage
			);
        }
        
        return moduleDetails;
    }

    async getCurrency(currencyCode) {
        
        let currencyDetails = await getManager()
			.createQueryBuilder(Currency, "currency")
			.where('"currency"."code"=:currencyCode and "currency"."status"=true', {
				currencyCode,
			})
            .getOne();
        
        if (!currencyDetails) {
			throw new BadRequestException('Invalid currency code sent!');
        }
        
        return currencyDetails;
    }

    async saveInstalment(instalmentDetails, booking, type, captureToken) {
        
        let insDetails = collect(instalmentDetails.instalment_date).map((item: any, key: number) => {
            return {
                bookingId : booking.id,
                userId : booking.userId,
                moduleId : booking.moduleId,
                instalmentType : type,
                instalmentDate : item.instalment_date,
                currencyId : booking.currency,
                amount : item.instalment_amount,
                instalmentStatus : key ? InstalmentStatus.PENDING : InstalmentStatus.PAID,
                transactionToken : key ? null : captureToken,
                paymentStatus : key ? PaymentStatus.PENDING : PaymentStatus.CONFIRM,
                attempt : key ? 0 : 1,
                supplierId : 1,
                isPaymentProcessedToSupplier : 0,
                isInvoiceGenerated : 0,
            }
        }).values().all();

        let insRepository = getManager().getRepository(BookingInstalments);
        
        let insData = await insRepository.save(insDetails);

        return insData;
    }

    async saveLaytripCredits(booking) {
        const layCreditReedem = new LayCreditRedeem();
        layCreditReedem.userId = booking.userId;
        layCreditReedem.points = booking.layCredit;
        layCreditReedem.redeemDate = moment().format('YYYY-MM-DD');
        layCreditReedem.status = 1;
        layCreditReedem.redeemMode = 'auto';
        layCreditReedem.description = '';
        layCreditReedem.redeemBy = booking.userId;
        await layCreditReedem.save();
    }
    
    async saveGuests(booking, guests) {
        
        let guestDetails = collect(guests).map((item: any) => {
            console.log(item);
            return {
				bookingId: booking.id,
				userId: item,
				roleId: Role.TRAVELER_USER,
            }
        }).values().all();

        let traRepository = getManager().getRepository(TravelerInfo);
        
        await traRepository.save(guestDetails);

    }

    async sendEmail(booking_details) {
        // this.mailerService
        //     .sendMail({
        //         to: booking_details.user.email,
        //         from: mailConfig.from,
		// 		bcc: mailConfig.BCC,
		// 		subject: 'Hotel Booking Confirmation',
        //         html: await HotelBookingConfirmationMail(new HotelBookingParam(booking_details)),
        //     })
        //     .then((res) => {
        //         console.log("res", res);
        //     })
        //     .catch((err) => {
        //         console.log("err", err);
        //     });
    }

    async savePredictive(booking) {
        const predictiveBooking = new PredictiveBookingData();
        predictiveBooking.bookingId = booking.id;
        predictiveBooking.date = new Date();
        predictiveBooking.netPrice = parseFloat(booking.netRate);
        predictiveBooking.isBelowMinimum = false; /* This nned to be 'false' as in hotels we are not getting such parameter */
        predictiveBooking.price = parseFloat(booking.totalAmount);
        predictiveBooking.remainSeat = booking.moduleInfo.room.available_rooms ?? 0;
        await predictiveBooking.save()       
    }
}