import {
    BadRequestException,
    CACHE_MANAGER,
    HttpException,
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";
import { HotelSearchLocationDto } from "./dto/search-location.dto";
import { SearchReqDto } from "./dto/search-req.dto";
import * as uniqid from "uniqid";
import { Hotel } from "./hotel-suppliers/hotel.manager";
import { Priceline } from "./hotel-suppliers/priceline/priceline";
import { Cache } from "cache-manager";
import { v4 as uuidv4 } from "uuid";
import { DetailReqDto } from "./dto/detail-req.dto";
import { RoomsReqDto } from "./dto/rooms-req.dto";
import { collect } from "collect.js";
import { FilterHelper } from "./helpers/filter.helper";
import { FilterReqDto } from "./dto/filter-req.dto";
import { RateHelper } from "./helpers/rate.helper";
import { AvailabilityDto } from "./dto/availability-req.dto";
import { GenericHotel } from "./helpers/generic.helper";
import { BookDto } from "./dto/book-req.dto";
import { BookDto as PPNBookDto } from "./hotel-suppliers/priceline/dto/book.dto";
import { UserHelper } from "./helpers/user.helper";
import { PaymentService } from "src/payment/payment.service";
import { PaymentType } from "src/enum/payment-type.enum";
import * as moment from "moment";
import { errorMessage, invalidToken } from "src/config/common.config";
import { BookingHelper } from "./helpers/booking.helper";
import { BookingType } from "src/enum/booking-type.enum";
import { DateTime } from "src/utility/datetime.utility";
import { PaymentStatus } from "src/enum/payment-status.enum";
import { BookingStatus } from "src/enum/booking-status.enum";
import { BookingRepository } from "src/booking/booking.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { Booking } from "src/entity/booking.entity";
import { BookHotelCartDto } from "./dto/cart-book.dto";
import { User } from "src/entity/user.entity";
import { getConnection, getManager } from "typeorm";
import { Currency } from "src/entity/currency.entity";
import { Language } from "src/entity/language.entity";
import { InstalmentType } from "src/enum/instalment-type.enum";
import { Instalment } from "src/utility/instalment.utility";
import { Module } from "src/entity/module.entity";
import { LayCreditRedeem } from "src/entity/lay-credit-redeem.entity";
import { TravelerInfoModel } from "src/config/email_template/model/traveler-info.model";
import { TravelerInfo } from "src/entity/traveler-info.entity";
import { Role } from "src/enum/role.enum";
import { BookingInstalments } from "src/entity/booking-instalments.entity";
import { InstalmentStatus } from "src/enum/instalment-status.enum";
import * as config from "config";
const card = config.get("card");
//const supporterEmail = config.get("supporterEmail");
const supporterEmail = 'customerservice@laytrip.com'
import { PredictiveBookingData } from "src/entity/predictive-booking-data.entity";
import { LandingPage } from "src/utility/landing-page.utility";
import { HotelCity } from "src/entity/hotel-city.entity";
import { HotelCityDto } from "./dto/hote-city.dto";
import { ModulesName } from "src/enum/module.enum";
import { PaymentConfigurationUtility } from "src/utility/payment-config.utility";

@Injectable()
export class HotelService {
    private hotel: Hotel;

    private ttl: number = 3000;

    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private generic: GenericHotel,
        private rate: RateHelper,
        private user: UserHelper,
        private booking: BookingHelper,
        private paymentService: PaymentService,

        @InjectRepository(BookingRepository)
        private bookingRepository: BookingRepository
    ) {
        this.hotel = new Hotel(new Priceline());
    }

    async autoComplete(searchLocationDto: HotelSearchLocationDto) {
        let locations = await this.hotel.autoComplete(searchLocationDto.term);

        // locations = plainToClass(Location, locations, );

        console.log("totalCount", locations.length);


        let filteredLocations = [];

        let cites = []
        let hotels = []

        for await (const obj of locations) {
            if (obj.type == 'city') {

                cites.push(obj)
            }

            if (obj.type == 'hotel') {
                hotels.push(obj);
            }

        }
        console.log("city totalCount", cites.length);
        console.log("hotel totalCount", hotels.length);
        if (cites.length >= 8) {
            for (let index = 0; index < 8; index++) {
                const element = cites[index];
                filteredLocations.push(element)
            }
        } else {
            filteredLocations = cites

            let count = 8 - cites.length

            console.log('count', count)

            for (let index = 0; index < count; index++) {
                const element = hotels[index];
                console.log("element", element);
                filteredLocations.push(element)
            }
        }

        console.log("filteredLocations", filteredLocations.length);

        return {
            data: filteredLocations,
            message: locations.length ? "Result found" : "No result Found",
        };
    }

    async search(searchReqDto: SearchReqDto, referralId: string) {
        /* This should return direct hotel response (Directly from supplier's and as per our decided structure) */
        let hotels = await this.hotel.search(searchReqDto, referralId);
        // return hotels;
        /* Add any type of Business logic for hotel object's */
        //hotels = this.rate.generateInstalments(hotels, searchReqDto.check_in);

        let token = uuidv4();

        searchReqDto["token"] = token;
        searchReqDto["total"] = hotels.length;

        let toCache = {
            details: searchReqDto,
            hotels,
        };

        if (searchReqDto.filter) {
            let filterObjects = await FilterHelper.generateFilterObjects(
                toCache
            );

            toCache["filter_objects"] = filterObjects;
        }

        //await this.cacheManager.set(token, toCache, { ttl: this.ttl });

        let response = {
            data: toCache,
            message: searchReqDto["total"] ? "Result found" : "No result Found",
        };

        return response;
    }

    async detail(detailReqDto: DetailReqDto) {
        //let cached = await this.cacheManager.get(detailReqDto.token);

        /* if (!cached) {
            throw new BadRequestException(invalidToken);
        } */

        let detail = await this.hotel.detail(detailReqDto);

        //let details = cached.details;

        return {
            data: {
                hotel: detail,
                details: {},
            },
            message: "Detail found for " + detailReqDto.hotel_id,
        };
    }

    async rooms(roomsReqDto: RoomsReqDto, user_id, referralId) {
        /*let cached = await this.cacheManager.get(roomsReqDto.token);

        if (!cached) {
            throw new BadRequestException(invalidToken);
        }

        if (!cached.hotels) {
            throw new NotFoundException(
                "No record found for Hotel ID: " + roomsReqDto.hotel_id
            );
        }

        let hotel = collect(cached.hotels)
            .where("id", roomsReqDto.hotel_id)
            .first();

        if (!hotel) {
            throw new NotFoundException(
                "No record found for Hotel ID: " + roomsReqDto.hotel_id
            );
        }

        let details = cached.details; */

        //roomsReqDto.bundle = hotel['bundle'];
        //roomsReqDto.rooms = details.occupancies.length;

        let result = await this.hotel.rooms(roomsReqDto, user_id, referralId);
        // return rooms;

        /* Add any type of Business logic for hotel object's */
        //console.log("Rooms", rooms.items);
        //rooms = this.rate.generateInstalments(rooms, rooms.items[0].input_data.check_in);

        /* if (this.generic.isset(cached['rooms'])) {
            rooms = collect(cached['rooms']).union(rooms.values().toArray());
        } */

        //cached['rooms'] = rooms;

        //await this.cacheManager.set(roomsReqDto.token, cached, { ttl: this.ttl });

        let response = {
            data: result.rooms,
            hotel: result.details,
            message: result.rooms.count() ? "Rooms found" : "No Room Found",
        };

        return response;
    }

    async filterObjects(filterReqDto: FilterReqDto) {
        let cached = await this.cacheManager.get(filterReqDto.token);

        if (!cached) {
            throw new BadRequestException(invalidToken);
        }

        let filterObjects = await FilterHelper.generateFilterObjects(cached);

        cached["filter_objects"] = filterObjects;

        await this.cacheManager.set(filterReqDto.token, cached, {
            ttl: this.ttl,
        });

        return {
            data: filterObjects,
            message: "Filter object found",
        };
    }

    async availability(availabilityDto: AvailabilityDto, user_id, referralId: string) {
        let availability = await this.hotel.availability(
            availabilityDto,
            user_id,
            referralId
        );

        //console.log("availiblity");

        // return availability;

        /* Add any type of Business logic for Room object's */
        //availability = this.rate.generateInstalments(availability, details.check_in);

        /* availability = availability.map((item) => {
                
            item['price_change'] = (item.selling.total != room['selling']['total']);

            return item;
        });
        
        if (this.generic.isset(cached['availability'])) {
            availability = collect(cached['availability']).union(availability.values().toArray());
        }
        
        cached.availability = availability;

        await this.cacheManager.set(availabilityDto.token, cached, { ttl: this.ttl }); */

        let response = {
            data: availability,
            message: availability.count()
                ? "Room's are available"
                : "Room's are not available",
        };

        return response;
    }

    async book(bookDto: BookDto, user_id) {
        let cached = await this.cacheManager.get(bookDto.token);

        if (!cached) {
            throw new BadRequestException(invalidToken);
        }

        if (!cached.availability) {
            throw new NotFoundException(
                "No record found for Room ID: " + bookDto.room_id
            );
        }

        let availability: any = collect(cached.availability)
            .where("room_id", bookDto.room_id)
            .first();

        if (!availability) {
            throw new NotFoundException(
                "No record found for Room ID: " + bookDto.room_id
            );
        }

        let hotel: any = collect(cached.hotels)
            .where("id", bookDto.hotel_id)
            .first();

        if (!hotel) {
            throw new NotFoundException(
                "No record found for Hotel ID: " + bookDto.hotel_id
            );
        }

        let details = cached.details;

        let sellingPrice = availability.selling.total;

        let bookingDate = moment(new Date()).format("YYYY-MM-DD");

        let callBookAPI = true;

        let capturePayment = true;

        let instalmentDetails: any = null;
        let markupAmount = "0";
        // let markupAmount = (sellingPrice - sellingPrice).toString();
        let bookingData: any = {
            bookingType: BookingType.INSTALMENT,
            totalAmount: sellingPrice.toString(),
            netRate: sellingPrice.toString(),
            markupAmount,
            moduleInfo: { details, hotel, room: availability },
            checkInDate: DateTime.convertFormat(details.check_in),
            checkOutDate: DateTime.convertFormat(details.check_out),
            cardToken: bookDto.card_token,
            userId: bookDto.user_id,
            layCredit: bookDto.laycredit_points || 0,
            bookingThrough: bookDto.booking_through || "",
            bookingDate,
            totalInstallments: 0,
            nextInstalmentDate: null,
            isPredictive: false,
            supplierBookingId: "",
            supplierStatus: 0,
            paymentStatus: PaymentStatus.PENDING,
            bookingStatus: BookingStatus.PENDING,
        };
        // return bookingData;
        if (bookDto.payment_type == PaymentType.INSTALMENT) {
            /* This are the func name's which need to be same as Instalment utility file func name's */
            let fnEnm = {
                weekly: "weekly",
                biweekly: "biWeekly",
                monthly: "monthly",
            };

            let newAvailability = this.rate.generateInstalments(
                [availability],
                details.check_in,
                fnEnm[bookDto.instalment_type]
            );

            instalmentDetails = collect(newAvailability)
                .pluck("instalment_details")
                .first();

            if (instalmentDetails.instalment_available) {
                let dayDiff = moment(details.check_in).diff(
                    bookingDate,
                    "days"
                );

                bookingData.totalInstallments =
                    instalmentDetails.instalment_date.length;
                bookingData.nextInstalmentDate =
                    instalmentDetails.instalment_date.length > 1
                        ? instalmentDetails.instalment_date[1].instalment_date
                        : null;
                bookingData.isPredictive = callBookAPI ? false : true;

                sellingPrice =
                    instalmentDetails.instalment_date[0].instalment_amount;

                /* Call Hotel booking API if checkin date is less 3 months */
                callBookAPI = dayDiff <= 90;
            } else {
                throw new BadRequestException(
                    "Instalment option is not available for your search criteria"
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

                bookDto.primary_guest_detail = await this.user.getUser(
                    bookDto.primary_guest
                );

                let bookData = new PPNBookDto(bookDto);

                let book = await this.hotel.book(bookData, user_id);

                if (book.status == "success") {
                    bookingData.supplierStatus = 1;
                    bookingData.supplierBookingId = book.details.booking_id;
                    bookingData.bookingStatus = BookingStatus.CONFIRM;
                    bookingData.paymentStatus = PaymentStatus.CONFIRM;
                } else {
                    await this.paymentService.voidCard(authCardToken, "");

                    return {
                        success_message: "Booking is Failed",
                        laytrip_booking_id: "",
                        booking_status: "failed",
                        booking_details: {},
                        error_message: "",
                    };
                }
            }

            if (capturePayment) {
                let captureCardresult = await this.paymentService.captureCard(
                    authCardToken,
                    ""
                );

                if (captureCardresult.status == true) {
                    let saveBookingResult = await this.booking.saveBooking(
                        bookDto,
                        bookingData
                    );

                    if (instalmentDetails) {
                        await this.booking.saveInstalment(
                            instalmentDetails,
                            saveBookingResult,
                            bookDto.instalment_type,
                            captureCardresult.token
                        );
                    }

                    if (bookDto.laycredit_points) {
                        await this.booking.saveLaytripCredits(
                            saveBookingResult
                        );
                    }

                    if (!callBookAPI) {
                        /* Store data to predective booking */
                        bookingData.netRate = sellingPrice;
                        bookingData.totalAmount = sellingPrice;
                        await this.booking.savePredictive(bookingData);
                    }

                    let booking_details: any = await this.bookingRepository.getBookDetail(
                        saveBookingResult.laytripBookingId
                    );

                    if (!booking_details) {
                        throw new HttpException(
                            {
                                status: 424,
                                message: "bookingResult.error_message",
                            },
                            424
                        );
                    }

                    this.booking.sendEmail(booking_details);

                    delete booking_details.card;
                    let state = callBookAPI ? "confirmed" : "pending";
                    let response = {
                        success_message: "Booking is in " + state + "state",
                        laytrip_booking_id: saveBookingResult.laytripBookingId,
                        supplier_booking_id:
                            saveBookingResult.supplierBookingId,
                        booking_status: state,
                        booking_details,
                        error_message: "",
                    };

                    return response;
                } else {
                    throw new BadRequestException(
                        "Card capture is failed&&&card_token&&&" + errorMessage
                    );
                }
            } else {
                await this.paymentService.voidCard(authCardToken, "");
                throw new HttpException(
                    {
                        status: 424,
                        message: "bookingResult.error_message",
                    },
                    424
                );
            }
        } else {
            throw new BadRequestException(
                "Card authorization is failed&&&card_token&&&" + errorMessage
            );
        }
    }

    async fetchPrice(bookingData: Booking) {
        try {
            let info: any = bookingData.moduleInfo;

            let searchReqDto: SearchReqDto = info.details;
            searchReqDto.hotel_id = info.hotel.id;

            /* Search for Hotel */
            let searchReq: any = await this.search(searchReqDto, "");
            let hotel: any = collect(searchReq.data.hotels).first();

            /* Set Room DTO for finding latest rooms rates */
            let roomsReqDto: RoomsReqDto;

            roomsReqDto = {
                hotel_id: hotel.id,
                bundle: hotel.bundle,
                rooms: info.details.occupancies.length,
            };

            let rooms = await this.hotel.rooms(
                roomsReqDto,
                bookingData.userId || "",
                ""
            );

            let room: any = collect(rooms)
                .where("room_id", info.room.id)
                .first();

            /* If room data found then store new rate to predictive table */
            if (room) {
                bookingData.netRate = room.selling.total;
                bookingData.totalAmount = room.selling.total;
                await this.booking.savePredictive(bookingData);
                return {
                    data: {
                        room,
                    },
                    message: "Predictive data Stored",
                };
            } else {
                throw new NotFoundException(
                    "No rate found for this booking &&&booking&&&" +
                    errorMessage
                );
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
                        bundle: room.bundle,
                        room_ppn: room.ppn,
                    };

                    let availabilityRes = await this.hotel.availability(
                        availabilityDto,
                        booking.userId,
                        ""
                    );

                    if (availabilityRes) {
                        let availability: any = collect(
                            availabilityRes
                        ).first();

                        let bookDto: any = {
                            bundle: availability.bundle,
                            primary_guest_detail: await this.user.getUser(
                                booking.userId
                            ),
                        };

                        let bookData = new PPNBookDto(bookDto);

                        let book = await this.hotel.book(
                            bookData,
                            booking.userId
                        );

                        let response: any = {
                            success_message: "Booking is Failed",
                            laytrip_booking_id: booking.laytripBookingId,
                            supplier_booking_id: booking.supplierBookingId,
                            booking_status: booking.bookingStatus,
                            error_message: "",
                        };

                        if (book.status == "success") {
                            booking.supplierBookingId = book.details.booking_id;
                            booking.supplierStatus = 1;
                            booking.bookingStatus = BookingStatus.CONFIRM;
                            booking.netRate = availability.selling.total;
                            booking.usdFactor = "" + booking.currency2.liveRate;

                            await booking.save();

                            let booking_details: any = await this.bookingRepository.getBookDetail(
                                booking_id
                            );

                            this.booking.sendEmail(booking_details);

                            delete booking_details.card;

                            response = {
                                success_message: "Booking is confirmed",
                                supplier_booking_id:
                                    booking_details.supplierBookingId,
                                booking_status: booking_details.bookingStatus,
                                booking_details,
                            };
                        }

                        return response;
                    }
                }
            } catch (err) {
                throw new NotFoundException(
                    err +
                    ", No rate found for this booking &&&booking&&&" +
                    errorMessage
                );
            }
        }
    }

    async validateHeaders(headers) {
        let currency = headers.currency;
        let language = headers.language;
        if (typeof currency == "undefined" || currency == "") {
            throw new BadRequestException(
                `Please enter currency code&&&currency`
            );
        } else if (typeof language == "undefined" || language == "") {
            throw new BadRequestException(
                `Please enter language code&&&language`
            );
        }

        let currencyDetails = await getManager()
            .createQueryBuilder(Currency, "currency")
            .where(`"currency"."code"=:currency and "currency"."status"=true`, {
                currency,
            })
            .getOne();
        if (!currencyDetails) {
            throw new BadRequestException(`Currency not available.`);
        }

        let languageDetails = await getManager()
            .createQueryBuilder(Language, "language")
            .where(
                `"language"."iso_1_code"=:language and "language"."active"=true`,
                {
                    language,
                }
            )
            .getOne();
        if (!languageDetails) {
            throw new BadRequestException(`Language not available.`);
        }
        return {
            currency: currencyDetails,
            language: languageDetails,
        };
    }

    async cartBook(
        bookHotelCartDto: BookHotelCartDto,
        headers,
        user: User,
        smallestDipatureDate,
        cartId,
        selected_down_payment: number,
        transaction_token,
        referral_id, cartIsPromotional
    ) {
        let logData = {}
        try {
            let headerDetails = await this.validateHeaders(headers);
            //console.log("header validate");
            let {
                travelers,
                payment_type,
                instalment_type,
                ppn,
                bundle,
                additional_amount,
                custom_instalment_amount,
                custom_instalment_no,
                laycredit_points,
                card_token,
                booking_through,
                cartCount,
                reservationId
            } = bookHotelCartDto;
            const availabilityDto: AvailabilityDto = {
                room_ppn: bundle,
            };
            cartCount = cartCount ? cartCount : 0;
            // await this.hotelService.availability({
            //     room_ppn: moduleInfo[0].bundle,
            // });
            let hotelAvailability = await this.availability(
                availabilityDto,
                user.userId,
                cartIsPromotional ? referral_id : ''
            );
            logData['revalidation-log'] = hotelAvailability.data["fileName"]
            let availability = hotelAvailability.data.items;
            //console.log("Availability", availability);

            let isPassportRequired = false;
            let bookingRequestInfo: any = {};
           
            if (availability) {

                bookingRequestInfo.adult_count =
                    availability[0].input_data.num_adults;
                bookingRequestInfo.child_count =
                    typeof availability[0].input_data.num_children !=
                        "undefined"
                        ? availability[0].input_data.num_children
                        : 0;
                bookingRequestInfo.infant_count = 0;
                bookingRequestInfo.net_rate =
                    availability[0].net_rate.total || 0;
                bookingRequestInfo.total_price =
                    availability[0].selling.total || 0;
                if (payment_type == PaymentType.INSTALMENT) {
                    bookingRequestInfo.selling_price =
                        availability[0].selling['discounted_total'];
                } else {
                    bookingRequestInfo.selling_price =
                        availability[0].selling['discounted_total'];
                }

                bookingRequestInfo.departure_date =
                    availability[0].input_data.check_in;
                bookingRequestInfo.arrival_date =
                    availability[0].input_data.check_out;
                //console.log("2");
                bookingRequestInfo.instalment_type = instalment_type;
                bookingRequestInfo.additional_amount = additional_amount;
                bookingRequestInfo.booking_through = booking_through;
                isPassportRequired = false;
                //console.log("3");
                bookingRequestInfo.laycredit_points = laycredit_points;
                bookingRequestInfo.card_token = card_token;
            }
            //console.log("bookingRequestInfo", bookingRequestInfo);
            let {
                selling_price,
                departure_date,
                adult_count,
                child_count,
                infant_count,
            } = bookingRequestInfo;
            let bookingDate = moment(new Date()).format("YYYY-MM-DD");
            //console.log("validate Traveler");
            let travelersDetails = await this.getTravelersInfo(
                travelers,
                isPassportRequired
            );
            
            let currencyId = headerDetails.currency.id;
            const userId = user.userId;
            
            if (payment_type == PaymentType.INSTALMENT) {
                let instalmentDetails;
                let totalAdditionalAmount = additional_amount || 0;
                
                if (laycredit_points > 0) {
                    totalAdditionalAmount =
                        totalAdditionalAmount + laycredit_points;
                }
                if (instalment_type == InstalmentType.WEEKLY) {
                    let weeklyCustomDownPayment = LandingPage.getDownPayment(availability[0].offer_data, 0);
                    if (cartIsPromotional) {
                        
                        instalmentDetails = Instalment.weeklyInstalment(
                            selling_price,
                            smallestDipatureDate,
                            bookingDate,
                            custom_instalment_amount,
                            false
                        );
                        console.log(instalmentDetails)

                    } else {
                        instalmentDetails = Instalment.weeklyInstalment(
                            selling_price,
                            smallestDipatureDate,
                            bookingDate,
                            custom_instalment_amount,
                            false,
                            
                        );
                    }
                }
                if (instalment_type == InstalmentType.BIWEEKLY) {
                    instalmentDetails = Instalment.biWeeklyInstalment(
                        selling_price,
                        smallestDipatureDate,
                        bookingDate,
                        custom_instalment_amount,
                        false
                    );
                }
                if (instalment_type == InstalmentType.MONTHLY) {
                    instalmentDetails = Instalment.monthlyInstalment(
                        selling_price,
                        smallestDipatureDate,
                        bookingDate,
                        custom_instalment_amount,
                        false
                    );
                }
                //console.log(instalmentDetails);
                if (instalmentDetails.instalment_available) {
                    let firstInstalemntAmount =
                        instalmentDetails.instalment_date[0].instalment_amount;
                    if (laycredit_points > 0) {
                        firstInstalemntAmount =
                            firstInstalemntAmount - laycredit_points;
                    }
                    /* Call mystifly booking API if checkin date is less 3 months */
                    let bookDto = new BookDto();

                    bookDto.bundle = availability[0].bundle;
                    let guest_detail = [];
                    let k=0;
                    for await (const item of travelers) {
                        //console.log(traveler.is_primary_traveler);

                        if (item.traveler.is_primary_traveler) {
                            
                            bookDto.primary_guest_detail =  item.traveler;
                        } else {
                            let detail = item.traveler;

                            guest_detail.push(detail);
                        }
                        k++;
                    }
                    // let bookData = new PPNBookDto(bookDto);
                    let bookData = {
                        name_first: bookDto.primary_guest_detail.firstName,
                        name_last: bookDto.primary_guest_detail.lastName,
                        initials: bookDto.primary_guest_detail?.title || "",
                        email: supporterEmail,
                        phone_number: bookDto.primary_guest_detail.phoneNo,

                        // guest_name_first: bookDto.guest_detail.firstName,
                        // guest_name_last: bookDto.guest_detail.lastName,
                        card_type: card.type,
                        card_number: card.number,
                        expires: card.exp_month + "" + card.exp_year,
                        cvc_code: card.cvv,
                        card_holder: card.name,
                        address_line_one: card.address.line_one,
                        address_city: card.address.city,
                        address_state_code: card.address.state_code,
                        country_code: card.address.country_code,
                        address_postal_code: card.address.postal_code,

                        ppn_bundle: bookDto.bundle,
                    };
                    if (guest_detail?.length) {
                        for (
                            let index = 0;
                            index < guest_detail.length;
                            index++
                        ) {
                            const element = guest_detail[index];
                            bookData[`guest_name_first[${index}]`] =
                                element.firstName || "";
                            bookData[`guest_name_last[${index}]`] =
                                element.lastName || "";
                        }
                    }
                    //console.log("bookData DTO", bookData);
                    console.log("******************************************************")
                    let bookingResult = await this.hotel.book(
                        bookData,
                        user.userId
                    );
                    console.log("******************************************************++++")
                    logData['supplier_side_booking_log'] = bookingResult["fileName"]

                    console.log("bookingResult?.status", bookingResult?.status);

                    if (bookingResult?.status != "success") {
                        return {
                            statusCode: 424,
                            message:
                                "Booking failed from supplier side at " +
                                new Date(),
                            bookingResult,
                            logData
                        };
                    }

                    let laytripBookingResult = await this.saveBooking(
                        bookingRequestInfo,
                        currencyId,
                        bookingDate,
                        BookingType.INSTALMENT,
                        userId,
                        availability,
                        instalmentDetails,
                        null,
                        bookingResult || null,
                        travelers,
                        cartId,
                        reservationId,
                        referral_id
                    );
                    return {
                        laytrip_booking_id: laytripBookingResult.id,
                        booking_status: "pending",
                        supplier_booking_id: "",
                        success_message: `Booking is in pending state!`,
                        error_message: "",
                        booking_details: await this.bookingRepository.getBookingDetails(
                            laytripBookingResult.laytripBookingId
                        ),
                        logData
                    };
                } else {
                    return {
                        statusCode: 422,
                        message: `Instalment option is not available for your search criteria`,
                        logData
                    };

                }
            } else if (payment_type == PaymentType.NOINSTALMENT) {
                console.log("INSIDE ELSE IF------->NO_INSTALLMENT")
                let sellingPrice = selling_price;
                if (laycredit_points > 0) {
                    sellingPrice = selling_price - laycredit_points;
                }
                if (sellingPrice > 0) {
                    let bookDto = new BookDto();

                    bookDto.bundle = availability[0].bundle;
                    let guest_detail = [];
                    for await (const item of travelers) {
                        if (item.traveler.is_primary_traveler) {
                            
                            bookDto.primary_guest_detail =  item.traveler;
                        } else {
                            let detail = item.traveler;
                    
                            guest_detail.push(detail);
                        }
                    }
                    // let bookData = new PPNBookDto(bookDto);
                    let bookData = {
                        name_first: bookDto.primary_guest_detail.firstName,
                        name_last: bookDto.primary_guest_detail.lastName,
                        initials: bookDto.primary_guest_detail?.title || "",
                        email: supporterEmail,
                        phone_number: bookDto.primary_guest_detail.phoneNo,
                        card_type: card.type,
                        card_number: card.number,
                        expires: card.exp_month + "" + card.exp_year,
                        cvc_code: card.cvv,
                        card_holder: card.name,
                        address_line_one: card.address.line_one,
                        address_city: card.address.city,
                        address_state_code: card.address.state_code,
                        country_code: card.address.country_code,
                        address_postal_code: card.address.postal_code,

                        ppn_bundle: bookDto.bundle,
                    };
                    if (guest_detail?.length) {
                        for (
                            let index = 0;
                            index < guest_detail.length;
                            index++
                        ) {
                            const element = guest_detail[index];
                            bookData[`guest_name_first[${index}]`] =
                                element.firstName || "";
                            bookData[`guest_name_last[${index}]`] =
                                element.lastName || "";
                        }
                    }

                    let bookingResult = await this.hotel.book(
                        bookData,
                        user.userId
                    );
                    
                    logData['supplier_side_booking_log'] = bookingResult["fileName"]

                    if (bookingResult?.status != "success") {
                        return {
                            statusCode: 424,
                            message:
                                "Booking failed from supplier side at " +
                                new Date(),
                            bookingResult,
                            logData
                        };
                    }

                    let authCardToken = transaction_token;
                    let laytripBookingResult = await this.saveBooking(
                        bookingRequestInfo,
                        currencyId,
                        bookingDate,
                        BookingType.NOINSTALMENT,
                        userId,
                        availability,
                        null,
                        null,
                        bookingResult,
                        travelers,
                        cartId,
                        reservationId
                    );
                    //send email here
                    bookingResult.laytrip_booking_id = laytripBookingResult.id;
                    bookingResult.booking_details = await this.bookingRepository.getBookingDetails(
                        laytripBookingResult.laytripBookingId
                    );
                    bookingResult['logData'] = logData
                    return bookingResult;
                }
            }
        } catch (error) {
            return {
                message: errorMessage,
                error,
                logData
            };
        }
    }

    async getTravelersInfo(travelers, isPassportRequired = null) {
       
        let travelerIds = [];
        let traveleDetails = {
            adults: [],
            children: [],
        };
        if (travelers.length > 0) {
            for (let item of travelers) {
                let traveler= item.traveler;
                if (traveler.dob) {
                    let ageDiff = moment(new Date()).diff(
                        moment(traveler.dob),
                        "years"
                    );
                    if (ageDiff >= 12) {
                        traveleDetails.adults.push(traveler);
                    } else {
                        traveleDetails.children.push(traveler);
                    }
                } else {
                    traveleDetails.adults.push(traveler);
                }
            }
            return traveleDetails;
        } else {
            throw new BadRequestException(`Please enter valid traveler(s) id`);
        }
    }

    async saveTravelers(bookingId, userId, travelers: any) {
        // const userData = await getManager()
        // 	.createQueryBuilder(User, "user")
        // 	.select(["user.roleId", "user.userId"])
        // 	.where(`"user_id" =:user_id AND "is_deleted" = false `, { user_id: userId })
        // 	.getOne();

        // var primaryTraveler = new TravelerInfo();

        // primaryTraveler.bookingId = bookingId;
        // primaryTraveler.userId = userId;
        // primaryTraveler.roleId = userData.roleId;

        // primaryTraveler.save();
        let i=0;
        for await (var item of travelers) {
            let userData = item.traveler;
            var birthDate = new Date(userData.dob);
            var age = moment(new Date()).diff(moment(birthDate), "years");

            var user_type = "";
            // if (age < 2) {
            //     user_type = "infant";
            // } else
            if (age < 12) {
                user_type = "child";
            } else {
                user_type = "adult";
            }
            const travelerInfo: TravelerInfoModel = {
                firstName: userData.firstName,
                passportExpiry: userData.passportExpiry || "",
                passportNumber: userData.passportNumber || "",
                lastName: userData.lastName || "",
                email: userData.email || "",
                phoneNo: userData.phoneNo || "",
                countryCode: userData.countryCode || "",
                dob: userData.dob,
                countryId: userData.countryId,
                gender: userData.gender,
                age: age,
                user_type: user_type,
            };
            var travelerUser = new TravelerInfo();
            travelerUser.bookingId = bookingId;
            //travelerUser.userId = travelerId;
            travelerUser.isPrimary = userData.is_primary_traveler;
            travelerUser.roleId = Role.TRAVELER_USER;
            travelerUser.travelerInfo = travelerInfo;
            await travelerUser.save();
            i++;
        }
    }

    async saveBooking(
        bookFlightDto,
        currencyId,
        bookingDate,
        bookingType,
        userId,
        revalidateResult,
        instalmentDetails = null,
        captureCardresult = null,
        supplierBookingData,
        travelers,
        cartId = null,
        reservationId = null,
        referral_id = null
    ) {
        const {
            selling_price,
            net_rate,
            journey_type,
            source_location,
            destination_location,
            instalment_type,
            laycredit_points,
            fare_type,
            card_token,
            booking_through,
            total_price
        } = bookFlightDto;

        let moduleDetails = await getManager()
            .createQueryBuilder(Module, "module")
            .where(`"module"."name"=:name`, { name: "hotel" })
            .getOne();
        if (!moduleDetails) {
            throw new BadRequestException(
                `Please configure hotel module in database&&&module_id&&&${errorMessage}`
            );
        }

        let currencyDetails = await getManager()
            .createQueryBuilder(Currency, "currency")
            .where(`"currency"."id"=:currencyId and "currency"."status"=true`, {
                currencyId,
            })
            .getOne();
        //console.log("saveBooking", 1);

        let booking = new Booking();
        booking.id = uuidv4();

        booking.moduleId = moduleDetails?.id;
        //console.log("moduleDetails", moduleDetails);

        // booking.laytripBookingId = `LTH${uniqid.time().toUpperCase()}`;

        booking.laytripBookingId = reservationId
        //console.log(1);

        booking.bookingType = bookingType;
        //console.log(2);
        booking.currency = currencyId;
        //console.log(3);
        booking.totalAmount = selling_price?.toString();
        //console.log(4);
        //console.log(net_rate);
        //console.log(typeof net_rate);
        //console.log(net_rate);

        booking.netRate = net_rate.toString();
        //console.log(5);
        booking.markupAmount = (selling_price - net_rate).toString();
        //console.log(6);
        booking.bookingDate = bookingDate;
        //console.log("currencyDetails");
        //booking.reservationId = reservationId;
        //console.log("currencyDetails", currencyDetails);
        booking.usdFactor = currencyDetails?.liveRate.toString();
        booking.layCredit = laycredit_points || 0;
        booking.bookingThrough = booking_through || "";
        booking.cartId = cartId;
        //console.log("saveBooking", 2);
        booking.actualSellingPrice = total_price.toString();
        booking.isPromotional = revalidateResult[0]?.offer_data?.applicable
        booking.offerFrom = referral_id
        booking.locationInfo = {
            hotel_id: revalidateResult[0].hotel_id,
            hotel_name: revalidateResult[0].hotel_name,
            address: revalidateResult[0].address,
        };
        // const [caegory] = await getConnection().query(`select
        // (select name from laytrip_category where id = flight_route.category_id)as categoryname
        // from flight_route
        // where from_airport_code  = '${source_location}' and to_airport_code = '${destination_location}'`);
        // booking.categoryName = caegory?.categoryname || null;

        booking.fareType = null;
        booking.isTicketd = false;

        booking.userId = userId;
        //console.log("saveBooking", 3);
        if (laycredit_points > 0) {
            const layCreditReedem = new LayCreditRedeem();
            layCreditReedem.userId = userId;
            layCreditReedem.points = laycredit_points;
            layCreditReedem.redeemDate = moment().format("YYYY-MM-DD");
            layCreditReedem.status = 1;
            layCreditReedem.redeemMode = "auto";
            layCreditReedem.description = "";
            layCreditReedem.redeemBy = userId;
            await layCreditReedem.save();
        }
        let nextInstallmentDate = "";
        //console.log("saveBooking", 4);
        if (instalmentDetails) {
            //console.log("instalmentDetails", instalmentDetails);
            booking.totalInstallments =
                instalmentDetails.instalment_date.length;
            if (instalmentDetails.instalment_date.length > 1) {
                booking.nextInstalmentDate =
                    instalmentDetails.instalment_date[1].instalment_date;
            }
            //console.log("status", supplierBookingData?.status);
            booking.bookingStatus =
                supplierBookingData != null &&
                    supplierBookingData?.status == "success"
                    ? BookingStatus.CONFIRM
                    : BookingStatus.FAILED;
            booking.paymentStatus = PaymentStatus.PENDING;
            //console.log("Booking id", supplierBookingData?.details?.booking_id);

            booking.supplierBookingId =
                supplierBookingData != null &&
                    supplierBookingData.details.booking_id
                    ? supplierBookingData?.details?.booking_id
                    : "";
            booking.isPredictive = false;

            booking.supplierStatus = supplierBookingData != null ? 0 : 1;
        } else {
            //pass here mystifly booking id
            booking.supplierBookingId = supplierBookingData.details.booking_id;
            booking.supplierStatus =
                supplierBookingData != null &&
                    supplierBookingData.status != "success"
                    ? 0
                    : 1;
            //booking.supplierBookingId = "";
            booking.bookingStatus = BookingStatus.CONFIRM;
            booking.paymentStatus = PaymentStatus.CONFIRM;
            booking.isPredictive = false;
            booking.totalInstallments = 0;
        }
        booking.cardToken = card_token;
        //console.log("saveBooking", 5);
        booking.moduleInfo = revalidateResult;
        booking.checkInDate = revalidateResult[0].input_data.check_in;
        booking.checkOutDate = revalidateResult[0].input_data.check_out;

        try {
            let bookingDetails = await booking.save();
            //console.log(" save booking");
            await this.saveTravelers(booking.id, userId, travelers);
            if (instalmentDetails) {
                let bookingInstalments: BookingInstalments[] = [];
                let bookingInstalment = new BookingInstalments();
                let i = 0;
                for (let instalment of instalmentDetails.instalment_date) {
                    bookingInstalment = new BookingInstalments();
                    bookingInstalment.bookingId = bookingDetails.id;
                    bookingInstalment.userId = userId;
                    bookingInstalment.moduleId = moduleDetails.id;
                    bookingInstalment.instalmentType = instalment_type;
                    bookingInstalment.instalmentDate =
                        instalment.instalment_date;
                    bookingInstalment.currencyId = currencyId;
                    bookingInstalment.amount = instalment.instalment_amount;
                    bookingInstalment.instalmentStatus =
                        i == 0
                            ? InstalmentStatus.PAID
                            : InstalmentStatus.PENDING;
                    bookingInstalment.transactionToken =
                        i == 0 ? captureCardresult?.token : null;
                    bookingInstalment.paymentStatus =
                        i == 0 && captureCardresult
                            ? PaymentStatus.CONFIRM
                            : PaymentStatus.PENDING;
                    bookingInstalment.attempt =
                        i == 0 && captureCardresult ? 1 : 0;
                    bookingInstalment.supplierId = 1;
                    bookingInstalment.isPaymentProcessedToSupplier = 0;
                    bookingInstalment.isInvoiceGenerated = 0;
                    bookingInstalment.instalmentNo = i + 1;
                    i++;
                    bookingInstalments.push(bookingInstalment);
                }
                //console.log("saveInstallment", 6);
                await getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(BookingInstalments)
                    .values(bookingInstalments)
                    .execute();
            }
            // const predictiveBooking = new PredictiveBookingData();
            // predictiveBooking.bookingId = booking.id;
            // predictiveBooking.date = new Date();
            // predictiveBooking.netPrice = parseFloat(booking.netRate);
            // predictiveBooking.isBelowMinimum =
            //     booking.moduleInfo[0].routes[0].stops[0].below_minimum_seat;
            // predictiveBooking.price = parseFloat(booking.totalAmount);
            // predictiveBooking.remainSeat =
            //     booking.moduleInfo[0].routes[0].stops[0].remaining_seat;
            // //console.log('save prictive data',4);
            // await predictiveBooking.save();
            // //console.log("get booking");
            return await this.bookingRepository.getBookingDetails(
                booking.laytripBookingId
            );
        } catch (error) {
            //console.log(error);
        }
    }

    async getHotelCity(hotelCityDto: HotelCityDto) {
        const { city } = hotelCityDto
      let  where = `"city"."city" ILIKE '%${city}%'`
        let results = await getManager()
            .createQueryBuilder(HotelCity, "city")
            .select([
                "city.city"
            ])
            .distinctOn(["city.city"])
            .where(where)
            .getMany()

        if (!results.length) {
            throw new NotFoundException('no data found')
        }
        let responce = [];
        // for await (const item of results) {
        //     if (item.city) {
        //         let filteredStrings = responce.filter((str) => str.toLowerCase().includes(item.country.toLowerCase()))
        //         if (!filteredStrings[0]) {
        //             responce.push(item.city)
        //         }
        //     }
        // }
        return {
            data: results
        }
    }
}
