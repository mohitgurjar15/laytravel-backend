import {
    BadRequestException,
    CACHE_MANAGER,
    ConflictException,
    ForbiddenException,
    Inject,
    Injectable,
    InternalServerErrorException,
    NotAcceptableException,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { User } from "src/entity/user.entity";
import { ModulesName } from "src/enum/module.enum";
import { FlightService } from "src/flight/flight.service";
import { DateTime } from "src/utility/datetime.utility";
import { AddInCartDto } from "./dto/add-in-cart.dto";
import * as moment from "moment";
import { Cart } from "src/entity/cart.entity";
import { getConnection, getManager, SimpleConsoleLogger } from "typeorm";
import { VacationRentalService } from "src/vacation-rental/vacation-rental.service";
import { Role } from "src/enum/role.enum";
import * as uuidValidator from "uuid-validate";
import { CartTravelers } from "src/entity/cart-traveler.entity";
import { BookFlightDto } from "src/flight/dto/book-flight.dto";
import { UpdateCartDto } from "./dto/update-cart.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { AirportRepository } from "src/flight/airport.repository";
import { ListCartDto } from "./dto/list-cart.dto";
import { Strategy } from "src/flight/strategy/strategy";
import { Mystifly } from "src/flight/strategy/mystifly";
import { Module } from "src/entity/module.entity";
import { Generic } from "src/utility/generic.utility";
import { errorMessage } from "src/config/common.config";
import { Cache } from "cache-manager";
import { CartBookDto } from "./dto/book-cart.dto";
import { MultipleInventryDeleteFromCartDto } from "./dto/multiple-inventry-delete.dto";
import { v4 as uuidv4 } from "uuid";
import * as uniqid from "uniqid";
import { CartBooking } from "src/entity/cart-booking.entity";
import { BookingType } from "src/enum/booking-type.enum";
import { BookingStatus } from "src/enum/booking-status.enum";
import { PaymentStatus } from "src/enum/payment-status.enum";
import { cartInstallmentsDto } from "./dto/cart-installment-detil.dto";
import { UserCard } from "src/entity/user-card.entity";
import { SearchLog } from "src/entity/search-log.entity";
import { CartBookingEmailParameterModel } from "src/config/email_template/model/cart-booking-email.model";
import { CartDataUtility } from "src/utility/cart-data.utility";
import { MailerService } from "@nestjs-modules/mailer";
import * as config from "config";
import { LaytripCartBookingConfirmtionMail } from "src/config/new_email_templete/cart-booking-confirmation.html";
const mailConfig = config.get("email");
import { BookingNotCompletedMail } from "src/config/new_email_templete/laytrip_booking-not-completed-mail.html";
import { PaymentService } from "src/payment/payment.service";
import { BookingInstalments } from "src/entity/booking-instalments.entity";
import { Booking } from "src/entity/booking.entity";
import { PaymentType } from "src/enum/payment-type.enum";
import { Instalment } from "src/utility/instalment.utility";
import { InstalmentType } from "src/enum/instalment-type.enum";
import { HotelService } from "src/hotel/hotel.service";
import { BookHotelCartDto } from "src/hotel/dto/cart-book.dto";
import { LaytripCartBookingTravelProviderConfirmtionMail } from "src/config/new_email_templete/cart-traveler-confirmation.html";
import { LandingPages } from "src/entity/landing-page.entity";
import { BookingLog } from "src/entity/booking-log.entity";
import { CartOverChargeMail } from "src/config/new_email_templete/cart-overcharge-mail.html";
import { CartLessChargeMail } from "src/config/new_email_templete/cart-lessCharge-mail.html";
import { CartFailedInventryMail } from "src/config/new_email_templete/cart-failed-inventry.html";
import { InstalmentStatus } from "src/enum/instalment-status.enum";
import { RouteCategory } from "src/utility/route-category.utility";
import { Countries } from "src/entity/countries.entity";



@Injectable()
export class CartService {
    constructor(
        private flightService: FlightService,
        private vacationService: VacationRentalService,
        private paymentService: PaymentService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,

        @InjectRepository(AirportRepository)
        private airportRepository: AirportRepository,

        public readonly mailerService: MailerService,
        private hotelService: HotelService
    ) { }

    async addInCart(addInCartDto: AddInCartDto, user, Header, referralId) {

        try {
            let userData;
            const {
                module_id,
                route_code,
                property_id,
                room_id,
                rate_plan_code,
                check_in_date,
                check_out_date,
                adult_count,
                number_and_children_ages = [],
                payment_frequency,
                downpayment,
                payment_method
            } = addInCartDto;

            var tDate = new Date();

            var todayDate = tDate.toISOString().split(" ")[0];
            todayDate = todayDate
                .replace(/T/, " ") // replace T with a space
                .replace(/\..+/, "");
            let where = `AND ("cart"."user_id" = '${user.user_id}')`;
            if (user.roleId == Role.GUEST_USER) {
                if (!uuidValidator(user.user_id)) {
                    throw new NotFoundException(
                        `Please enter guest user id &&&user_id&&&${errorMessage}`
                    );
                }
                where = `AND ("cart"."guest_user_id" = '${user.user_id}')`;
            }
            let query = getConnection()
                .createQueryBuilder(Cart, "cart")
                .where(
                    `(DATE("cart"."expiry_date") >= DATE('${todayDate}') )  AND ("cart"."is_deleted" = false) ${where}`
                );
            const [result, count] = await query.getManyAndCount();


            if (count >= 10) {
                throw new BadRequestException(
                    `10 item cart maximum, please Checkout and start another Cart if you require
more than 10.`
                );
            }
            let promotional = 0
            let nonPromotional = 0
            let promotionalItem = []
            let nonPromotionalItem = []
            let paymentType = 0
            for (let index = 0; index < result.length; index++) {
                const cart = result[index];

                if (cart.isPromotional == true) {
                    promotional++
                    promotionalItem.push(cart.id)
                } else {
                    nonPromotional++
                    nonPromotionalItem.push(cart.id)
                }

                if (paymentType == 0) {
                    paymentType = cart.paymentType
                }
            }

            /* if (promotional > 0 && nonPromotional > 0) {
                throw new ConflictException(`In cart promotional and not promotional both inventry found.`)
            } */

            let cartIsPromotional=false;
            /* if (promotional > 0) {
                cartIsPromotional = true
            } else if (nonPromotional > 0) {
                cartIsPromotional = false
            } */
            if(referralId!=''){
                cartIsPromotional=true;
            }

            userData = await getConnection()
                .createQueryBuilder(User, "user")
                .where(`user_id = '${user.user_id}'`)
                .getOne();


            switch (module_id) {
                case ModulesName.HOTEL:
                    return await this.addHotelIntoCart(route_code, userData, referralId, cartIsPromotional, paymentType, payment_frequency, downpayment, payment_method);
                   
                case ModulesName.FLIGHT:
                    return await this.addFlightDataInCart(
                        route_code,
                        userData,
                        Header, referralId, cartIsPromotional, paymentType, payment_frequency, downpayment, payment_method
                    );
                case ModulesName.VACATION_RENTEL:
                    const dto = {
                        property_id: property_id,
                        room_id: room_id,
                        rate_plan_code: rate_plan_code,
                        check_in_date: check_in_date,
                        check_out_date: check_out_date,
                        adult_count: adult_count,
                        number_and_children_ages: number_and_children_ages,
                    };
                    return await this.addHomeRentalDataInCart(
                        dto,
                        userData,
                        Header
                    );
                default:
                    break;
            }
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new NotFoundException(
                `${error.message}&&&id&&&${error.message}`
            );
        }
    }

    async addFlightDataInCart(route_code: string, user: User, Header, referralId, cartIsPromotional, paymentType, paymentFrequency, downpayment, paymentMethod) {
        const flightInfo: any = await this.flightService.airRevalidate(
            { route_code: route_code },
            Header,
            user ? user : null,
            referralId
        );

        if (flightInfo) {

            /* if (flightInfo[0]?.offer_data?.applicable == true && cartIsPromotional == false && referralId) {
                throw new ConflictException(`In cart not-promotional item found`)
            }

            if (flightInfo[0]?.offer_data?.applicable == false && cartIsPromotional == true && referralId) {
                throw new ConflictException(`In cart promotional item found`)
            } */

            /* if ((paymentType == BookingType.INSTALMENT && flightInfo[0].is_installment_available == false) || (paymentType == BookingType.NOINSTALMENT && flightInfo[0].is_installment_available == true)) {
                throw new NotAcceptableException(`Cart payment type and inventory payment type are mismatch`)
            } */
            const depatureDate = flightInfo[0].departure_date;

            const formatedDepatureDate = DateTime.convertDateFormat(
                depatureDate,
                "DD/MM/YYYY",
                "YYYY-MM-DD"
            );

            const diffrence = moment(formatedDepatureDate).diff(
                moment(new Date()),
                "days"
            );

            const dayAfterDay = new Date();
            dayAfterDay.setDate(dayAfterDay.getDate() + 2);

            const cart = new Cart();

            if (user.roleId != Role.GUEST_USER) {
                cart.userId = user.userId;
            } else {
                cart.guestUserId = user.userId;
            }

            var unixTimestamp = Math.round(new Date().getTime() / 1000);

            cart.moduleId = ModulesName.FLIGHT;

            cart.timeStamp = unixTimestamp || 0
            cart.moduleInfo = flightInfo;
            cart.isPromotional = flightInfo[0]?.offer_data?.applicable == true ? true : false
            cart.offerFrom = referralId
            cart.oldModuleInfo = flightInfo;
            cart.expiryDate = new Date(formatedDepatureDate);
            // diffrence > 2
            //     ? new Date(dayAfterDay)
            //     : new Date(formatedDepatureDate);
            cart.isDeleted = false;
            cart.createdDate = new Date();
            cart.paymentType = flightInfo[0].is_installment_available ? BookingType.INSTALMENT : BookingType.NOINSTALMENT
            // cart.instalmentType = instalment_type;
            // cart.paymentType = payment_type
            cart.paymentMethod = paymentMethod;
            cart.paymentFrequency = paymentFrequency || "";
            cart.downpayment = downpayment || 0;

            let savedCart = await cart.save();

            // for await (const traveler of travelers) {
            //     let cartTraveler = new CartTravelers()
            //     cartTraveler.cartId = savedCart.id
            //     cartTraveler.userId = traveler.traveler_id
            //     await cartTraveler.save();
            // }

            return {
                message: `Flight added to cart`,
                data: savedCart,
            };
        } else {
            throw new NotFoundException(`flight not available`);
        }
    }

    async mapGuestUser(guestUserId, user: User) {
        try {
            if (!uuidValidator(guestUserId)) {
                throw new NotFoundException(
                    `Please enter guest user id &&&user_id&&&${errorMessage}`
                );
            }
            var tDate = new Date();

            var todayDate = tDate.toISOString().split(" ")[0];
            todayDate = todayDate
                .replace(/T/, " ") // replace T with a space
                .replace(/\..+/, "");

            let postCart = await getConnection()
                .createQueryBuilder(Cart, "cart")
                .select(["cart.id"])
                .where(
                    `(DATE("cart"."expiry_date") < DATE('${todayDate}') )  AND (("cart"."guest_user_id" = '${guestUserId}') OR ("cart"."user_id" = '${user.userId}')) `
                )
                .orderBy(`id`, "ASC")
                .getMany();

            let ids = [];
            if (postCart.length) {
                for await (const cart of postCart) {
                    ids.push(cart.id);
                }

                await getConnection()
                    .createQueryBuilder()
                    .delete()
                    .from(CartTravelers)
                    .where(`"cart_id" in (:...cartIds)`, {
                        cartIds: ids,
                    })
                    .execute();

                await getConnection()
                    .createQueryBuilder()
                    .delete()
                    .from(Cart)
                    .where(
                        `(DATE("cart"."expiry_date") < DATE('${todayDate}') )  AND (("cart"."guest_user_id" = '${guestUserId}') OR ("cart"."user_id" = '${user.userId}')) `
                    )
                    .execute();
            }

            // let guestCart = await getConnection()
            //     .createQueryBuilder(Cart, "cart")
            //     .where("guest_user_id =:id", { id: guestUserId })
            //     .getMany();
            // let guestlowestCart = guestCart[0]
            // if (guestCart.length) {
            //     for await (const cart of guestCart) {
            //         let cartTraveler = await getConnection()
            //             .createQueryBuilder(CartTravelers, "traveler")
            //             .where("cart_id =:id", {
            //                 id: cart.id,
            //             })
            //             .orderBy(`id`, "ASC")
            //             .getOne();

            //         if (cartTraveler && cartTraveler.userId != user.userId) {
            //             await getConnection()
            //                 .createQueryBuilder()
            //                 .update(User)
            //                 //.set({ createdBy: user.userId, parentGuestUserId: null , email : user.email })
            //                 .set({
            //                     email: user.email || null,
            //                 })
            //                 .where("user_id =:id", {
            //                     id: cartTraveler.userId,
            //                 })
            //                 .execute();
            //         }
            //     }
            // }

            // let userCart = await getConnection()
            //     .createQueryBuilder(Cart, "cart")
            //     .where(`"cart"."user_id" = '${user.userId}'`)
            //     .getMany();
            // let userlowestCart = userCart[0]

            // let promotional = 0
            // let nonPromotional = 0
            // let promotionalItem = []
            // let nonPromotionalItem = []
            // for (let index = 0; index < guestCart.length; index++) {
            //     const cart = guestCart[index];

            //     if (cart.isPromotional == true) {
            //         promotional++
            //         promotionalItem.push(cart.id)
            //     } else {
            //         nonPromotional++
            //         nonPromotionalItem.push(cart.id)
            //     }
            // }

            // for (let index = 0; index < userCart.length; index++) {
            //     const cart = userCart[index];

            //     if (cart.isPromotional == true) {
            //         promotional++
            //         promotionalItem.push(cart.id)
            //     } else {
            //         nonPromotional++
            //         nonPromotionalItem.push(cart.id)
            //     }
            // }

            // for (let index = 0; index < guestCart.length; index++) {
            //     const cart = guestCart[index];

            //     if (cart.isPromotional == true) {
            //         promotional++
            //         promotionalItem.push(cart.id)
            //     } else {
            //         nonPromotional++
            //         nonPromotionalItem.push(cart.id)
            //     }
            // }
            // let deleteCartIds = []
            // if (promotional > 0 && nonPromotional > 0) {
            //     let lowestCart = guestlowestCart.id > userlowestCart.id ? userlowestCart : guestlowestCart

            //     deleteCartIds = lowestCart.isPromotional == true ? nonPromotionalItem : promotionalItem

            //     if (deleteCartIds.length) {
            //         await getConnection()
            //             .createQueryBuilder()
            //             .delete()
            //             .from(CartTravelers)
            //             .where(`"cart_id" in (:...cartIds)`, {
            //                 cartIds: deleteCartIds,
            //             })
            //             .execute();
            //         await getConnection()
            //             .createQueryBuilder()
            //             .delete()
            //             .from(Cart)
            //             .where(`"id" in (:...cartIds)`, {
            //                 cartIds: deleteCartIds,
            //             })
            //             .execute();
            //     }


            // }



            let userDefaultCard = await getConnection()
                .createQueryBuilder(UserCard, "card")
                .where(`is_default = true AND user_id = '${user.userId}'`)
                .getCount;
            let whr = {
                userId: user.userId,
                guestUserId: null,
            };
            if (userDefaultCard) {
                whr["isDefault"] = false;
            }

            await getConnection()
                .createQueryBuilder()
                .update(UserCard)
                .set(whr)
                .where("guest_user_id =:id", { id: guestUserId })
                .execute();

            await getConnection()
                .createQueryBuilder()
                .update(User)
                //.set({ createdBy: user.userId, parentGuestUserId: null , email : user.email })
                .set({ createdBy: user.userId, parentGuestUserId: null })
                .where("parent_guest_user_id =:id", { id: guestUserId })
                .execute();

            await getConnection()
                .createQueryBuilder()
                .update(User)
                .set({ updatedBy: user.userId, parentGuestUserId: null })
                .where("updated_by =:id", { id: guestUserId })
                .execute();

            await getConnection()
                .createQueryBuilder()
                .update(SearchLog)
                .set({ userId: user.userId })
                .where("user_id =:id", { id: guestUserId })
                .execute();

            const result = await getConnection()
                .createQueryBuilder()
                .update(Cart)
                .set({ userId: user.userId, guestUserId: null })
                .where("guest_user_id =:id", { id: guestUserId })
                .execute();
            //console.log(result);
            await getConnection()
                .createQueryBuilder()
                .delete()
                .from(User)
                .where(`"user_id" = '${guestUserId}'`)
                .execute();
            let where = `("cart"."is_deleted" = false) AND ("cart"."user_id" = '${user.userId}') AND ("cart"."module_id" = '${ModulesName.FLIGHT}')`;

            let [query, count] = await getConnection()
                .createQueryBuilder(Cart, "cart")
                .where(where)
                .skip(10)
                .getManyAndCount();
            let cartOverLimit = false;
            if (count > 10) {
                cartOverLimit = true;
                let cartIds = [];
                if (query.length) {
                    for await (const dcart of query) {
                        cartIds.push(dcart.id);
                    }
                    await getConnection()
                        .createQueryBuilder()
                        .delete()
                        .from(CartTravelers)
                        .where(`"cart_id" in (:...cartIds)`, {
                            cartIds,
                        })
                        .execute();
                    await getConnection()
                        .createQueryBuilder()
                        .delete()
                        .from(Cart)
                        .where(`"id" in (:...cartIds)`, {
                            cartIds,
                        })
                        .execute();
                }
            }
            return {
                message: `Guest user cart successfully maped `,
                cartOverLimit,
            };
        } catch (error) {
            if (typeof error.response !== "undefined") {
                //console.log("m");
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }

            throw new NotFoundException(
                `${error.message}&&&id&&&${error.message}`
            );
        }
    }

    async updateCart(updateCartDto: UpdateCartDto, user) {
        try {
            const { cart_id, travelers } = updateCartDto;

            let where;
            if (user.roleId != Role.GUEST_USER) {
                where = `("cart"."is_deleted" = false) AND ("cart"."user_id" = '${user.user_id}') AND ("cart"."id" = '${cart_id}') `;
            } else {
                if (!uuidValidator(user.user_id)) {
                    throw new NotFoundException(
                        `Please enter guest user id &&&user_id&&&${errorMessage}`
                    );
                }
                where = `("cart"."is_deleted" = false) AND ("cart"."guest_user_id" = '${user.user_id}') AND ("cart"."id" = '${cart_id}') `;
            }

            let query = getConnection()
                .createQueryBuilder(Cart, "cart")
                .where(where);
            const result = await query.getOne();

            if (!result) {
                throw new BadRequestException(`Given cart item not found.`);
            }
            await getConnection()
                .createQueryBuilder()
                .delete()
                .from(CartTravelers)
                .where(`"cart_id" = '${result.id}'`)
                .execute();
            let isPrimaryCount = 0;
            for (let index = 0; index < travelers.length; index++) {
                const element = travelers[index];
                if (!uuidValidator(element.traveler_id)) {
                    throw new NotFoundException(
                        "Traveler id not found please change it"
                    );
                }

                for (let i = 0; i < travelers.length; i++) {
                    const traveler = travelers[i];
                    if (
                        i != index &&
                        element.traveler_id == traveler.traveler_id
                    ) {
                        throw new ConflictException(
                            `Dublicate traveler found in list. please change it.`
                        );
                    }
                }
                if (element?.is_primary_traveler == true) {
                    isPrimaryCount++;
                }
            }

            // if(isPrimaryCount == 0){
            //     throw new BadRequestException(`Please select primary traveler.`)
            // }else if(isPrimaryCount > 1){
            //     throw new BadRequestException(`Please select 1 primary traveler.`)
            // }
            let travelerNo = 0;
            for await (const traveler of travelers) {
                let cartTraveler = new CartTravelers();
                cartTraveler.cartId = result.id;
                cartTraveler.userId = traveler.traveler_id;
                cartTraveler.isPrimary = travelerNo == 0 ? true : false;

                cartTraveler.baggageServiceCode = traveler.baggage_service_code;
                travelerNo++;
                await cartTraveler.save();
            }

            return {
                message: `Cart item updated successfully`,
            };
        } catch (error) {
            if (typeof error.response !== "undefined") {
                //console.log("m");
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new NotFoundException(
                `${error.message}&&&id&&&${error.message}`
            );
        }
    }

    async addHomeRentalDataInCart(dto, user, Header) {
        let homeInfo = await this.vacationService.homeRentalRevalidate(
            dto,
            user,
            Header
        );
        // //console.log(homeInfo);
        if (homeInfo) {
            const check_in_date = homeInfo[0].check_in_date;

            const formatedCheckinDate = check_in_date;

            const diffrence = moment(formatedCheckinDate).diff(
                moment(new Date()),
                "days"
            );

            const dayAfterDay = new Date();
            dayAfterDay.setDate(dayAfterDay.getDate() + 2);

            const cart = new Cart();

            cart.userId = user.userId;
            cart.moduleId = ModulesName.VACATION_RENTEL;
            cart.moduleInfo = homeInfo;
            cart.expiryDate =
                diffrence > 2
                    ? new Date(dayAfterDay)
                    : new Date(formatedCheckinDate);
            cart.isDeleted = false;
            cart.createdDate = new Date();

            await cart.save();

            return {
                message: `Home Rental added to cart`,
            };
        }
    }

    async listCart(dto: ListCartDto, user, headers, referralId) {
        try {
            const { live_availiblity } = dto;
            var tDate = new Date();

            var todayDate = tDate.toISOString().split(" ")[0];
            todayDate = todayDate
                .replace(/T/, " ") // replace T with a space
                .replace(/\..+/, "");

            let where = `(DATE("cart"."expiry_date") >= DATE('${todayDate}') )  AND ("cart"."is_deleted" = false) AND ("cart"."user_id" = '${user.user_id}') AND ("cart"."module_id" = '${ModulesName.FLIGHT}' OR "cart"."module_id" = '${ModulesName.HOTEL}')`;
            if (user.roleId == Role.GUEST_USER) {
                if (!uuidValidator(user.user_id)) {
                    throw new NotFoundException(
                        `Please enter guest user id &&&user_id&&&${errorMessage}`
                    );
                }
                where = `(DATE("cart"."expiry_date") >= DATE('${todayDate}') )  AND ("cart"."is_deleted" = false) AND ("cart"."guest_user_id" = '${user.user_id}') AND ("cart"."module_id" = '${ModulesName.FLIGHT}' OR "cart"."module_id" = '${ModulesName.HOTEL}')`;
            }
            let query = getConnection()
                .createQueryBuilder(Cart, "cart")
                .leftJoinAndSelect("cart.module", "module")
                .leftJoinAndSelect("cart.travelers", "travelers")
                .where(where)
                .orderBy(`cart.id`, "ASC")
                .limit(10);
            const [result, count] = await query.getManyAndCount();

            if (!result.length) {
                throw new NotFoundException(`Cart is empty`);
            }

            let error = ''
            let promotional = 0
            let nonPromotional = 0
            let promotionalItem = []
            let nonPromotionalItem = []
            let cartIsConflicted = false
            let paymentType = 0
            let is_payment_plan_conflict = false
            for (let index = 0; index < result.length; index++) {
                const cart = result[index];

                if (cart.isPromotional == true) {
                    promotional++
                    promotionalItem.push(cart.id)
                } else {
                    nonPromotional++
                    nonPromotionalItem.push(cart.id)
                }

                if (paymentType == 0) {
                    paymentType = cart.paymentType
                } else if (paymentType != cart.paymentType) {
                    if (cart.paymentType == BookingType.NOINSTALMENT) {
                        paymentType = BookingType.NOINSTALMENT
                    }
                    //is_payment_plan_conflict = true
                }
            }

            if (promotional > 0 && nonPromotional > 0) {
                error = `In cart promotional and not promotional both inventry found.`
                //cartIsConflicted = true
            }

            let cartIsPromotional
            if (promotional > 0) {
                cartIsPromotional = true
            } else if (nonPromotional > 0) {
                cartIsPromotional = false
            }
            let responce = [];
            var flightRequest = [];
            let flightResponse = [];

            var unixTimestamp = Math.round(new Date().getTime() / 1000);



            if (
                typeof live_availiblity != "undefined" &&
                live_availiblity == "yes"
            ) {
                await this.flightService.validateHeaders(headers);

                const mystifly = new Strategy(
                    new Mystifly(headers, this.cacheManager)
                );

                var resultIndex = 0;

                const mystiflyConfig = await new Promise((resolve) =>
                    resolve(mystifly.getMystiflyCredential())
                );

                const sessionToken = await new Promise((resolve) =>
                    resolve(mystifly.startSession())
                );

                let module = await getConnection()
                    .createQueryBuilder(Module, "module")
                    .where("module.name = :name", { name: "flight" })
                    .getOne();

                if (!module) {
                    throw new InternalServerErrorException(
                        `Flight module is not configured in database&&&module&&&${errorMessage}`
                    );
                }

                const currencyDetails = await Generic.getAmountTocurrency(
                    headers.currency
                );
                for await (const cart of result) {
                    if (cart.moduleId == ModulesName.FLIGHT) {
                        var difference = unixTimestamp - (cart.timeStamp || 0);

                        var minuteDifference = Math.floor(difference / 60) % 60;
                        if (minuteDifference > 5 || (cartIsPromotional == false && referralId) || (cartIsPromotional == true && !referralId)) {
                            const bookingType =
                                cart.moduleInfo[0].routes.length > 1
                                    ? "RoundTrip"
                                    : "oneway";

                            if (bookingType == "oneway") {
                                let dto = {
                                    source_location:
                                        cart.moduleInfo[0].departure_code,
                                    destination_location:
                                        cart.moduleInfo[0].arrival_code,
                                    departure_date: await this.flightService.changeDateFormat(
                                        cart.moduleInfo[0].departure_date
                                    ),
                                    flight_class:
                                        cart.moduleInfo[0].routes[0].stops[0]
                                            .cabin_class,
                                    adult_count: cart.moduleInfo[0].adult_count
                                        ? cart.moduleInfo[0].adult_count
                                        : 0,
                                    child_count: cart.moduleInfo[0].child_count
                                        ? cart.moduleInfo[0].child_count
                                        : 0,
                                    infant_count: cart.moduleInfo[0].infant_count
                                        ? cart.moduleInfo[0].infant_count
                                        : 0,
                                };
                                //console.log(dto);

                                flightRequest[cart.id] = new Promise((resolve) =>
                                    resolve(
                                        mystifly.oneWaySearchZip(
                                            dto,
                                            user,
                                            mystiflyConfig,
                                            sessionToken,
                                            module,
                                            currencyDetails
                                        )
                                    )
                                );
                            } else {
                                let dto = {
                                    source_location:
                                        cart.moduleInfo[0].departure_code,
                                    destination_location:
                                        cart.moduleInfo[0].arrival_code,
                                    departure_date: await this.flightService.changeDateFormat(
                                        cart.moduleInfo[0].departure_date
                                    ),
                                    flight_class:
                                        cart.moduleInfo[0].routes[0].stops[0]
                                            .cabin_class,
                                    adult_count: cart.moduleInfo[0].adult_count
                                        ? cart.moduleInfo[0].adult_count
                                        : 0,
                                    child_count: cart.moduleInfo[0].child_count
                                        ? cart.moduleInfo[0].child_count
                                        : 0,
                                    infant_count: cart.moduleInfo[0].infant_count
                                        ? cart.moduleInfo[0].infant_count
                                        : 0,
                                    arrival_date: await this.flightService.changeDateFormat(
                                        cart.moduleInfo[0].routes[1].stops[0].departure_date
                                    ),
                                };
                                //console.log(dto);
                                flightRequest[cart.id] = new Promise((resolve) =>
                                    resolve(
                                        mystifly.roundTripSearchZip(
                                            dto,
                                            user,
                                            mystiflyConfig,
                                            sessionToken,
                                            module,
                                            currencyDetails
                                        )
                                    )
                                );
                            }
                        }
                    }

                    resultIndex++;
                }
                flightResponse = await Promise.all(flightRequest);
            }

            for (let index = 0; index < result.length; index++) {
                const cart = result[index];
                
                let newCart = {};

                var difference = unixTimestamp - (cart.timeStamp || 0);
                var minuteDifference = Math.floor(difference / 60) % 60;

                if (
                    (typeof live_availiblity != "undefined" &&
                        live_availiblity == "yes" && minuteDifference > 5) || (cartIsPromotional == false && referralId) || (cartIsPromotional == true && !referralId)
                ) {
                    if (cart.moduleId == ModulesName.FLIGHT) {
                        
                        const value = await this.flightAvailiblity(
                            cart,
                            flightResponse[cart.id],
                            user, headers,
                            cartIsPromotional ? referralId : ''
                        );


                        if (typeof value.message == "undefined") {
                            newCart["moduleInfo"] = [value];
                            let updatedDownpayment = 0;

                            if(cart.paymentMethod === PaymentType.INSTALMENT) {
                                
                                if(value.offer_data.applicable) {
                                    updatedDownpayment = cart.downpayment;
                                } else {
                                    if(cart.paymentFrequency === "weekly") {
                                        updatedDownpayment = value.payment_object.weekly.down_payment;
                                    } else if(cart.paymentFrequency === "biweekly") {
                                        updatedDownpayment = value.payment_object.biweekly.down_payment;
                                    } else if(cart.paymentFrequency === "monthly") {
                                        updatedDownpayment = value.payment_object.monthly.down_payment;
                                    }
                                }
                            }
                            newCart["is_available"] = true;
                            newCart["isPromotional"] = value?.offer_data?.applicable
                            newCart["is_conflict"] = false;

                            if (value?.offer_data?.applicable == true && cartIsPromotional == false) {
                                error = `In cart not-promotional item found`
                                if (cartIsConflicted) {
                                    newCart["is_conflict"] = true;
                                } else {
                                    newCart["is_available"] = false;
                                }

                            }

                            // if ((paymentType == BookingType.INSTALMENT && value?.is_installment_available == false) || (paymentType == BookingType.NOINSTALMENT && value?.is_installment_available == true)) {
                            //     newCart["is_payment_type_conflicted"] = true;
                            // }

                            if (value?.offer_data?.applicable == false && cartIsPromotional == true) {
                                error = `In cart promotional item found`
                                if (cartIsConflicted) {
                                    newCart["is_conflict"] = true;
                                } else {
                                    newCart["is_available"] = false;
                                }
                                // newCart["is_available"] = false;
                            }
                            cart.moduleInfo = [value];
                            let inventryIsPromotional = false
                            if (cart.isPromotional == true && referralId) {
                                inventryIsPromotional = value?.offer_data?.applicable == true ? true : false
                                newCart["isPromotional"] == inventryIsPromotional
                            }
                            await getConnection()
                                .createQueryBuilder()
                                .update(Cart)
                                .set({ moduleInfo: [value], timeStamp: Math.round(new Date().getTime() / 1000), isPromotional: inventryIsPromotional, offerFrom: referralId, downpayment: updatedDownpayment })
                                .where("id = :id", { id: cart.id })
                                .execute();

                            //await cart.save();
                        } else {
                            newCart["is_available"] = false;
                            newCart["moduleInfo"] = cart.moduleInfo;
                        }
                    } else if (cart.moduleId == ModulesName.HOTEL) {
                        const moduleInfo: any = cart.moduleInfo;
                        const oldModuleInfo: any = cart.oldModuleInfo;
                        if (oldModuleInfo[0].bundle) {
                            let roomDetails;
                            try {
                                roomDetails = await this.hotelService.availability(
                                    {
                                        room_ppn: oldModuleInfo[0].bundle,
                                    },
                                    user?.userId || null,
                                    cartIsPromotional ? referralId : ''
                                );
                            } catch (error) {
                                newCart["is_available"] = false;
                                newCart["moduleInfo"] = cart.moduleInfo;
                                newCart["error"] = error?.message;
                            }
                            if (roomDetails?.data) {
                                newCart["moduleInfo"] = roomDetails.data;
                                let updatedDownpayment = 0;
                                if(cart.paymentMethod === PaymentType.INSTALMENT) {
                                    //console.log("roomDetails.data[][0]",roomDetails.data["items"][0])
                                    if(roomDetails.data["items"][0].is_refundable=='false'){
                                        updatedDownpayment = (roomDetails.data["items"][0].selling.total*60)/100;
                                        
                                    }
                                    else if(roomDetails.data["items"][0]?.offer_data?.applicable){
                                        updatedDownpayment = cart.downpayment;
                                    } else {
                                        if(cart.paymentFrequency === "weekly") {
                                            updatedDownpayment = roomDetails.data.items[0].payment_object.weekly.down_payment;
                                        } else if(cart.paymentFrequency === "biweekly") {
                                            updatedDownpayment = roomDetails.data.items[0].payment_object.biweekly.down_payment;
                                        } else if(cart.paymentFrequency === "monthly") {
                                            updatedDownpayment = roomDetails.data.items[0].payment_object.monthly.down_payment;
                                        }
                                    }
                                    console.log("===updatedDownpayment====",updatedDownpayment)
                                }
                                newCart["is_available"] = true;
                                newCart["isPromotional"] = roomDetails.data["items"][0]?.offer_data?.applicable
                                newCart["is_conflict"] = false;
                                if (roomDetails.data["items"][0]?.offer_data?.applicable == true && cartIsPromotional == false) {
                                    //throw new ConflictException(`In cart not-promotional item found`)
                                    error = `In cart not-promotional item found`
                                    if (cartIsConflicted) {
                                        newCart["is_conflict"] = true;
                                    } else {
                                        newCart["is_available"] = false;
                                    }

                                }

                                

                                if (roomDetails.data["items"][0]?.offer_data?.applicable == false && cartIsPromotional == true) {
                                    error = `In cart promotional item found`
                                    if (cartIsConflicted) {
                                        newCart["is_conflict"] = true;
                                    } else {
                                        newCart["is_available"] = false;
                                    }

                                }


                                cart.moduleInfo = roomDetails;
                                let inventryIsPromotional = false
                                if (cart.isPromotional == true && referralId) {
                                    inventryIsPromotional = roomDetails.data["items"][0]?.offer_data?.applicable == true ? true : false
                                    newCart["isPromotional"] == inventryIsPromotional
                                }
                                await getConnection()
                                    .createQueryBuilder()
                                    .update(Cart)
                                    .set({ moduleInfo: roomDetails.data, timeStamp: Math.round(new Date().getTime() / 1000), isPromotional: inventryIsPromotional, offerFrom: referralId, downpayment: updatedDownpayment })
                                    .where("id = :id", { id: cart.id })
                                    .execute();
                            } else {
                                newCart["is_available"] = false;
                                newCart["moduleInfo"] = cart.moduleInfo;
                            }
                        } else {
                            newCart["is_available"] = false;
                            newCart["moduleInfo"] = cart.moduleInfo;
                        }
                    }
                } else {
                    newCart["moduleInfo"] = cart.moduleInfo;
                    if ((paymentType == BookingType.INSTALMENT && cart.moduleInfo[0]?.is_installment_available == false) || (paymentType == BookingType.NOINSTALMENT && cart.moduleInfo[0]?.is_installment_available == true)) {
                        newCart["/"] = true;
                    }
                    if (cart.moduleId == ModulesName.FLIGHT) {
                        newCart["is_available"] = true;
                        newCart["is_conflict"] = false;
                        if (cart.moduleInfo[0]?.offer_data?.applicable == true && cartIsPromotional == false) {
                            error = `In cart not-promotional item found`
                            if (cartIsConflicted) {
                                newCart["is_conflict"] = true;
                            } else {
                                newCart["is_available"] = false;
                            }

                        }

                        if (cart.moduleInfo[0]?.offer_data?.applicable == false && cartIsPromotional == true) {
                            error = `In cart promotional item found`
                            if (cartIsConflicted) {
                                newCart["is_conflict"] = true;
                            } else {
                                newCart["is_available"] = false;
                            }
                            // newCart["is_available"] = false;
                        }


                    }
                    if (cart.moduleId == ModulesName.HOTEL) {
                        newCart["is_available"] = true;
                        newCart["is_conflict"] = false;
                        if (cart.moduleInfo[0]?.offer_data?.applicable == true && cartIsPromotional == false) {
                            //throw new ConflictException(`In cart not-promotional item found`)
                            error = `In cart not-promotional item found`
                            if (cartIsConflicted) {
                                newCart["is_conflict"] = true;
                            } else {
                                newCart["is_available"] = false;
                            }

                        }

                        if (cart.moduleInfo[0]?.offer_data?.applicable == false && cartIsPromotional == true) {
                            error = `In cart promotional item found`
                            if (cartIsConflicted) {
                                newCart["is_conflict"] = true;
                            } else {
                                newCart["is_available"] = false;
                            }

                        }

                    }
                }
                if (cart.travelers.length) {
                    cart.travelers.sort((a, b) => a.id - b.id);
                }
                newCart["oldModuleInfo"] = cart.oldModuleInfo || {};
                newCart["id"] = cart.id;
                newCart["userId"] = cart.userId;
                newCart["guestUserId"] = cart.guestUserId;
                newCart["moduleId"] = cart.moduleId;
                newCart["expiryDate"] = cart.expiryDate;
                newCart["isDeleted"] = cart.isDeleted;
                newCart["createdDate"] = cart.createdDate;
                newCart["type"] = cart.module.name;
                newCart["travelers"] = cart.travelers;
                newCart["paymentMethod"] = cart.paymentMethod;
                newCart["downpayment"] = cart.downpayment;
                newCart["paymentFrequency"] = cart.paymentFrequency;
                responce.push(newCart);
            }
            let priceSummary = await Generic.calculatePriceSummary(responce);
            
            
            return {
                data: responce,
                count: count,
                cartIsPromotional,
                error,
                is_payment_plan_conflict,
                cart_payment_type: paymentType,
                price_summary : priceSummary
            };
        } catch (error) {
            if (typeof error.response !== "undefined") {
                //console.log("m");
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new NotFoundException(
                `${error.message}&&&id&&&${error.message}`
            );
        }
    }

    async flightAvailiblity(cart, flights, user, headers, referralId) {

        var match = 0;

        if (flights?.items) {

            for await (const flight of flights.items) {

                if (flight?.unique_code == cart.moduleInfo[0].unique_code) {
                    match = match + 1;
                    let revalidateFlight: any
                    try {
                        let routeIdDto = {
                            route_code: flight.route_code
                        }
                        let data = await this.flightService.airRevalidate(routeIdDto, headers, user, referralId)
                        revalidateFlight = data[0]
                    } catch (e) {

                        revalidateFlight = {
                            message: `Flight not air-revalidate`
                        }

                    }
                    //console.log('revalidateFlight', revalidateFlight)
                    return revalidateFlight;
                }
            }
        }
        ////console.log('loop empty');

        if (match == 0) {
            ////console.log('match not found');
            return {
                message:
                    "This booking is no longer available. Click “X” to delete to be able to proceed to Checkout.",
            };
            //throw new NotFoundException(`Flight is not available`)
        }
    }

    async deleteFromCart(id: number, user) {
        try {
            let where = `("cart"."is_deleted" = false) AND ("cart"."user_id" = '${user?.user_id}') AND ("cart"."id" = ${id})`;
            if (user.roleId == Role.GUEST_USER) {
                if (!uuidValidator(user.user_id)) {
                    throw new NotFoundException(
                        `Please enter guest user id &&&user_id&&&${errorMessage}`
                    );
                }
                where = `("cart"."is_deleted" = false) AND ("cart"."guest_user_id" = '${user.user_id}') AND ("cart"."id" = ${id})`;
            }

            let query = getConnection()
                .createQueryBuilder(Cart, "cart")
                .where(where);

            const cartItem = await query.getOne();

            if (!cartItem) {
                throw new NotFoundException(`Given item not found`);
            }
            await getConnection()
                .createQueryBuilder()
                .delete()
                .from(CartTravelers)
                .where(`"cart_id" = '${id}'`)
                .execute();
            await getConnection()
                .createQueryBuilder()
                .delete()
                .from(Cart)
                .where(`"id" = '${id}'`)
                .execute();


            return {
                message: `Item removed successfully`,
            };
        } catch (error) {
            throw new BadRequestException(error.response.message);
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new NotFoundException(
                `${error.message}&&&id&&&${error.message}`
            );
        }
    }

    async multipleInventryDeleteFromCart(dto: MultipleInventryDeleteFromCartDto, user) {
        const { id } = dto
        try {
            if (!id.length) {
                throw new BadRequestException(`Please enter valid id.`);
            }
            let where = `("cart"."is_deleted" = false) AND ("cart"."user_id" = '${user?.user_id}') AND ("cart"."id" In (:...id))`;
            if (user.roleId == Role.GUEST_USER) {
                if (!uuidValidator(user.user_id)) {
                    throw new NotFoundException(
                        `Please enter guest user id &&&user_id&&&${errorMessage}`
                    );
                }
                where = `("cart"."is_deleted" = false) AND ("cart"."guest_user_id" = '${user.user_id}') AND ("cart"."id" In (:...id))`;
            }



            let query = getConnection()
                .createQueryBuilder(Cart, "cart")
                .where(where, { id });

            const cartItem = await query.getOne();

            if (!cartItem) {
                throw new NotFoundException(`Given item not found`);
            }
            await getConnection()
                .createQueryBuilder()
                .delete()
                .from(CartTravelers)
                .where(`"id" In (:...id)`, { id })
                .execute();
            await getConnection()
                .createQueryBuilder()
                .delete()
                .from(Cart)
                .where(`"id" In (:...id)`, { id })
                .execute();

            return {
                message: `Item removed successfully`,
            };
        } catch (error) {
            if (typeof error.response !== "undefined") {
                //console.log("m");
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new NotFoundException(
                `${error.message}&&&id&&&${error.message}`
            );
        }
    }

    async bookCart(bookCart: CartBookDto, user: User, Headers, referralId) {
        let logData = new BookingLog
        logData.id = uuidv4()
        logData.paymentAuthorizeLog = bookCart.auth_url
        logData.timeStamp = Math.round(new Date().getTime() / 1000)
        const bookingLog = await logData.save()
        try {
            const {
                payment_type,
                laycredit_points,
                card_token,
                instalment_type,
                additional_amount,
                booking_through,
                cart,
                selected_down_payment,
                transaction_token,

                auth_url
            } = bookCart;
            let referral_id = referralId
            if (cart.length > 10) {
                throw new BadRequestException(
                    `10 item cart maximum, please Checkout and start another Cart if you require
                    more than 10.`
                );
            }


            let cartIds: number[] = [];
            for await (const i of cart) {
                cartIds.push(i.cart_id);
            }

            let query = getConnection()
                .createQueryBuilder(Cart, "cart")
                .leftJoinAndSelect("cart.module", "module")
                .leftJoinAndSelect("cart.travelers", "travelers")
                .leftJoinAndSelect("travelers.userData", "userData")
                .leftJoinAndSelect("cart.user", "User")
                .select([
                    "cart",
                    "module.id",
                    "module.name",
                    "travelers.id",
                    "travelers.baggageServiceCode",
                    "travelers.userId",
                    "travelers.isPrimary",
                    "travelers.traveler",
                    "userData.roleId",
                    "userData.email",
                    "userData.firstName",
                    "userData.middleName",
                    "cart.oldModuleInfo",
                    "User.userId",
                    "User.referralId"
                ])

                .where(
                    `("cart"."is_deleted" = false) AND ("cart"."user_id" = '${user.userId}') AND ("cart"."module_id" In (${ModulesName.FLIGHT},${ModulesName.HOTEL})) AND ("cart"."id" IN (${cartIds}))`
                )
                .orderBy(`cart.id`, "DESC")
                .limit(10);
            const [result, count] = await query.getManyAndCount();
            
            if (!result.length) {
                throw new BadRequestException(
                    `Cart is empty.&&&cart&&&${errorMessage}`
                );
            }
            bookingLog.cartInfo = result
            let smallestDate = "";
            let largestDate = "";

            let promotional = 0
            let nonPromotional = 0
            let promotionalItem = []
            let nonPromotionalItem = []
            for (let index = 0; index < result.length; index++) {
                const item = result[index];

                if (item.isPromotional == true) {
                    promotional++
                    promotionalItem.push(item.id)
                } else {
                    nonPromotional++
                    nonPromotionalItem.push(item.id)
                }
            }

            if (promotional > 0 && nonPromotional > 0) {
                throw new ConflictException(`In cart promotional and not promotional both inventry found.`)
            }

            let cartIsPromotional
            if (promotional > 0) {
                cartIsPromotional = true
            } else if (nonPromotional > 0) {
                cartIsPromotional = false
            }

            //let ToatalAmount = ''
            for await (const item of result) {

                if(item.paymentMethod=='instalment'){
                    if (item.moduleId == ModulesName.FLIGHT) {
                        const dipatureDate = await this.flightService.changeDateFormat(
                            item.moduleInfo[0].departure_date
                        );
                        if (smallestDate == "") {
                            smallestDate = dipatureDate;
                        } else if (
                            new Date(smallestDate) > new Date(dipatureDate)
                        ) {
                            smallestDate = dipatureDate;
                        }
                        //console.log(item.moduleInfo[0]);

                        const arrivalDate = await this.flightService.changeDateFormat(
                            item.moduleInfo[0].arrival_date
                        );
                        if (largestDate == "") {
                            largestDate = arrivalDate;
                        } else if (new Date(largestDate) > new Date(arrivalDate)) {
                            largestDate = arrivalDate;
                        }
                    } else if (item.moduleId == ModulesName.HOTEL) {
                        const dipatureDate = item.moduleInfo[0].input_data.check_in;

                        if (smallestDate == "") {
                            smallestDate = dipatureDate;
                        } else if (
                            new Date(smallestDate) > new Date(dipatureDate)
                        ) {
                            smallestDate = dipatureDate;
                        }
                        //console.log(item.moduleInfo[0]);

                        const arrivalDate = item.moduleInfo[0].input_data.check_out;
                        if (largestDate == "") {
                            largestDate = arrivalDate;
                        } else if (new Date(largestDate) > new Date(arrivalDate)) {
                            largestDate = arrivalDate;
                        }
                    }
                }
            }
            const cartBook = new CartBooking();
            cartBook.id = uuidv4();
            cartBook.laytripCartId = `LTC${uniqid.time().toUpperCase()}`;
            cartBook.bookingDate = new Date();
            cartBook.checkInDate = new Date(smallestDate);
            cartBook.checkOutDate = new Date(largestDate);
            cartBook.userId = user.userId;
            if (referralId) {
                let ref = await this.getReferralId(referralId);
                if (ref?.id) {
                    cartBook.referralId = ref?.id || null;
                }
            }

            let payMode = result.findIndex(res=>res.paymentMethod == PaymentType.INSTALMENT);
            cartBook.bookingType =
                payMode != 1
                    ? BookingType.INSTALMENT
                    : BookingType.NOINSTALMENT;
            cartBook.status == BookingStatus.PENDING;
            let cartData = await cartBook.save();
            bookingLog.cartBookingId = cartData.id
            await bookingLog.save()

            let responce = [];
            let successedResult = 0;
            let failedResult = 0;
            let BookingIds = [];
            let amountToBeCharged=0;
            let flightCount = 0;
            let hotelCount = 0;
            //let mailResponce = []

            const cartCount = result.length;
            let inventryLogs = []
            for await (const item of result) {
                switch (item.moduleId) {
                    case ModulesName.FLIGHT:
                        flightCount++;
                        bookCart.payment_type = item.paymentMethod;
                        bookCart.instalment_type = item.paymentFrequency;
                        
                        let flightResponce = await this.bookFlight(
                            item,
                            user,
                            Headers,
                            bookCart,
                            smallestDate,
                            cartData,
                            cartCount,
                            flightCount,
                            cartIsPromotional,
                            referral_id,
                            item.downpayment
                        );
                        responce.push(flightResponce);
                        inventryLogs.push(flightResponce["logFile"])
                        if (flightResponce["status"] == 1) {
                            successedResult++;
                            if(item.moduleInfo[0].offer_data.applicable) {
                                amountToBeCharged += bookCart.payment_type=='instalment'?Number(item.downpayment):Number(item.moduleInfo[0].discounted_selling_price)
                            } else {
                                amountToBeCharged+=bookCart.payment_type=='instalment'?Number(item.downpayment):Number(item.moduleInfo[0].selling_price);
                            }
                            
                            BookingIds.push(
                                flightResponce["detail"]["laytrip_booking_id"]
                            );
                        } else {
                            failedResult++;
                        }
                        break;

                    case ModulesName.HOTEL:
                        hotelCount++;
                        bookCart.payment_type = item.paymentMethod;
                        bookCart.instalment_type = item.paymentFrequency;
                        let hotelResponce = await this.bookHotel(
                            item,
                            user,
                            Headers,
                            bookCart,
                            smallestDate,
                            cartData,
                            cartCount,
                            hotelCount,
                            referral_id,
                            cartIsPromotional,
                            item.downpayment
                        );
                        responce.push(hotelResponce);
                        inventryLogs.push(hotelResponce["logFile"])
                        if (hotelResponce["status"] == 1) {
                            successedResult++;
                            if(item.moduleInfo[0].offer_data.applicable) {
                                amountToBeCharged += bookCart.payment_type=='instalment'?Number(item.downpayment):Number(item.moduleInfo[0].discounted_total);
                            } else {
                                amountToBeCharged+=bookCart.payment_type=='instalment'?Number(item.downpayment):Number(item.moduleInfo[0].selling.total);
                            }
                            
                            BookingIds.push(
                                hotelResponce["detail"]["laytrip_booking_id"]
                            );
                        } else {
                            failedResult++;
                        }
                        break;

                    default:
                        break;
                }
            }
            bookingLog.cartBookLog = inventryLogs
            await bookingLog.save()
            if (successedResult) {
                let paymentType =
                    bookCart.payment_type == PaymentType.INSTALMENT
                        ? BookingType.INSTALMENT
                        : BookingType.NOINSTALMENT;
                let partialAmount = 0
                if (payment_type == PaymentType.INSTALMENT) {
                    await this.sattelInstalment(cartData.id,
                        instalment_type, smallestDate, selected_down_payment)
                }
                /* if (failedResult > 0) {
                    partialAmount = await this.calculatePartialAmountAndSattelAmount(
                        cartData.id,
                        payment_type
                    );
                } */
                
                const payment = await this.capturePayment(
                    BookingIds,
                    transaction_token,
                    paymentType,
                    user.userId,
                    amountToBeCharged
                );

                let metaData = payment.meta_data
                bookingLog.paymentCaptureLog = payment.logFile
                await bookingLog.save()
                await this.cartBookingEmailSend(
                    cartData.laytripCartId,
                    cartData.userId,
                    referralId,
                    metaData,
                    failedResult
                );

                
            } else {
                const payment = await this.paymentService.voidCard(
                    transaction_token,
                    user.userId
                );
                cartData.status == BookingStatus.FAILED;
                await cartData.save();
            }
            let returnResponce = {};
            returnResponce = cartData;
            returnResponce["carts"] = responce;

            return returnResponce;
        } catch (error) {
            bookingLog.error = error
            await bookingLog.save()
            if (typeof error.response !== "undefined") {
                //console.log("m");
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new NotFoundException(
                `${error.message}&&&id&&&${error.message}`
            );
        }
    }
    async refundCart(
        cartId,
        Headers,
        payment_type,
        instalment_type,
        smallestDate,
        selected_down_payment,
        transactionToken,
        userId
    ) {
        var sumOfTotalAmount = await getConnection().query(`
        SELECT sum("booking"."total_amount") as "total_amount" 
        FROM booking where cart_id = '${cartId}' AND booking_status = ${BookingStatus.FAILED}`);

        let refundAmount = 0;
        const date = new Date();
        var date1 = date.toISOString();
        date1 = date1
            .replace(/T/, " ") // replace T with a space
            .replace(/\..+/, "")
            .split(" ")[0];

        const totalAmount = parseFloat(sumOfTotalAmount[0].total_amount);
        console.log(totalAmount);

        if (payment_type == PaymentType.INSTALMENT) {
            let instalmentDetails;

            let downPayments = [40, 50, 60]
            if (moment(smallestDate).diff(
                moment().format("YYYY-MM-DD"),
                "days"
            ) > 90) {
                downPayments = [20, 30, 40]
            }
            if (instalment_type == InstalmentType.WEEKLY) {
                instalmentDetails = Instalment.weeklyInstalment(
                    totalAmount,
                    smallestDate,
                    date1,
                    downPayments[0],
                    true
                );
            }
            if (instalment_type == InstalmentType.BIWEEKLY) {
                instalmentDetails = Instalment.biWeeklyInstalment(
                    totalAmount,
                    smallestDate,
                    date1,
                    downPayments[0],
                    true
                );
            }
            if (instalment_type == InstalmentType.MONTHLY) {
                instalmentDetails = Instalment.monthlyInstalment(
                    totalAmount,
                    smallestDate,
                    date1,
                    downPayments[0],
                    true
                );
            }

            let firstInstalemntAmount =
                instalmentDetails.instalment_date[0].instalment_amount;

            refundAmount = firstInstalemntAmount;
        } else if (payment_type == PaymentType.NOINSTALMENT) {
            let sellingPrice = totalAmount;

            if (sellingPrice > 0) {
                refundAmount = sellingPrice;
            }
        }

        const valideHeader = await this.flightService.validateHeaders(Headers);

        const refund = await this.paymentService.refund(
            Math.ceil(refundAmount * 100),
            transactionToken,
            valideHeader.currency.code,
            userId
        );

        await getConnection()
            .createQueryBuilder()
            .update(CartBooking)
            .set({ refundPaymentInfo: refund })
            .where(`id = '${cartId}' `)
            .execute();
        return refund.logFile
    }

    async calculatePartialAmountAndSattelAmount(cartId,
        payment_type,
    ) {
        let refundAmount = 0

        let allBooking = await getConnection()
            .createQueryBuilder(Booking, "booking")
            .leftJoinAndSelect(
                "booking.bookingInstalments",
                "BookingInstalments"
            )
            .leftJoinAndSelect("booking.currency2", "currency")
            .where(
                `"booking"."cart_id" = '${cartId}' AND "BookingInstalments"."instalment_no" = 1  AND "booking"."booking_status" IN (${BookingStatus.CONFIRM},${BookingStatus.PENDING})`
            )
            .getMany();
        //console.log(JSON.stringify(allBooking))
        //console.log('payment_type', payment_type, PaymentType.INSTALMENT, payment_type == PaymentType.INSTALMENT)
        if (payment_type == PaymentType.INSTALMENT) {
            //console.log('payment_type', payment_type)
            let captureAmount = 0
            if (allBooking.length) {
                for await (const booking of allBooking) {
                    if (booking?.bookingInstalments?.length) {
                        booking.bookingInstalments.sort((a, b) => a.id - b.id);
                        captureAmount += parseFloat(booking.bookingInstalments[0].amount)
                    }
                }
            }
            refundAmount = captureAmount;

        } else if (payment_type == PaymentType.NOINSTALMENT) {
            let captureAmount = 0
            if (allBooking.length) {
                for await (const booking of allBooking) {
                    captureAmount += parseFloat(booking.totalAmount)
                }
            }
            refundAmount = captureAmount;
        }
        return refundAmount
    }

    async sattelInstalment(cartId, instalment_type,
        smallestDate,
        selected_down_payment) {
        let allBooking = await getConnection()
            .createQueryBuilder(Booking, "booking")
            .leftJoinAndSelect(
                "booking.bookingInstalments",
                "BookingInstalments"
            )
            .leftJoinAndSelect("booking.currency2", "currency")
            .where(
                `"booking"."cart_id" = '${cartId}' AND "booking"."booking_status" IN (${BookingStatus.CONFIRM},${BookingStatus.PENDING})`
            )
            .getMany();


        let downPayment = 0;
        let totalAmount = 0
        let installmentTotal = 0
        let installment = {}
        let onIndexCalcualation = []
        let bookingIds = []
        if (allBooking.length) {
            for await (const booking of allBooking) {
                let installmentAmount = []
                if (booking.bookingInstalments.length) {

                    for await (const installment of booking.bookingInstalments) {
                        if (installment.instalmentNo == 1) {
                            downPayment += parseFloat(installment.amount)
                        }
                        else if (installment.instalmentNo == 2) {
                            installmentTotal += parseFloat(installment.amount)
                        }
                        //console.log('installment.instalmentNo', installment.instalmentNo)
                        installmentAmount[installment.instalmentNo] = parseFloat(installment.amount)
                        totalAmount += parseFloat(installment.amount)
                        onIndexCalcualation[installment.instalmentNo] = onIndexCalcualation[installment.instalmentNo] ? onIndexCalcualation[installment.instalmentNo] + parseFloat(installment.amount) : parseFloat(installment.amount)
                    }
                }
                installment[booking.id] = installmentAmount
                bookingIds.push(booking.id)
            }
            // console.log("downPayment", downPayment)
            // console.log("totalAmount", totalAmount)
            // console.log("installmentTotal", installmentTotal);
            // console.table(onIndexCalcualation)
            // console.log("bookingIds", bookingIds)

            if (installmentTotal < 5) {
                let instalmentDetails;
                const date = new Date();
                var date1 = date.toISOString();
                let downPayments = [40, 50, 60]
                if (moment(smallestDate).diff(
                    moment().format("YYYY-MM-DD"),
                    "days"
                ) > 90) {
                    downPayments = [20, 30, 40]
                }
                //console.log("instalment_type", instalment_type, typeof instalment_type, InstalmentType.WEEKLY, typeof InstalmentType.WEEKLY, InstalmentType.WEEKLY == instalment_type)
                if (instalment_type == InstalmentType.WEEKLY) {
                    console.log('Weekly')
                    instalmentDetails = Instalment.weeklyInstalment(
                        totalAmount,
                        smallestDate,
                        date1,
                        downPayments[0]
                    );
                }
                if (instalment_type == InstalmentType.BIWEEKLY) {
                    instalmentDetails = Instalment.biWeeklyInstalment(
                        totalAmount,
                        smallestDate,
                        date1,
                        downPayments[0]
                    );
                }
                if (instalment_type == InstalmentType.MONTHLY) {
                    instalmentDetails = Instalment.monthlyInstalment(
                        totalAmount,
                        smallestDate,
                        date1,
                        downPayments[0]
                    );
                }
                //console.log("instalmentDetails", instalmentDetails)
                if (instalmentDetails?.instalment_date?.length) {
                    let totalLength = instalmentDetails?.instalment_date?.length

                    for (let index = 1; index < totalLength; index++) {
                        const element = instalmentDetails?.instalment_date[index];
                        for await (const booking of allBooking) {
                            let bookingInstallment = installment[booking.id][index]
                            let cartInstallment = onIndexCalcualation[index]
                            let newSettledInstallment = parseFloat(element.instalment_amount)
                            let percentageOfBookingInstallment = (bookingInstallment * 100) / cartInstallment
                            let settlePercentageBaseAmount = (percentageOfBookingInstallment * newSettledInstallment) / 100

                            // console.log("bookingInstallment", bookingInstallment)
                            // console.log("cartInstallment", cartInstallment)
                            // console.log("newSettledInstallment", newSettledInstallment)
                            // console.log("percentageOfBookingInstallment", percentageOfBookingInstallment)
                            // console.log("settlePercentageBaseAmount", settlePercentageBaseAmount)
                            await getConnection()
                                .createQueryBuilder()
                                .update(BookingInstalments)
                                .set({
                                    amount: settlePercentageBaseAmount.toString()
                                })
                                .where(
                                    `booking_id = '${booking.id}' AND instalment_no = ${index + 1}`
                                )
                                .execute();

                        }
                    }
                    await getConnection()
                        .createQueryBuilder()
                        .delete()
                        .from(BookingInstalments)
                        .where(`"booking_id" in (:...bookingIds) AND instalment_no > ${totalLength}`, {
                            bookingIds,
                        })
                        .execute();
                }
            }
        }
    }
    async capturePayment(
        BookingIds,
        transaction_token,
        payment_type: number,
        userId,
        partialAmount = 0
    ) {
        let captureCardresult = await this.paymentService.captureCard(
            transaction_token,
            userId,
            Math.ceil(partialAmount * 100)
        );

        if (captureCardresult.status == true) {
            if (payment_type == BookingType.INSTALMENT) {
                await getConnection()
                    .createQueryBuilder()
                    .update(BookingInstalments)
                    .set({
                        paymentStatus: PaymentStatus.CONFIRM,
                        paymentInfo: captureCardresult.meta_data,
                        transactionToken: captureCardresult.token,
                        paymentCaptureDate: new Date(),
                        attempt: 1,
                    })
                    .where(
                        `booking_id In (:...BookingIds) AND instalment_status = 1 AND payment_status = ${PaymentStatus.PENDING}`,
                        { BookingIds }
                    )
                    .execute();
                await getConnection()
                    .createQueryBuilder()
                    .update(Booking)
                    .set({
                        paymentInfo: captureCardresult.meta_data,
                    })
                    .where(`id In (:...BookingIds) `, { BookingIds })
                    .execute();
            } else {
                await getConnection()
                    .createQueryBuilder()
                    .update(Booking)
                    .set({
                        paymentStatus: PaymentStatus.CONFIRM,
                        paymentInfo: captureCardresult.meta_data,
                    })
                    .where(`id In (:...BookingIds) `, { BookingIds })
                    .execute();
            }
        }
        return captureCardresult;
    }

    async bookFlight(
        cart: Cart,
        user: User,
        Headers,
        bookCart: CartBookDto,
        smallestDate: string,
        cartData: CartBooking,
        cartCount: number,
        flightCount: number,
        cartIsPromotional,
        referral_id,
        downpayment
    ) {
        let logFile = {}
        let reservationId = `${cartData.laytripCartId}-F${flightCount}`
        const {
            payment_type,
            laycredit_points,
            card_token,
            instalment_type,
            additional_amount,
            booking_through,
            selected_down_payment,
            transaction_token
        } = bookCart;
        const bookingType =
            cart.moduleInfo[0].routes.length > 1 ? "RoundTrip" : "oneway";
        const downPayment = selected_down_payment ? selected_down_payment : 0;
        const paidIn =
            payment_type == PaymentType.INSTALMENT
                ? BookingType.INSTALMENT
                : BookingType.NOINSTALMENT;

        //let flightRequest;
        let value: any = cart.moduleInfo[0]
        let newCart = {};
        newCart["id"] = cart.id;
        newCart["userId"] = cart.userId;
        newCart["moduleId"] = cart.moduleId;
        newCart["isDeleted"] = cart.isDeleted;
        newCart["createdDate"] = cart.createdDate;
        newCart["status"] = BookingStatus.FAILED;
        newCart["type"] = cart.module.name;
        if (typeof value.message == "undefined") {
            let travelers = [];
            if (!cart.travelers.length) {
                newCart["status"] = BookingStatus.FAILED;
                newCart["detail"] = {
                    statusCode: 422,
                    status: BookingStatus.FAILED,
                    message: `Please update traveler details.`,
                };
                await this.saveFailedBooking(
                    cartData.id,
                    cart.moduleInfo,
                    cart.userId,
                    {
                        statusCode: 422,
                        status: BookingStatus.FAILED,
                        message: `Please update traveler details.`,
                    },
                    {
                        bookingType: paidIn,
                        currencyId: 1,
                        booking_through: "web",
                    },
                    cart.moduleId,
                    reservationId
                );
            } else {
                for await (const traveler of cart.travelers) {

                    let countryId = traveler.traveler['countryId'];
                    if(countryId){
                        let countryDetails = await getManager()
                            .createQueryBuilder(Countries, "country")
                            .where(`id=:country_id`, { country_id:countryId })
                            .getOne();
                        traveler.traveler['country']=countryDetails;
                    }
                    let travelerUser = {
                        traveler_id: traveler.traveler['userId'],
                        traveler: traveler.traveler,
                        is_primary_traveler: traveler.traveler['is_primary_traveler'],
                    };
                    
                    //console.log("traveler",traveler,countryId);
                    travelers.push(travelerUser);
                }
                //return false;
                const bookingdto: BookFlightDto = {
                    travelers,
                    payment_type,
                    instalment_type,
                    route_code: value.route_code,
                    additional_amount,
                    laycredit_points,
                    custom_instalment_amount: downpayment,
                    custom_instalment_no: 0,
                    card_token,
                    booking_through,
                    cartCount,
                    reservationId,
                    
                };

                newCart["detail"] = await this.flightService.cartBook(
                    bookingdto,
                    Headers,
                    user,
                    smallestDate,
                    cartData.id,
                    selected_down_payment,
                    transaction_token,
                    cartIsPromotional,
                    referral_id
                );

                logFile[reservationId] = newCart["detail"]['logData']
                newCart["logFile"] = logFile
            }
        } else {
            newCart["detail"] = {
                message: value.message,
            };
            newCart["status"] = BookingStatus.FAILED;
            await this.saveFailedBooking(
                cartData.id,
                cart.moduleInfo,
                cart.userId,
                value,
                {
                    bookingType: paidIn,
                    currencyId: 1,
                    booking_through: "web",
                },
                cart.moduleId,
                reservationId
            );
            return newCart;
        }
        if (!newCart["detail"]["statusCode"] && !newCart["detail"]["error"]) {
            newCart["status"] = BookingStatus.CONFIRM;
            await getConnection()
                .createQueryBuilder()
                .delete()
                .from(CartTravelers)
                .where(`"cart_id" = '${cart.id}'`)
                .execute();
            await getConnection()
                .createQueryBuilder()
                .delete()
                .from(Cart)
                .where(`"id" = '${cart.id}'`)
                .execute();
        } else {
            await this.saveFailedBooking(
                cartData.id,
                cart.moduleInfo,
                cart.userId,
                newCart["detail"],
                {
                    bookingType: paidIn,
                    currencyId: 1,
                    booking_through: "web",
                },
                cart.moduleId,
                reservationId
            );
        }
        return newCart;
    }

    async bookHotel(
        cart: Cart,
        user: User,
        Headers,
        bookCart: CartBookDto,
        smallestDate: string,
        cartData: CartBooking,
        cartCount: number,
        hotelCount,
        referral_id,
        cartIsPromotional,
        downpayment
    ) {
        let logFile = {}
        let reservationId = `${cartData.laytripCartId}-H${hotelCount}`
        const {
            payment_type,
            laycredit_points,
            card_token,
            instalment_type,
            additional_amount,
            booking_through,
            selected_down_payment,
            transaction_token,
        } = bookCart;
        const downPayment = selected_down_payment ? selected_down_payment : 0;
        const paidIn =
            payment_type == PaymentType.INSTALMENT
                ? BookingType.INSTALMENT
                : BookingType.NOINSTALMENT;

        let flightRequest;

        const value = cart.oldModuleInfo;

        let newCart = {};
        newCart["id"] = cart.id;
        newCart["userId"] = cart.userId;
        newCart["moduleId"] = cart.moduleId;
        newCart["isDeleted"] = cart.isDeleted;
        newCart["createdDate"] = cart.createdDate;
        newCart["status"] = BookingStatus.FAILED;
        newCart["type"] = cart.module.name;
        if (value) {
            let travelers = [];
            if (!cart.travelers?.length) {
                newCart["status"] = BookingStatus.FAILED;
                newCart["detail"] = {
                    statusCode: 422,
                    status: BookingStatus.FAILED,
                    message: `Please update traveler details.`,
                };
                await this.saveFailedBooking(
                    cartData.id,
                    cart.moduleInfo,
                    cart.userId,
                    {
                        statusCode: 422,
                        status: BookingStatus.FAILED,
                        message: `Please update traveler details.`,
                    },
                    {
                        bookingType: paidIn,
                        currencyId: 1,
                        booking_through: "web",
                    },
                    cart.moduleId,
                    reservationId
                );
            } else {
                for await (const traveler of cart.travelers) {
                    let travelerUser = {
                        traveler_id: traveler.userId,
                        traveler: traveler.traveler,
                        is_primary_traveler: traveler.isPrimary,
                    };
                    travelers.push(travelerUser);
                }

                const bookingdto: BookHotelCartDto = {
                    travelers,
                    payment_type,
                    instalment_type,
                    ppn: value[0].bundle,
                    additional_amount,
                    laycredit_points,
                    custom_instalment_amount: downpayment,
                    custom_instalment_no: 0,
                    card_token,
                    booking_through,
                    bundle: value[0].bundle,
                    cartCount,
                    reservationId
                };

                newCart["detail"] = await this.hotelService.cartBook(
                    bookingdto,
                    Headers,
                    user,
                    smallestDate,
                    cartData.id,
                    selected_down_payment,
                    transaction_token,
                    referral_id,
                    cartIsPromotional
                );
                logFile[reservationId] = newCart["detail"]['logData']
                newCart["logFile"] = logFile
            }
        } else {
            newCart["detail"] = {
                message: "Module info not found .",
            };
            newCart["status"] = BookingStatus.FAILED;
            await this.saveFailedBooking(
                cartData.id,
                cart.moduleInfo,
                cart.userId,
                value,
                {
                    bookingType: paidIn,
                    currencyId: 1,
                    booking_through: "web",
                },
                cart.moduleId,
                reservationId
            );
            return newCart;
        }

        if (!newCart["detail"]["statusCode"] && !newCart["detail"]["error"]) {
            newCart["status"] = BookingStatus.CONFIRM;

            await getConnection()
                .createQueryBuilder()
                .delete()
                .from(CartTravelers)
                .where(`"cart_id" = '${cart.id}'`)
                .execute();
            await getConnection()
                .createQueryBuilder()
                .delete()
                .from(Cart)
                .where(`"id" = '${cart.id}'`)
                .execute();
        } else {
            await this.saveFailedBooking(
                cartData.id,
                cart.moduleInfo,
                cart.userId,
                newCart["detail"],
                {
                    bookingType: paidIn,
                    currencyId: 1,
                    booking_through: "web",
                },
                cart.moduleId,
                reservationId
            );
        }
        return newCart;
    }

    async saveFailedBooking(
        cartId,
        moduleInfo,
        userId: string,
        errorLog,
        other: {
            bookingType: number;
            currencyId: number;
            booking_through: string;
        },
        moduleId,
        reservationId
    ) {
        //cartCount = cartCount ? cartCount : 1;
        if (typeof errorLog == "object") {
            errorLog = JSON.stringify(errorLog);
        }
        const date = new Date();
        var date1 = date.toISOString();
        date1 = date1
            .replace(/T/, " ") // replace T with a space
            .replace(/\..+/, "")
            .split(" ")[0];
        const { bookingType, currencyId, booking_through } = other;
        if (moduleId == ModulesName.FLIGHT) {
            let booking = new Booking();
            booking.id = uuidv4();
            booking.moduleId = ModulesName.FLIGHT;
            booking.laytripBookingId = reservationId;
            booking.bookingType = bookingType;
            booking.currency = currencyId;
            booking.totalAmount = moduleInfo[0].selling_price;
            booking.netRate = moduleInfo[0].net_rate;
            booking.markupAmount = (
                parseFloat(moduleInfo[0].selling_price) -
                parseFloat(moduleInfo[0].net_rate)
            ).toString();
            booking.bookingDate = date1;
            booking.usdFactor = "1";
            booking.layCredit = "0";
            booking.message = errorLog;
            booking.bookingThrough = booking_through || "";
            booking.cartId = cartId;
            booking.locationInfo = {
                journey_type:
                    moduleInfo[0].routes.length > 1 ? "RoundTrip" : "oneway",
                source_location: moduleInfo[0].departure_code,
                destination_location: moduleInfo[0].arrival_code,
            };
            const [caegory] = await getConnection().query(`select 
        (select name from laytrip_category where id = flight_route.category_id)as categoryname 
        from flight_route 
        where from_airport_code  = '${moduleInfo[0].departure_code}' and to_airport_code = '${moduleInfo[0].arrival_code}'`);
            booking.categoryName = caegory?.categoryname || null;
            booking.fareType = "";
            booking.isTicketd = false;

            booking.userId = userId;

            booking.bookingStatus = BookingStatus.FAILED;
            booking.paymentStatus = PaymentStatus.REFUNDED;
            booking.supplierBookingId = "";
            booking.isPredictive = true;
            booking.supplierStatus = 1;
            booking.moduleInfo = moduleInfo;
            booking.checkInDate = await this.changeDateFormat(
                moduleInfo[0].departure_date
            );
            booking.checkOutDate = await this.changeDateFormat(
                moduleInfo[0].arrival_date
            );

            await booking.save();
        } else if (moduleId == ModulesName.HOTEL) {
            let booking = new Booking();
            booking.id = uuidv4();
            booking.moduleId = ModulesName.HOTEL;
            booking.laytripBookingId = `LTH${uniqid.time().toUpperCase()}`;
            booking.bookingType = bookingType;
            booking.currency = currencyId;
            booking.totalAmount = moduleInfo[0].selling.sub_total;
            booking.netRate = moduleInfo[0].retail.sub_total || 0;
            booking.markupAmount = (
                parseFloat(moduleInfo[0].selling.sub_total) -
                parseFloat(moduleInfo[0].retail.sub_total)
            ).toString();
            booking.bookingDate = date1;
            booking.usdFactor = "1";
            booking.layCredit = "0";
            booking.message = errorLog;
            booking.bookingThrough = booking_through || "";
            booking.cartId = cartId;
            booking.locationInfo = {
                hotel_id: moduleInfo[0].hotel_id,
                hotel_name: moduleInfo[0].hotel_name,
                address: moduleInfo[0].address,
            };
            booking.categoryName = null;
            booking.fareType = "";
            booking.isTicketd = false;

            booking.userId = userId;

            booking.bookingStatus = BookingStatus.FAILED;
            booking.paymentStatus = PaymentStatus.REFUNDED;
            booking.supplierBookingId = "";
            booking.isPredictive = true;
            booking.supplierStatus = 1;
            booking.moduleInfo = moduleInfo;
            booking.checkInDate = moduleInfo[0].input_data.check_in;

            booking.checkOutDate = moduleInfo[0].input_data.check_out;

            await booking.save();
        }
    }

    async cartBookingEmailSend(bookingId, userId, referralId, metaData, failedResult) {
        const responce = await CartDataUtility.CartMailModelDataGenerate(
            bookingId
        );
        if (responce?.param) {
            if (responce.param.bookingType == BookingType.INSTALMENT) {
                let subject =
                    responce.param.bookingType == BookingType.INSTALMENT
                        ? `Booking ID ${responce.param.orderId} Confirmation`
                        : `Booking ID ${responce.param.orderId} Confirmation`;
                this.mailerService
                    .sendMail({
                        to: responce.email,
                        from: mailConfig.from,
                        bcc: mailConfig.BCC,
                        subject: subject,
                        html: await LaytripCartBookingConfirmtionMail(
                            responce.param,
                            responce.referralId
                        ),
                    })
                    .then((res) => {
                        //console.log("res", res);
                    })
                    .catch((err) => {
                        //console.log("err", err);
                    });
            } else {

                await this.mailerService
                    .sendMail({
                        to: responce.email,
                        from: mailConfig.from,
                        bcc: mailConfig.BCC,
                        subject: `Travel Provider Reservation Confirmation`,
                        html: await LaytripCartBookingTravelProviderConfirmtionMail(
                            responce.param,
                            responce.referralId
                        ),
                    })
                    .then((res) => {
                        console.log("res", res);
                    })
                    .catch((err) => {
                        console.log("err", err);
                    });

            }
            if (failedResult == 0) {


                let capturedAmount = parseFloat(metaData.transaction.amount) / 100
                //console.log('capturedAmount', capturedAmount)
                let cartAmount = responce?.param.cart.totalPaidInnumeric
                //console.log('cartAmount', cartAmount)
                let priceDiff = capturedAmount - cartAmount
                //console.log('cartAmount', priceDiff)
                if (priceDiff > 1) {
                    let subject = `BOOKING ID ${responce.param.orderId} OVERCHARGED`
                    this.mailerService
                        .sendMail({
                            to: responce.email,
                            from: mailConfig.from,
                            bcc: mailConfig.BCC,
                            subject: subject,
                            html: await CartOverChargeMail(
                                {
                                    priceDifferance: `${responce.currency.symbol}${priceDiff}`,
                                    user_name: responce.param.user_name
                                },
                                responce.referralId
                            ),
                        })
                        .then((res) => {
                            //console.log("res", res);
                        })
                        .catch((err) => {
                            //console.log("err", err);
                        });
                } else if (priceDiff < -1) {


                    let subject = `BOOKING ID ${responce.param.orderId} UNDERCHARGED`

                    this.mailerService
                        .sendMail({
                            to: responce.email,
                            from: mailConfig.from,
                            bcc: mailConfig.BCC,
                            subject: subject,
                            html: await CartLessChargeMail(
                                {
                                    priceDifferance: `${responce.currency.symbol}${Math.abs(priceDiff)}`,
                                    user_name: responce.param.user_name
                                },
                                responce.referralId
                            ),
                        })
                        .then((res) => {
                            //console.log("res", res);
                        })
                        .catch((err) => {
                            //console.log("err", err);
                        });
                }
            }
        } else {
            const user = await CartDataUtility.userData(userId);
            const userName = user.firstName
                ? user.firstName
                : "" + " " + user.lastName
                    ? user.lastName
                    : "";

            const subject = `Booking Not Completed`;
            this.mailerService
                .sendMail({
                    to: user.email,
                    from: mailConfig.from,
                    bcc: mailConfig.BCC,
                    subject: subject,
                    html: await BookingNotCompletedMail(
                        { userName },
                        referralId
                    ),
                })
                .then((res) => {
                    //console.log("res", res);
                })
                .catch((err) => {
                    //console.log("err", err);
                });
        }
        const failedBooking = await CartDataUtility.CartFailedMailModelDataGenerate(
            bookingId
        );
        if (failedBooking) {
            let subject = `BOOKING ID ${responce.param.orderId} CART ITEM UNAVAILABLE`

            this.mailerService
                .sendMail({
                    to: responce.email,
                    from: mailConfig.from,
                    bcc: mailConfig.BCC,
                    subject: subject,
                    html: await CartFailedInventryMail(
                        {
                            user_name: responce.param.user_name,
                            FailedBooking: failedBooking,
                            paymentDetail: responce?.param.paymentDetail
                        },
                        responce.referralId
                    ),
                })
                .then((res) => {
                    //console.log("res", res);
                })
                .catch((err) => {
                    //console.log("err", err);
                });
        }
    }

    async cartInstallmentDetail(Dto: cartInstallmentsDto, user: User) {
        const { userId, cartId } = Dto;
        if (!uuidValidator(userId)) {
            throw new NotFoundException(
                "Given user_id not avilable&&&userId&&&" + errorMessage
            );
        }

        let cart = await getConnection()
            .createQueryBuilder(CartBooking, "cartBooking")
            .leftJoinAndSelect("cartBooking.bookings", "booking")
            .leftJoinAndSelect(
                "booking.bookingInstalments",
                "BookingInstalments"
            )
            .leftJoinAndSelect("booking.currency2", "currency")
            .where(
                `"BookingInstalments"."payment_status" != ${PaymentStatus.CONFIRM} AND "cartBooking"."user_id" = '${userId}' AND "cartBooking"."laytrip_cart_id" = '${cartId}' AND "cartBooking"."booking_type" = ${BookingType.INSTALMENT}`
            )
            .getOne();

        if (!cart) {
            throw new NotFoundException(`Given cart id not found`);
        }
        const currency = cart.bookings[0].currency2;
        const baseBooking = cart.bookings[0].bookingInstalments;
        let cartInstallments = [];
        if (baseBooking) {
            for await (const baseInstallments of baseBooking) {
                let amount = parseFloat(baseInstallments.amount);

                if (cart.bookings.length > 1) {
                    for (let index = 1; index < cart.bookings.length; index++) {
                        for await (const installment of cart.bookings[index]
                            .bookingInstalments) {
                            if (
                                baseInstallments.instalmentDate ==
                                installment.instalmentDate
                            ) {
                                amount += parseFloat(installment.amount);
                            }
                        }
                    }
                } else {
                    amount = parseFloat(baseInstallments.amount);
                }
                const installment = {
                    instalmentDate: baseInstallments.instalmentDate,
                    instalmentStatus: baseInstallments.instalmentStatus,
                    attempt: baseInstallments.attempt,
                    amount: amount,
                };
                cartInstallments.push(installment);
            }
        }

        return {
            installments: cartInstallments,
            currency: currency,
        };
    }

    async emptyCart(user) {
        try {
            let where = `"user_id" = '${user?.user_id}'`;
            if (user.roleId == Role.GUEST_USER) {
                if (!uuidValidator(user.user_id)) {
                    throw new NotFoundException(
                        `Please enter guest user id &&&user_id&&&${errorMessage}`
                    );
                }
                where = `"guest_user_id" = '${user.user_id}'`;
            }
            let carts = await getConnection()
                .createQueryBuilder(Cart, "cart")
                .where(where)
                .getMany();

            if (!carts.length) {
                throw new BadRequestException(`Your cart is alredy empty `);
            }
            let cartIds: number[] = [];
            for await (const cart of carts) {
                cartIds.push(cart.id);
            }

            await getConnection()
                .createQueryBuilder()
                .delete()
                .from(CartTravelers)
                .where(`"cart_id" in (:...cartIds)`, {
                    cartIds,
                })
                .execute();
            await getConnection()
                .createQueryBuilder()
                .delete()
                .from(Cart)
                .where(`"id" in (:...cartIds)`, {
                    cartIds,
                })
                .execute();

            return {
                message: `Your cart all itenery deleteted successufully `,
            };
        } catch (error) {
            if (typeof error.response !== "undefined") {
                //console.log("m");
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new NotFoundException(
                `${error.message}&&&id&&&${error.message}`
            );
        }
    }

    async changeDateFormat(dateTime) {
        var date = dateTime.split("/");

        return `${date[2]}-${date[1]}-${date[0]}`;
    }

    // async testRefaund(bookingId , header){
    //     let query = await getConnection().createQueryBuilder(CartBooking, "cart")
    //     .where(`laytrip_cart_id = '${bookingId}' `).getOne()

    //     this.refundCart(
    //         "fc140356-8230-477a-ae1d-60c26d2fde0e",
    //         header,
    //         PaymentType.INSTALMENT,
    //         InstalmentType.WEEKLY,
    //         "2021-06-21",
    //         0,
    //         "R4cq32SjOLRxngQr2vkmgy9NeQ3",
    //         query.userId
    //     );
    // }

    async addHotelIntoCart(ppnBundle: string, user, referralId, cartIsPromotional, paymentType, paymentFrequency, downpayment, paymentMethod) {
        let roomDetails = await this.hotelService.availability(
            {
                room_ppn: ppnBundle,
            },
            user.userId || null,
            referralId
        );
        // console.log("applicable", roomDetails.data["items"][0]?.offer_data?.applicable, typeof roomDetails.data[0]?.offer_data?.applicable && referralId)
        /* if (roomDetails.data["items"][0]?.offer_data?.applicable == true && cartIsPromotional == false && referralId) {
            throw new ConflictException(`In cart not-promotional item found`)
        }
        if (roomDetails.data["items"][0]?.offer_data?.applicable == false && cartIsPromotional == true && referralId) {
            throw new ConflictException(`In cart promotional item found`)
        } */

        /* if ((paymentType == BookingType.INSTALMENT && roomDetails.data["items"][0].is_installment_available == false) || (paymentType == BookingType.NOINSTALMENT && roomDetails.data["items"][0].is_installment_available == true)) {
            throw new NotAcceptableException(`Cart payment type and inventory payment type are mismatch`)
        } */


        const cart = new Cart();

        if (user.roleId != Role.GUEST_USER) {
            cart.userId = user.userId;
        } else {
            cart.guestUserId = user.userId;
        }

        cart.moduleId = ModulesName.HOTEL;
        cart.moduleInfo = roomDetails.data;
        cart.isPromotional = roomDetails.data["items"][0]?.offer_data?.applicable == true ? true : false
        cart.offerFrom = referralId
        cart.oldModuleInfo = roomDetails.data;
        cart.paymentType = roomDetails.data["items"][0].is_installment_available ? BookingType.INSTALMENT : BookingType.NOINSTALMENT

        let depatureDate = cart.moduleInfo["items"][0]?.input_data?.check_in;
        cart.paymentMethod = paymentMethod;
        cart.paymentFrequency = paymentFrequency || "";
        cart.downpayment = downpayment || 0;

        cart.expiryDate = depatureDate ? new Date(depatureDate) : new Date();
        cart.isDeleted = false;
        cart.createdDate = new Date();

        let savedCart = await cart.save();

        return {
            message: `Hotel added to cart`,
            data: savedCart,
        };
    }

    async getReferralId(name: string) {
        let where = `"landingPages"."is_deleted" = false AND "landingPages"."name" like '${name}'`;

        const query = getConnection()
            .createQueryBuilder(LandingPages, "landingPages")
            .where(where);

        const result = await query.getOne();
        return result;
    }

    
}
