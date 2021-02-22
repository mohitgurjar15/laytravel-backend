import { BadRequestException, CACHE_MANAGER, ConflictException, ForbiddenException, Inject, Injectable, InternalServerErrorException, NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/entity/user.entity';
import { ModulesName } from 'src/enum/module.enum';
import { FlightService } from 'src/flight/flight.service';
import { DateTime } from 'src/utility/datetime.utility';
import { AddInCartDto } from './dto/add-in-cart.dto';
import * as moment from 'moment';
import { Cart } from 'src/entity/cart.entity';
import { getConnection } from 'typeorm';
import { VacationRentalService } from 'src/vacation-rental/vacation-rental.service';
import { Role } from 'src/enum/role.enum';
import * as uuidValidator from "uuid-validate"
import { CartTravelers } from 'src/entity/cart-traveler.entity';
import { BookFlightDto } from 'src/flight/dto/book-flight.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AirportRepository } from 'src/flight/airport.repository';
import { ListCartDto } from './dto/list-cart.dto';
import { Strategy } from 'src/flight/strategy/strategy';
import { Mystifly } from 'src/flight/strategy/mystifly';
import { Module } from 'src/entity/module.entity';
import { Generic } from 'src/utility/generic.utility';
import { errorMessage } from 'src/config/common.config';
import { Cache } from 'cache-manager';
import { CartBookDto } from './dto/book-cart.dto';
import { v4 as uuidv4 } from "uuid";
import * as uniqid from 'uniqid';
import { CartBooking } from "src/entity/cart-booking.entity"
import { BookingType } from 'src/enum/booking-type.enum';
import { BookingStatus } from 'src/enum/booking-status.enum';
import { PaymentStatus } from 'src/enum/payment-status.enum';
import { cartInstallmentsDto } from './dto/cart-installment-detil.dto';
import { UserCard } from 'src/entity/user-card.entity';
import { SearchLog } from 'src/entity/search-log.entity';
import { CartBookingEmailParameterModel } from 'src/config/email_template/model/cart-booking-email.model';
import { CartDataUtility } from 'src/utility/cart-data.utility';
import { MailerService } from '@nestjs-modules/mailer';
import * as config from "config";
import { LaytripCartBookingConfirmtionMail } from 'src/config/new_email_templete/cart-booking-confirmation.html';
const mailConfig = config.get("email");
import { BookingNotCompletedMail } from 'src/config/new_email_templete/booking-not-completed-mail.html';

@Injectable()
export class CartService {

    constructor(
        private flightService: FlightService,
        private vacationService: VacationRentalService,

        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,

        @InjectRepository(AirportRepository)
        private airportRepository: AirportRepository,

        public readonly mailerService: MailerService
    ) { }

    async addInCart(addInCartDto: AddInCartDto, user, Header) {
        try {
            let userData;
            const { module_id, route_code, property_id, room_id, rate_plan_code, check_in_date, check_out_date, adult_count, number_and_children_ages = [] } = addInCartDto
            var tDate = new Date();

            var todayDate = tDate.toISOString().split(' ')[0];
            todayDate = todayDate
                .replace(/T/, " ") // replace T with a space
                .replace(/\..+/, "");
            let where = `AND ("cart"."user_id" = '${user.user_id}')`
            if (user.roleId == Role.GUEST_USER) {
                if (!uuidValidator(user.user_id)) {
                    throw new NotFoundException(`Please enter guest user id &&&user_id&&&${errorMessage}`)
                }
                where = `AND ("cart"."guest_user_id" = '${user.user_id}')`
            }
            let query = getConnection()
                .createQueryBuilder(Cart, "cart")
                .where(`(DATE("cart"."expiry_date") >= DATE('${todayDate}') )  AND ("cart"."is_deleted" = false) ${where}`)
            const result = await query.getCount();
            if (result >= 5) {
                throw new BadRequestException(`In your cart you have add maximum 5 item.`)
            }
            console.log('user', user);

            userData = await getConnection()
                .createQueryBuilder(User, "user")
                .where(`user_id = '${user.user_id}'`)
                .getOne()






            // let role = [Role.FREE_USER, Role.PAID_USER, Role.TRAVELER_USER]

            // for await (const traveler of travelers) {
            //     if (!traveler.traveler_id || !uuidValidator(traveler.traveler_id)) {
            //         throw new BadRequestException('Given traveler is not valid')
            //     }

            //     let where = `("User"."is_deleted" = false) AND("User"."role_id" IN (${role})) AND ("User"."user_id" = '${traveler.traveler_id}')`;
            //     let travelerAvailable = await getConnection()
            //         .createQueryBuilder(User, "User")
            //         .where(where)
            //         .getCount()

            //     if (!travelerAvailable) {
            //         throw new BadRequestException('Given traveler is not available')
            //     }
            // }

            switch (module_id) {
                case ModulesName.HOTEL:
                    break;

                case ModulesName.FLIGHT:
                    return await this.addFlightDataInCart(route_code, userData, Header);
                    break;
                case ModulesName.VACATION_RENTEL:
                    const dto = {
                        "property_id": property_id,
                        "room_id": room_id,
                        "rate_plan_code": rate_plan_code,
                        "check_in_date": check_in_date,
                        "check_out_date": check_out_date,
                        "adult_count": adult_count,
                        "number_and_children_ages": number_and_children_ages
                    };
                    return await this.addHomeRentalDataInCart(dto, userData, Header);
                    break;
                default:
                    break;
            }
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
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
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

    async addFlightDataInCart(route_code: string, user: User, Header) {
        //console.log('validate');

        const flightInfo: any = await this.flightService.airRevalidate({ route_code: route_code }, Header, user ? user : null);

        if (flightInfo) {

            // var travelersCount:number = parseInt(flightInfo[0].adult_count)
            // //console.log(flightInfo[0].adult_count);
            // //console.log(travelersCount);

            // const 
            // travelersCount= travelersCount + 
            // //console.log(flightInfo[0].child_count);
            // //console.log(travelersCount);

            // travelersCount = travelersCount + flightInfo[0].infant_count ? parseInt(flightInfo[0].infant_count) : 0
            // //console.log(travelersCount);

            // //console.log(travelersCount);
            // //console.log(travelers.length);


            // if (travelersCount != travelers.length) {
            //     if (travelersCount > travelers.length) {
            //         throw new BadRequestException('Please add traveler')
            //     } else {
            //         throw new BadRequestException('Please remove traveler')
            //     }
            // }
            const depatureDate = flightInfo[0].departure_date;

            const formatedDepatureDate = DateTime.convertDateFormat(depatureDate, 'DD/MM/YYYY', 'YYYY-MM-DD')

            const diffrence = moment(formatedDepatureDate).diff(moment(new Date()), 'days');

            const dayAfterDay = new Date();
            dayAfterDay.setDate(dayAfterDay.getDate() + 2);

            const cart = new Cart

            if (user.roleId != Role.GUEST_USER) {
                //console.log(user);

                cart.userId = user.userId
            } else {
                //console.log(guestId);
                cart.guestUserId = user.userId
            }

            cart.moduleId = ModulesName.FLIGHT
            cart.moduleInfo = flightInfo
            cart.expiryDate = diffrence > 2 ? new Date(dayAfterDay) : new Date(formatedDepatureDate);
            cart.isDeleted = false
            cart.createdDate = new Date();
            // cart.instalmentType = instalment_type;
            // cart.paymentType = payment_type

            let savedCart = await cart.save();

            // for await (const traveler of travelers) {
            //     let cartTraveler = new CartTravelers()
            //     cartTraveler.cartId = savedCart.id
            //     cartTraveler.userId = traveler.traveler_id
            //     await cartTraveler.save();
            // }

            return {
                message: `Flight added to cart`,
                data: savedCart
            }
        }
        else {
            throw new NotFoundException(`flight not available`)
        }
    }

    async mapGuestUser(guestUserId, user: User) {
        try {
            if (!uuidValidator(guestUserId)) {
                throw new NotFoundException(`Please enter guest user id &&&user_id&&&${errorMessage}`)
            }
            await getConnection()
                .createQueryBuilder()
                .update(UserCard)
                .set({ userId: user.userId, guestUserId: null })
                .where("guest_user_id =:id", { id: guestUserId })
                .execute();

            await getConnection()
                .createQueryBuilder()
                .update(User)
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
                .where(
                    `"user_id" = '${guestUserId}'`
                )
                .execute()
            return {
                message: `Guest user cart successfully maped `
            }
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
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
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
            const { cart_id, travelers } = updateCartDto

            let where
            if (user.roleId != Role.GUEST_USER) {
                where = `("cart"."is_deleted" = false) AND ("cart"."user_id" = '${user.user_id}') AND ("cart"."id" = '${cart_id}') `
            } else {
                if (!uuidValidator(user.user_id)) {
                    throw new NotFoundException(`Please enter guest user id &&&user_id&&&${errorMessage}`)
                }
                where = `("cart"."is_deleted" = false) AND ("cart"."guest_user_id" = '${user.user_id}') AND ("cart"."id" = '${cart_id}') `
            }

            let query = getConnection()
                .createQueryBuilder(Cart, "cart")
                .where(where)
            const result = await query.getOne();

            if (!result) {
                throw new BadRequestException(`Given cart item not found.`)
            }
            await getConnection()
                .createQueryBuilder()
                .delete()
                .from(CartTravelers)
                .where(
                    `"cart_id" = '${result.id}'`
                )
                .execute()
            for (let index = 0; index < travelers.length; index++) {
                const element = travelers[index];
                if (!uuidValidator(element.traveler_id)) {
                    throw new NotFoundException('Traveler id not found please change it')
                }

                for (let i = 0; i < travelers.length; i++) {
                    const traveler = travelers[i];
                    if (i != index && element.traveler_id == traveler.traveler_id) {
                        throw new ConflictException(`Dublicate traveler found in list. please change it.`)
                    }
                }
            }

            for await (const traveler of travelers) {
                let cartTraveler = new CartTravelers()
                cartTraveler.cartId = result.id
                cartTraveler.userId = traveler.traveler_id
                cartTraveler.baggageServiceCode = traveler.baggage_service_code
                await cartTraveler.save();
            }

            return {
                message: `Cart item updated successfully`
            }
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
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
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
        let homeInfo = await this.vacationService.homeRentalRevalidate(dto, user, Header);
        // //console.log(homeInfo);
        if (homeInfo) {

            const check_in_date = homeInfo[0].check_in_date;

            const formatedCheckinDate = check_in_date;

            const diffrence = moment(formatedCheckinDate).diff(moment(new Date()), 'days');

            const dayAfterDay = new Date();
            dayAfterDay.setDate(dayAfterDay.getDate() + 2);

            const cart = new Cart

            cart.userId = user.userId
            cart.moduleId = ModulesName.VACATION_RENTEL
            cart.moduleInfo = homeInfo
            cart.expiryDate = diffrence > 2 ? new Date(dayAfterDay) : new Date(formatedCheckinDate);
            cart.isDeleted = false
            cart.createdDate = new Date();

            await cart.save();

            return {
                message: `Home Rental added to cart`
            }
        }

    }

    async listCart(dto: ListCartDto, user, headers) {
        try {
            const { live_availiblity } = dto
            var tDate = new Date();


            var todayDate = tDate.toISOString().split(' ')[0];
            todayDate = todayDate
                .replace(/T/, " ") // replace T with a space
                .replace(/\..+/, "");

            let where = `(DATE("cart"."expiry_date") >= DATE('${todayDate}') )  AND ("cart"."is_deleted" = false) AND ("cart"."user_id" = '${user.user_id}') AND ("cart"."module_id" = '${ModulesName.FLIGHT}')`
            if (user.roleId == Role.GUEST_USER) {
                if (!uuidValidator(user.user_id)) {
                    throw new NotFoundException(`Please enter guest user id &&&user_id&&&${errorMessage}`)
                }
                where = `(DATE("cart"."expiry_date") >= DATE('${todayDate}') )  AND ("cart"."is_deleted" = false) AND ("cart"."guest_user_id" = '${user.user_id}') AND ("cart"."module_id" = '${ModulesName.FLIGHT}')`
            }
            let query = getConnection()
                .createQueryBuilder(Cart, "cart")
                .leftJoinAndSelect("cart.module", "module")
                .leftJoinAndSelect("cart.travelers", "travelers")
                //.leftJoinAndSelect("travelers.userData", "userData")
                .select(["cart.id",
                    "cart.userId",
                    "cart.guestUserId",
                    "cart.moduleId",
                    "cart.moduleInfo",
                    "cart.expiryDate",
                    "cart.isDeleted",
                    "cart.createdDate",
                    "module.id",
                    "module.name",
                    "travelers.id",
                    "travelers.userId",
                    "travelers.baggageServiceCode"])

                .where(where)
                .orderBy(`cart.id`, 'ASC')
                .limit(5)
            const [result, count] = await query.getManyAndCount();

            if (!result.length) {
                throw new NotFoundException(`Cart is empty`)
            }
            let responce = []
            var flightRequest = [];
            let flightResponse = [];
            if (typeof live_availiblity != "undefined" && live_availiblity == 'yes') {
                await this.flightService.validateHeaders(headers);

                const mystifly = new Strategy(new Mystifly(headers, this.cacheManager));

                var resultIndex = 0;

                const mystiflyConfig = await new Promise((resolve) => resolve(mystifly.getMystiflyCredential()))

                const sessionToken = await new Promise((resolve) => resolve(mystifly.startSession()))

                let module = await getConnection()
                    .createQueryBuilder(Module, "module")
                    .where("module.name = :name", { name: 'flight' })
                    .getOne();

                if (!module) {
                    throw new InternalServerErrorException(`Flight module is not configured in database&&&module&&&${errorMessage}`);
                }

                const currencyDetails = await Generic.getAmountTocurrency(headers.currency);
                for await (const cart of result) {
                    const bookingType = cart.moduleInfo[0].routes.length > 1 ? 'RoundTrip' : 'oneway'

                    if (bookingType == 'oneway') {

                        let dto = {
                            "source_location": cart.moduleInfo[0].departure_code,
                            "destination_location": cart.moduleInfo[0].arrival_code,
                            "departure_date": await this.flightService.changeDateFormat(cart.moduleInfo[0].departure_date),
                            "flight_class": cart.moduleInfo[0].routes[0].stops[0].cabin_class,
                            "adult_count": cart.moduleInfo[0].adult_count ? cart.moduleInfo[0].adult_count : 0,
                            "child_count": cart.moduleInfo[0].child_count ? cart.moduleInfo[0].child_count : 0,
                            "infant_count": cart.moduleInfo[0].infant_count ? cart.moduleInfo[0].infant_count : 0
                        }
                        //console.log(dto);

                        flightRequest[resultIndex] = new Promise((resolve) => resolve(mystifly.oneWaySearchZip(dto, user, mystiflyConfig, sessionToken, module, currencyDetails)));
                    }
                    else {

                        let dto = {
                            "source_location": cart.moduleInfo[0].departure_code,
                            "destination_location": cart.moduleInfo[0].arrival_code,
                            "departure_date": await this.flightService.changeDateFormat(cart.moduleInfo[0].departure_date),
                            "flight_class": cart.moduleInfo[0].routes[0].stops[0].cabin_class,
                            "adult_count": cart.moduleInfo[0].adult_count ? cart.moduleInfo[0].adult_count : 0,
                            "child_count": cart.moduleInfo[0].child_count ? cart.moduleInfo[0].child_count : 0,
                            "infant_count": cart.moduleInfo[0].infant_count ? cart.moduleInfo[0].infant_count : 0,
                            "arrival_date": await this.flightService.changeDateFormat(cart.moduleInfo[0].arrival_date)
                        }
                        //console.log(dto);
                        flightRequest[resultIndex] = new Promise((resolve) => resolve(mystifly.roundTripSearchZip(dto, user, mystiflyConfig, sessionToken, module, currencyDetails)));
                    }
                    resultIndex++;
                }
                flightResponse = await Promise.all(flightRequest);
            }

            for (let index = 0; index < result.length; index++) {
                const cart = result[index];

                let newCart = {}

                if (typeof live_availiblity != "undefined" && live_availiblity == 'yes') {
                    newCart['oldModuleInfo'] = cart.moduleInfo
                    const value = await this.flightAvailiblity(cart, flightResponse[index])
                    //return value
                    if (typeof value.message == "undefined") {

                        newCart['moduleInfo'] = [value]
                        newCart['is_available'] = true

                        //cart.moduleInfo = [value]
                        // await getConnection()
                        //     .createQueryBuilder()
                        //     .update(Cart)
                        //     .set({ moduleInfo: [value] })
                        //     .where("id = :id", { id: cart.id })
                        //     .execute();
                        // await cart.save()
                    } else {
                        newCart['is_available'] = false
                        newCart['moduleInfo'] = cart.moduleInfo
                        await getConnection()
                            .createQueryBuilder()
                            .delete()
                            .from(CartTravelers)
                            .where(
                                `"cart_id" = '${cart.id}'`
                            )
                            .execute()
                        await getConnection()
                            .createQueryBuilder()
                            .delete()
                            .from(Cart)
                            .where(
                                `"id" = '${cart.id}'`
                            )
                            .execute()
                    }
                }
                else {
                    newCart['moduleInfo'] = cart.moduleInfo
                    //newCart['is_available'] = false
                }
                newCart['id'] = cart.id
                newCart['userId'] = cart.userId
                newCart['guestUserId'] = cart.guestUserId
                newCart['moduleId'] = cart.moduleId
                newCart['expiryDate'] = cart.expiryDate
                newCart['isDeleted'] = cart.isDeleted
                newCart['createdDate'] = cart.createdDate
                newCart['type'] = cart.module.name
                newCart['travelers'] = cart.travelers
                responce.push(newCart)
            }
            return {
                data: responce,
                count: count
            }
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
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
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

    async flightAvailiblity(cart, flights) {
        ////console.log('match');

        var match = 0;
        //console.log(flights);

        if (flights.items) {
            //console.log('cart.moduleInfo[0].unique_code', cart.moduleInfo[0].unique_code);

            for await (const flight of flights.items) {
                //console.log("flight?.unique_code", flight.unique_code);

                if (flight?.unique_code == cart.moduleInfo[0].unique_code) {
                    ////console.log('match found');
                    match = match + 1
                    return flight;
                }
            }
        }
        ////console.log('loop empty');


        if (match == 0) {
            ////console.log('match not found');
            return {
                message: 'Flight is not available'
            }
            //throw new NotFoundException(`Flight is not available`)
        }

    }

    async deleteFromCart(id: number, user) {
        try {
            let where = `("cart"."is_deleted" = false) AND ("cart"."user_id" = '${user?.user_id}') AND ("cart"."id" = ${id})`
            if (user.roleId == Role.GUEST_USER) {
                if (!uuidValidator(user.user_id)) {
                    throw new NotFoundException(`Please enter guest user id &&&user_id&&&${errorMessage}`)
                }
                where = `("cart"."is_deleted" = false) AND ("cart"."guest_user_id" = '${user.user_id}') AND ("cart"."id" = ${id})`
            }

            let query = getConnection()
                .createQueryBuilder(Cart, "cart")
                .where(where)


            const cartItem = await query.getOne();

            if (!cartItem) {
                throw new NotFoundException(`Given item not found`)
            }
            await getConnection()
                .createQueryBuilder()
                .delete()
                .from(CartTravelers)
                .where(
                    `"cart_id" = '${id}'`
                )
                .execute()
            await getConnection()
                .createQueryBuilder()
                .delete()
                .from(Cart)
                .where(
                    `"id" = '${id}'`
                )
                .execute()

            return {
                message: `Item removed successfully`
            }
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
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
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


    async bookCart(bookCart: CartBookDto, user: User, Headers) {
        try {
            const { payment_type, laycredit_points, card_token, instalment_type, additional_amount, booking_through, cart, selected_down_payment } = bookCart


            if (cart.length > 5) {
                throw new BadRequestException('Please check cart, In cart you can not purches more then 5 item')
            }
            let cartIds: number[] = []
            for await (const i of cart) {
                cartIds.push(i.cart_id)
            }

            let query = getConnection()
                .createQueryBuilder(Cart, "cart")
                .leftJoinAndSelect("cart.module", "module")
                .leftJoinAndSelect("cart.travelers", "travelers")
                .leftJoinAndSelect("travelers.userData", "userData")
                .select(["cart.id",
                    "cart.userId",
                    "cart.moduleId",
                    "cart.moduleInfo",
                    "cart.expiryDate",
                    "cart.isDeleted",
                    "cart.createdDate",
                    "module.id",
                    "module.name",
                    "travelers.id",
                    "travelers.baggageServiceCode",
                    "travelers.userId",
                    "userData.roleId",
                    "userData.email",
                    "userData.firstName",
                    "userData.middleName"])

                .where(`("cart"."is_deleted" = false) AND ("cart"."user_id" = '${user.userId}') AND ("cart"."module_id" = '${ModulesName.FLIGHT}') AND ("cart"."id" IN (${cartIds}))`)
                .orderBy(`cart.id`, 'DESC')
                .limit(5)
            const [result, count] = await query.getManyAndCount();

            if (!result.length) {
                throw new BadRequestException(`Cart is empty.&&&cart&&&${errorMessage}`)
            }
            let smallestDate = ''
            let largestDate = ''
            for await (const item of result) {
                if (item.moduleId == ModulesName.FLIGHT) {
                    const dipatureDate = await this.flightService.changeDateFormat(item.moduleInfo[0].departure_date)
                    if (smallestDate == '') {
                        smallestDate = dipatureDate;
                    } else if (new Date(smallestDate) > new Date(dipatureDate)) {
                        smallestDate = dipatureDate;
                    }
                    //console.log(item.moduleInfo[0]);

                    const arrivalDate = await this.flightService.changeDateFormat(item.moduleInfo[0].arrival_date)
                    if (largestDate == '') {
                        largestDate = arrivalDate;
                    } else if (new Date(largestDate) > new Date(arrivalDate)) {
                        largestDate = arrivalDate;
                    }
                }
            }
            const cartBook = new CartBooking
            cartBook.id = uuidv4();
            cartBook.laytripCartId = `LTC${uniqid.time().toUpperCase()}`;
            cartBook.bookingDate = new Date()
            cartBook.checkInDate = new Date(smallestDate)
            cartBook.checkOutDate = new Date(largestDate)
            cartBook.userId = user.userId
            cartBook.bookingType = payment_type == "instalment" ? BookingType.INSTALMENT : BookingType.NOINSTALMENT
            cartBook.status == BookingStatus.PENDING
            const cartData = await cartBook.save()

            let responce = []
            let mailResponce = []
            for await (const item of result) {
                switch (item.moduleId) {
                    case ModulesName.FLIGHT:
                        let flightResponce = await this.bookFlight(item, user, Headers, bookCart, smallestDate, cartData)
                        responce.push(flightResponce)
                        flightResponce['cart'] = item
                        mailResponce.push(flightResponce)
                        break;

                    default:
                        break;
                }
            }
            let returnResponce = {}
            returnResponce = cartData
            returnResponce['carts'] = responce
            this.cartBookingEmailSend(cartData.laytripCartId, cartData.userId)

            return returnResponce
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
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
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

    async bookFlight(cart: Cart, user: User, Headers, bookCart: CartBookDto, smallestDate: string, cartData: CartBooking) {
        const { payment_type, laycredit_points, card_token, instalment_type, additional_amount, booking_through, selected_down_payment } = bookCart
        const bookingType = cart.moduleInfo[0].routes.length > 1 ? 'RoundTrip' : 'oneway'
        const downPayment = selected_down_payment ? selected_down_payment : 0;
        let flightRequest;
        if (bookingType == 'oneway') {

            let dto = {
                "source_location": cart.moduleInfo[0].departure_code,
                "destination_location": cart.moduleInfo[0].arrival_code,
                "departure_date": await this.flightService.changeDateFormat(cart.moduleInfo[0].departure_date),
                "flight_class": cart.moduleInfo[0].routes[0].stops[0].cabin_class,
                "adult_count": cart.moduleInfo[0].adult_count ? cart.moduleInfo[0].adult_count : 0,
                "child_count": cart.moduleInfo[0].child_count ? cart.moduleInfo[0].child_count : 0,
                "infant_count": cart.moduleInfo[0].infant_count ? cart.moduleInfo[0].infant_count : 0
            }
            //console.log(dto);

            flightRequest = await this.flightService.searchOneWayZipFlight(dto, Headers, user);
        }
        else {

            let dto = {
                "source_location": cart.moduleInfo[0].departure_code,
                "destination_location": cart.moduleInfo[0].arrival_code,
                "departure_date": await this.flightService.changeDateFormat(cart.moduleInfo[0].departure_date),
                "flight_class": cart.moduleInfo[0].routes[0].stops[0].cabin_class,
                "adult_count": cart.moduleInfo[0].adult_count ? cart.moduleInfo[0].adult_count : 0,
                "child_count": cart.moduleInfo[0].child_count ? cart.moduleInfo[0].child_count : 0,
                "infant_count": cart.moduleInfo[0].infant_count ? cart.moduleInfo[0].infant_count : 0,
                "arrival_date": await this.flightService.changeDateFormat(cart.moduleInfo[0].arrival_date)
            }
            flightRequest = await this.flightService.searchRoundTripZipFlight(dto, Headers, user);
        }
        const value = await this.flightAvailiblity(cart, flightRequest)
        let newCart = {}
        newCart['id'] = cart.id
        newCart['userId'] = cart.userId
        newCart['moduleId'] = cart.moduleId
        newCart['isDeleted'] = cart.isDeleted
        newCart['createdDate'] = cart.createdDate
        newCart['status'] = BookingStatus.CONFIRM
        newCart['type'] = cart.module.name
        if (typeof value.message == "undefined") {
            let travelers = []
            if (!cart.travelers.length) {
                newCart['status'] = BookingStatus.FAILED
                newCart['detail'] = {
                    statusCode: 422,
                    status: BookingStatus.FAILED,
                    message: `Please update traveler details.`
                }
            } else {
                for await (const traveler of cart.travelers) {
                    //console.log(traveler);
                    let travelerUser = {
                        traveler_id: traveler.userId
                    }
                    travelers.push(travelerUser)
                }
                const bookingdto: BookFlightDto = {
                    travelers,
                    payment_type,
                    instalment_type,
                    route_code: value.route_code,
                    additional_amount,
                    laycredit_points,
                    custom_instalment_amount: 0,
                    custom_instalment_no: 0,
                    card_token,
                    booking_through,
                }


                //console.log(bookingdto);
                newCart['detail'] = await this.flightService.cartBook(bookingdto, Headers, user, smallestDate, cartData.id, selected_down_payment)
            }

        } else {
            newCart['detail'] = {
                message: value.message
            }
            newCart['status'] = BookingStatus.FAILED
            return newCart
        }
        if (!newCart['detail']['status']) {
            await getConnection()
                .createQueryBuilder()
                .delete()
                .from(CartTravelers)
                .where(
                    `"cart_id" = '${cart.id}'`
                )
                .execute()
            await getConnection()
                .createQueryBuilder()
                .delete()
                .from(Cart)
                .where(
                    `"id" = '${cart.id}'`
                )
                .execute()
        }



        return newCart
    }

    async cartBookingEmailSend(bookingId, userId) {
        const responce = await CartDataUtility.CartMailModelDataGenerate(bookingId)
        if (responce?.param) {
            let subject = responce.param.bookingType == BookingType.INSTALMENT ? `BOOKING ID ${responce.param.orderId} CONFIRMATION` : `BOOKING ID ${responce.param.orderId} CONFIRMATION`
            this.mailerService
                .sendMail({
                    to: responce.email,
                    from: mailConfig.from,
                    bcc: mailConfig.BCC,
                    subject: subject,
                    html: await LaytripCartBookingConfirmtionMail(responce.param),
                })
                .then((res) => {
                    //console.log("res", res);
                })
                .catch((err) => {
                    //console.log("err", err);
                });
        } else {
            const user = await CartDataUtility.userData(bookingId)
            const userName = user.firstName ? user.firstName : '' + ' ' + user.lastName ? user.lastName : ''

            const subject = `BOOKING NOT COMPLETED`
            this.mailerService
                .sendMail({
                    to: user.email,
                    from: mailConfig.from,
                    bcc: mailConfig.BCC,
                    subject: subject,
                    html: await BookingNotCompletedMail({ userName }),
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
        const { userId, cartId } = Dto
        if (!uuidValidator(userId)) {
            throw new NotFoundException('Given user_id not avilable&&&userId&&&' + errorMessage)
        }

        let cart = await getConnection()
            .createQueryBuilder(CartBooking, "cartBooking")
            .leftJoinAndSelect("cartBooking.bookings", "booking")
            .leftJoinAndSelect("booking.bookingInstalments", "BookingInstalments")
            .leftJoinAndSelect("booking.currency2", "currency")
            .where(`"BookingInstalments"."payment_status" != ${PaymentStatus.CONFIRM} AND "cartBooking"."user_id" = '${userId}' AND "cartBooking"."laytrip_cart_id" = '${cartId}' AND "cartBooking"."booking_type" = ${BookingType.INSTALMENT}`)
            .getOne();

        if (!cart) {
            throw new NotFoundException(`Given booking id noy found`);
        }
        const currency = cart.bookings[0].currency2
        const baseBooking = cart.bookings[0].bookingInstalments
        let cartInstallments = [];
        if (baseBooking) {
            for await (const baseInstallments of baseBooking) {

                let amount = parseFloat(baseInstallments.amount);

                if (cart.bookings.length > 1) {
                    for (let index = 1; index < cart.bookings.length; index++) {

                        for await (const installment of cart.bookings[index].bookingInstalments) {
                            if (baseInstallments.instalmentDate == installment.instalmentDate) {
                                amount += parseFloat(installment.amount)
                            }
                        }
                    }
                }
                else {
                    amount = parseFloat(baseInstallments.amount)
                }
                const installment = {
                    instalmentDate: baseInstallments.instalmentDate,
                    instalmentStatus: baseInstallments.instalmentStatus,
                    attempt: baseInstallments.attempt,
                    amount: amount
                }
                cartInstallments.push(installment)
            }
        }

        return {
            installments: cartInstallments,
            currency: currency
        }

    }

    async emptyCart(user) {
        try {
            let where = `"user_id" = '${user?.user_id}'`
            if (user.roleId == Role.GUEST_USER) {
                if (!uuidValidator(user.user_id)) {
                    throw new NotFoundException(`Please enter guest user id &&&user_id&&&${errorMessage}`)
                }
                where = `"guest_user_id" = '${user.user_id}'`
            }
            let carts = await getConnection()
                .createQueryBuilder(Cart, "cart")
                .where(where)
                .getMany()

            if (!carts.length) {
                throw new BadRequestException(`Your cart is alredy empty `)
            }
            let cartIds: number[] = []
            for await (const cart of carts) {
                cartIds.push(cart.id)
            }

            await getConnection()
                .createQueryBuilder()
                .delete()
                .from(CartTravelers)
                .where(
                    `"cart_id" in (:...cartIds)`, {
                    cartIds
                }
                )
                .execute()
            await getConnection()
                .createQueryBuilder()
                .delete()
                .from(Cart)
                .where(
                    `"id" in (:...cartIds)`, {
                    cartIds
                }
                )
                .execute()

            return {
                message: `Your cart all itenery deleteted successufully `
            }
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
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
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
}
