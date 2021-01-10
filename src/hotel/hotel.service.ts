import { BadRequestException, CACHE_MANAGER, HttpException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { HotelSearchLocationDto } from './dto/search-location.dto';
import { SearchReqDto } from './dto/search-req.dto';
import { Hotel } from './hotel-suppliers/hotel.manager';
import { Priceline } from './hotel-suppliers/priceline/priceline';
import { Cache } from 'cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { DetailReqDto } from './dto/detail-req.dto';
import { RoomsReqDto } from './dto/rooms-req.dto';
import { collect } from 'collect.js';
import { FilterHelper } from './helpers/filter.helper';
import { FilterReqDto } from './dto/filter-req.dto';
import { RateHelper } from './helpers/rate.helper';
import { AvailabilityDto } from './dto/availability-req.dto';
import { Generic } from './helpers/generic.helper';
import { BookDto } from './dto/book-req.dto';
import { BookDto as PPNBookDto } from './hotel-suppliers/priceline/dto/book.dto';
import { UserHelper } from './helpers/user.helper';
import { PaymentService } from 'src/payment/payment.service';
import { PaymentType } from 'src/enum/payment-type.enum';
import * as moment from "moment";
import { errorMessage } from 'src/config/common.config';
import { BookingHelper } from './helpers/booking.helper';
import { BookingType } from 'src/enum/booking-type.enum';
import { DateTime } from 'src/utility/datetime.utility';
import { PaymentStatus } from 'src/enum/payment-status.enum';
import { BookingStatus } from 'src/enum/booking-status.enum';
import { BookingRepository } from 'src/booking/booking.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { HotelBookingConfirmationMail } from "src/config/email_template/hotel-booking-confirmation-mail.html";
import { HotelBookingParam } from 'src/config/email_template/model/hotel-booking-param.model';
import { Booking } from 'src/entity/booking.entity';

@Injectable()
export class HotelService{
    
    private hotel: Hotel;

    private ttl: number = 3000;
    
    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private generic: Generic,
        private rate: RateHelper,
        private user: UserHelper,
        private booking: BookingHelper,
        private paymentService: PaymentService,
        
        @InjectRepository(BookingRepository)
        private bookingRepository: BookingRepository,
        
    ) {
        this.hotel = new Hotel(new Priceline());
    }

    async autoComplete(searchLocationDto: HotelSearchLocationDto) {
        
        let locations = await this.hotel.autoComplete(searchLocationDto.term);
        
        // locations = plainToClass(Location, locations, );
        
        return {
            data: locations,
            message: locations.length ? 'Result found' : 'No result Found'
        };
    }
    
    async search(searchReqDto: SearchReqDto) {
        
        /* This should return direct hotel response (Directly from supplier's and as per our decided structure) */
        let hotels = await this.hotel.search(searchReqDto);
        // return hotels;
        /* Add any type of Business logic for hotel object's */
        hotels = this.rate.generateInstalments(hotels, searchReqDto.check_in);

        let token = uuidv4();

        searchReqDto['token'] = token;
        searchReqDto['total'] = hotels.count();

        let toCache = {
            details: searchReqDto,
            hotels
        };

        if (searchReqDto.filter) {
            
            let filterObjects = await FilterHelper.generateFilterObjects(toCache);

            toCache['filter_objects'] = filterObjects;

        }
        
        await this.cacheManager.set(token, toCache, { ttl: this.ttl });

        let response = {
            data: toCache,
            message: searchReqDto['total'] ? 'Result found' : 'No result Found'
        };
        
        return response;
    }

    async detail(detailReqDto: DetailReqDto) {
        
        let cached = await this.cacheManager.get(detailReqDto.token);

        let detail = await this.hotel.detail(detailReqDto);
        
        let details = cached.details;

        return {
            data: {
                hotel: detail,
                details
            },
            message: "Detail found for " + detailReqDto.hotel_id
        };

    }

    async rooms(roomsReqDto: RoomsReqDto) {

        let cached = await this.cacheManager.get(roomsReqDto.token);
        
        if (!cached.hotels) {
            throw new InternalServerErrorException("No record found for Hotel ID: "+roomsReqDto.hotel_id);
        }
        
        let hotel = collect(cached.hotels).where('id', roomsReqDto.hotel_id).first();
        
        if (!hotel) {
            throw new InternalServerErrorException("No record found for Hotel ID: "+roomsReqDto.hotel_id);
        }

        let details = cached.details;

        roomsReqDto.bundle = hotel['bundle'];
        roomsReqDto.rooms = details.occupancies.length;

        let rooms = await this.hotel.rooms(roomsReqDto);
        // return rooms;
        
        /* Add any type of Business logic for hotel object's */
        rooms = this.rate.generateInstalments(rooms, details.check_in);

        if (this.generic.isset(cached['rooms'])) {
            rooms = collect(cached['rooms']).union(rooms.values().toArray());
        }

        cached['rooms'] = rooms;

        await this.cacheManager.set(roomsReqDto.token, cached, { ttl: this.ttl });

        let response = {
            data: rooms,
            message: rooms.count() ? 'Rooms found' : 'No Room Found'
        };

        return response;

    }

    async filterObjects(filterReqDto: FilterReqDto) {
        
        let cached = await this.cacheManager.get(filterReqDto.token);

        let filterObjects = await FilterHelper.generateFilterObjects(cached);

        cached['filter_objects'] = filterObjects;

        await this.cacheManager.set(filterReqDto.token, cached, { ttl: this.ttl });

        return {
            data: filterObjects,
            message: "Filter object found"
        }
    }

    async availability(availabilityDto: AvailabilityDto) {

        let cached = await this.cacheManager.get(availabilityDto.token);

        if (!cached.rooms) {
            throw new InternalServerErrorException("No record found for Room ID: "+availabilityDto.room_id);
        }
        
        let room = collect(cached.rooms).where('room_id', availabilityDto.room_id).first();
        
        if (!room) {
            throw new InternalServerErrorException("No record found for Room ID: "+availabilityDto.room_id);
        }

        let details = cached.details;
        
        availabilityDto.bundle = room['bundle'];
        availabilityDto.rooms = details.occupancies.length;

        let availability = await this.hotel.availability(availabilityDto);
        // return availability;

        /* Add any type of Business logic for Room object's */
        availability = this.rate.generateInstalments(availability, details.check_in);

        availability = availability.map((item) => {
                
            item['price_change'] = (item.selling.total != room['selling']['total']);

            return item;
        });
        
        if (this.generic.isset(cached['availability'])) {
            availability = collect(cached['availability']).union(availability.values().toArray());
        }
        
        cached.availability = availability;

        await this.cacheManager.set(availabilityDto.token, cached, { ttl: this.ttl });

        let response = {
            data: availability,
            message: availability.count() ? 'Room\'s are available' : 'Room\'s are not available'
        };

        return response;

    }

    async book(bookDto: BookDto) {

        let cached = await this.cacheManager.get(bookDto.token);
        
        if (!cached.availability) {
            throw new InternalServerErrorException("No record found for Room ID: "+bookDto.room_id);
        }
        
        let availability: any = collect(cached.availability).where('room_id', bookDto.room_id).first();
        
        if (!availability) {
            throw new InternalServerErrorException("No record found for Room ID: "+bookDto.room_id);
        }
        
        let hotel: any = collect(cached.hotels).where('id', bookDto.hotel_id).first();
        
        if (!hotel) {
            throw new InternalServerErrorException("No record found for Hotel ID: "+bookDto.hotel_id);
        }

        let details = cached.details;
        
        let sellingPrice = availability.selling.total;

        let bookingDate = moment(new Date()).format("YYYY-MM-DD");
        
        let callBookAPI = true;
        
        let capturePayment = true;
        
        let instalmentDetails: any = null;

        let bookingData: any = {
            bookingType: BookingType.INSTALMENT,
            totalAmount: sellingPrice.toString(),
            netRate: sellingPrice.toString(),
            markupAmount: (sellingPrice - sellingPrice).toString(),
            moduleInfo: { details, hotel, room: availability },
            checkInDate: DateTime.convertFormat(details.check_in),
            checkOutDate: DateTime.convertFormat(details.check_out),
            cardToken: bookDto.card_token,
            userId: bookDto.user_id,
            layCredit: bookDto.laycredit_points || 0,
            bookingThrough: bookDto.booking_through || '',
            bookingDate,
            totalInstallments: 0,
            nextInstalmentDate: null,
            isPredictive: false,
            supplierBookingId: '',
            supplierStatus: 0,
            paymentStatus: PaymentStatus.PENDING,
            bookingStatus: BookingStatus.PENDING,
        };
        // return bookingData;
        if (bookDto.payment_type == PaymentType.INSTALMENT) {
            
            /* This are the func name's which need to be same as Instalment utility file func name's */
            let fnEnm = {
                weekly:'weekly',
                biweekly:'biWeekly',
                monthly:'monthly',
            }

            let newAvailability = this.rate.generateInstalments([availability], details.check_in, fnEnm[bookDto.instalment_type]);
            
            instalmentDetails = collect(newAvailability).pluck('instalment_details').first();

            if (instalmentDetails.instalment_available) {
                
                let dayDiff = moment(details.check_in).diff(bookingDate, 'days');

                bookingData.totalInstallments = instalmentDetails.instalment_date.length;
                bookingData.nextInstalmentDate = (instalmentDetails.instalment_date.length > 1) ? instalmentDetails.instalment_date[1].instalment_date : null;
			    bookingData.isPredictive = callBookAPI ? false : true;

                sellingPrice = instalmentDetails.instalment_date[0].instalment_amount;
                
                /* Call Hotel booking API if checkin date is less 3 months */
                callBookAPI = (dayDiff <= 90);
                
            } else {
                throw new BadRequestException(
					'Instalment option is not available for your search criteria'
				);
            }

        } else {
            bookingData.bookingType = BookingType.NOINSTALMENT;
        }

        
        let authCardResult = await this.paymentService.authorizeCard(
            bookDto.card_token,
            Math.ceil(sellingPrice * 100),
            "USD"
        );

        // return authCardResult;

        if (authCardResult.status == true) {
            
            let authCardToken = authCardResult.token;

            if (callBookAPI) {
                
                bookDto.bundle = availability.bundle;
                
                bookDto.primary_guest_detail = await this.user.getUser(bookDto.primary_guest);
                
                let bookData = new PPNBookDto(bookDto);
                
                let book = await this.hotel.book(bookData);

                if (book.status == 'success') {
                    bookingData.supplierStatus = 1;
                    bookingData.supplierBookingId = book.details.booking_id;
                    bookingData.bookingStatus = BookingStatus.CONFIRM;
                    bookingData.paymentStatus = PaymentStatus.CONFIRM;
                } else {
                    
                    await this.paymentService.voidCard(authCardToken);

                    return  {
                        success_message: 'Booking is Failed',
                        laytrip_booking_id: '',
                        booking_status: 'failed',
                        booking_details: {},
                        error_message: ""
                    };
                }

            }
            
            if (capturePayment) {
                
                let captureCardresult = await this.paymentService.captureCard(
                    authCardToken
                );

                if (captureCardresult.status == true) {
                    
                    let saveBookingResult = await this.booking.saveBooking(bookDto, bookingData);

                    if (instalmentDetails) {
                        await this.booking.saveInstalment(instalmentDetails, saveBookingResult, bookDto.instalment_type, captureCardresult.token);
                    }
                    
                    if (bookDto.laycredit_points) { 
                        await this.booking.saveLaytripCredits(saveBookingResult);
                    }
                    
                    if (!callBookAPI) {
                        /* Store data to predective booking */
                        bookingData.netRate = sellingPrice;
                        bookingData.totalAmount = sellingPrice;
                        await this.booking.savePredictive(bookingData);
                    }

                    let booking_details = await this.bookingRepository.getBookDetail(saveBookingResult.laytripBookingId);
                    
                    if (!booking_details) {
                        throw new HttpException({
                                status: 424,
                                message: 'bookingResult.error_message',
                        }, 424);
                    }
                    
                    this.booking.sendEmail(booking_details);
                    
                    delete booking_details.card;
                    let state = (callBookAPI ? 'confirmed' : 'pending');
                    let response = {
                        success_message: 'Booking is in ' + state + 'state',
                        laytrip_booking_id: saveBookingResult.laytripBookingId,
                        supplier_booking_id: saveBookingResult.supplierBookingId,
                        booking_status: state,
                        booking_details,
                        error_message: ""
                    };

                    return response;
                    
                } else {
                    throw new BadRequestException(
                        'Card capture is failed&&&card_token&&&'+errorMessage
                    );
                }
            } else {
                await this.paymentService.voidCard(authCardToken);
                throw new HttpException(
                    {
                        status: 424,
                        message: 'bookingResult.error_message',
                    },
                    424
                );
            }
        } else {
            throw new BadRequestException(
                'Card authorization is failed&&&card_token&&&'+errorMessage
            );
        }
 
    }

    async fetchPrice(bookingData: Booking) {

        
        try {
            let info: any = bookingData.moduleInfo;
            
            let searchReqDto: SearchReqDto = info.details;
            searchReqDto.hotel_id = info.hotel.id;

            /* Search for Hotel */
            let searchReq: any = await this.search(searchReqDto);
            let hotel: any = collect(searchReq.data.hotels).first();

            /* Set Room DTO for finding latest rooms rates */
            let roomsReqDto: RoomsReqDto;
            
            roomsReqDto = {
                hotel_id: hotel.id,
                bundle: hotel.bundle,
                rooms: info.details.occupancies.length,
            };

            let rooms = await this.hotel.rooms(roomsReqDto);
            
            let room: any = collect(rooms).where('room_id', info.room.id).first();
            
            /* If room data found then store new rate to predictive table */
            if (room) {
                bookingData.netRate = room.selling.total;
                bookingData.totalAmount = room.selling.total;
                await this.booking.savePredictive(bookingData);
                return {
                    data: {
                        room
                    },
                    message: 'Predictive data Stored'
                }
            } else {
                throw new NotFoundException("No rate found for this booking &&&booking&&&" + errorMessage);
            }

        } catch (err) {
            throw new NotFoundException(err + " &&&search&&&" + errorMessage);
        }

    }    

    async partialBook(booking_id, headers) {
        let booking = await this.bookingRepository.getBookDetail(booking_id);

        if (booking) {
            try {
                
                let priceRes = await this.fetchPrice(booking);
                
                if (priceRes) {
                    let room: any = priceRes.data.room;
                    
                    let availabilityDto: AvailabilityDto = {
                        room_id: room.room_id,
                        bundle: room.bundle
                    };
                    
                    let availabilityRes = await this.hotel.availability(availabilityDto);

                    if (availabilityRes) {
                        let availability :any = collect(availabilityRes).first();

                        let bookDto: any = {
                            bundle: availability.bundle,
                            primary_guest_detail : await this.user.getUser(booking.userId)
                        };

                        let bookData = new PPNBookDto(bookDto);

                        let book = await this.hotel.book(bookData);
                        
                        let response: any = {
                            success_message: 'Booking is Failed',
                            laytrip_booking_id: booking.laytripBookingId,
                            supplier_booking_id: booking.supplierBookingId,
                            booking_status: booking.bookingStatus,
                            error_message: ""
                        };

                        if (book.status == 'success') {
                            
                            booking.supplierBookingId = book.details.booking_id;
                            booking.supplierStatus = 1;
                            booking.bookingStatus = BookingStatus.CONFIRM;
                            booking.netRate = availability.selling.total;
                            booking.usdFactor = '' + booking.currency2.liveRate;

                            await booking.save();

                            let booking_details = await this.bookingRepository.getBookDetail(booking_id);

                            this.booking.sendEmail(booking_details);

                            delete booking_details.card;

                            response = {
                                success_message: 'Booking is confirmed',
                                supplier_booking_id: booking_details.supplierBookingId,
                                booking_status: booking_details.bookingStatus,
                                booking_details,
                            };
                        }
                        
                        return response;

                    }
                }
            } catch (err) {
                throw new NotFoundException(err+", No rate found for this booking &&&booking&&&" + errorMessage);
            }
        }
    }
}
