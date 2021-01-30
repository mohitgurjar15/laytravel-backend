import { BadRequestException, CACHE_MANAGER, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class CartService {

    constructor(
        private flightService: FlightService,
        private vacationService: VacationRentalService,

        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,

        @InjectRepository(AirportRepository)
        private airportRepository: AirportRepository,
    ) { }

    async addInCart(addInCartDto: AddInCartDto, user: User, Header) {
        const { module_id, route_code, property_id, room_id, rate_plan_code, check_in_date, check_out_date, adult_count, number_and_children_ages = [] } = addInCartDto

        var tDate = new Date();

        var todayDate = tDate.toISOString().split(' ')[0];
        todayDate = todayDate
            .replace(/T/, " ") // replace T with a space
            .replace(/\..+/, "");

        let query = getConnection()
            .createQueryBuilder(Cart, "cart")
            .where(`(DATE("cart"."expiry_date") >= DATE('${todayDate}') )  AND ("cart"."is_deleted" = false) AND ("cart"."user_id" = '${user.userId}') `)
        const result = await query.getCount();

        if (result >= 5) {
            throw new BadRequestException(`In your cart you have add maximum 5 item.`)
        }

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
                return await this.addFlightDataInCart(route_code, user, Header);
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
                return await this.addHomeRentalDataInCart(dto, user, Header);
                break;
            default:
                break;
        }
    }

    async addFlightDataInCart(route_code: string, user: User, Header) {

        const flightInfo: any = await this.flightService.airRevalidate({ route_code: route_code }, Header, user);

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

            cart.userId = user.userId
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

    async updateCart(updateCartDto: UpdateCartDto, user: User) {
        const { cart_id, travelers } = updateCartDto

        let query = getConnection()
            .createQueryBuilder(Cart, "cart")
            .where(`("cart"."is_deleted" = false) AND ("cart"."user_id" = '${user.userId}') AND ("cart"."id" = '${cart_id}') `)
        const result = await query.getOne();

        if (!result) {
            throw new BadRequestException(`Given cart item not found.`)
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

    async listCart(dto: ListCartDto, user: User, headers) {
        const { live_availiblity } = dto
        var tDate = new Date();

        var todayDate = tDate.toISOString().split(' ')[0];
        todayDate = todayDate
            .replace(/T/, " ") // replace T with a space
            .replace(/\..+/, "");

        let query = getConnection()
            .createQueryBuilder(Cart, "cart")
            .leftJoinAndSelect("cart.module", "module")
            .leftJoinAndSelect("cart.travelers", "travelers")
            //.leftJoinAndSelect("travelers.userData", "userData")
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
                "travelers.userId",
                "travelers.baggageServiceCode"])

            .where(`(DATE("cart"."expiry_date") >= DATE('${todayDate}') )  AND ("cart"."is_deleted" = false) AND ("cart"."user_id" = '${user.userId}') AND ("cart"."module_id" = '${ModulesName.FLIGHT}')`)
            .orderBy(`cart.id`, 'DESC')
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
                if (typeof value.message == "undefined") {

                    newCart['moduleInfo'] = value
                    newCart['is_available'] = true
                    cart.moduleInfo = [value]
                    await cart.save()
                } else {
                    newCart['is_available'] = false
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
            newCart['moduleId'] = cart.moduleId
            newCart['moduleInfo'] = cart.moduleInfo
            newCart['expiryDate'] = cart.expiryDate
            newCart['isDeleted'] = cart.isDeleted
            newCart['createdDate'] = cart.createdDate
            newCart['moduleId'] = cart.module.id
            newCart['type'] = cart.module.name
            newCart['travelers'] = cart.travelers
            responce.push(newCart)
        }
        return {
            data: responce,
            count: count
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

    async deleteFromCart(id: number, user: User) {

        let query = getConnection()
            .createQueryBuilder(Cart, "cart")
            .where(`("cart"."is_deleted" = false) AND ("cart"."user_id" = '${user.userId}') AND ("cart"."id" = ${id})`)


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
    }


    async bookCart(bookCart: CartBookDto, user: User, Headers) {
        const { payment_type, laycredit_points, card_token, instalment_type, additional_amount, booking_through, cart } = bookCart

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
        for await (const item of result) {
            if (item.moduleId == ModulesName.FLIGHT) {
                const dipatureDate = await this.flightService.changeDateFormat(item.moduleInfo[0].departure_date)
                if (smallestDate == '') {
                    smallestDate = dipatureDate;
                } else if (new Date(smallestDate) > new Date(dipatureDate)) {
                    smallestDate = dipatureDate;
                }
            }
        }
        let responce = []
        for await (const item of result) {
            switch (item.moduleId) {
                case ModulesName.FLIGHT:
                    let flightResponce = await this.bookFlight(item, user, Headers, bookCart, smallestDate)
                    responce.push(flightResponce)
                    break;

                default:
                    break;
            }
        }
        return {
            data: responce
        }
    }

    async bookFlight(cart: Cart, user: User, Headers, bookCart: CartBookDto, smallestDate: string) {
        const { payment_type, laycredit_points, card_token, instalment_type, additional_amount, booking_through } = bookCart
        const bookingType = cart.moduleInfo[0].routes.length > 1 ? 'RoundTrip' : 'oneway'
        let flightRequest;
        if (bookingType == 'oneway') {
            //console.log(cart.moduleInfo[0].adult_count);
            //console.log(cart.moduleInfo[0].child_count);
            //console.log(cart.moduleInfo[0].infant_count);

            //console.log(cart.moduleInfo[0]);


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
        newCart['type'] = cart.module.name
        if (typeof value.message == "undefined") {
            let travelers = []
            if (!cart.travelers.length) {
                newCart['responce'] = {
                    status: 422,
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
                    booking_through
                }
                //console.log(bookingdto);
                newCart['responce'] = await this.flightService.cartBook(bookingdto, Headers, user, smallestDate)
            }

        } else {
            newCart['responce'] = {
                message: value.message
            }
        }
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
        return newCart
    }
}
