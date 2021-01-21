import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class CartService {

    constructor(
        private flightService: FlightService,
        private vacationService: VacationRentalService
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
            // console.log(flightInfo[0].adult_count);
            // console.log(travelersCount);

            // const 
            // travelersCount= travelersCount + 
            // console.log(flightInfo[0].child_count);
            // console.log(travelersCount);

            // travelersCount = travelersCount + flightInfo[0].infant_count ? parseInt(flightInfo[0].infant_count) : 0
            // console.log(travelersCount);

            // console.log(travelersCount);
            // console.log(travelers.length);


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
                data:savedCart
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
        // console.log(homeInfo);
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

    async listCart(user: User, headers) {
        var tDate = new Date();

        var todayDate = tDate.toISOString().split(' ')[0];
        todayDate = todayDate
            .replace(/T/, " ") // replace T with a space
            .replace(/\..+/, "");

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
                "userData.roleId",
                "userData.email",
                "userData.firstName",
                "userData.middleName"])

            .where(`(DATE("cart"."expiry_date") >= DATE('${todayDate}') )  AND ("cart"."is_deleted" = false) AND ("cart"."user_id" = '${user.userId}') `)
            .orderBy(`cart.id`, 'DESC')

        const [result, count] = await query.getManyAndCount();

        if (!result.length) {
            throw new NotFoundException(`Cart is empty`)
        }
        let responce = []
        for await (const cart of result) {
            let newCart = {}
            newCart['oldModuleInfo'] = cart.moduleInfo
            const bookingType = cart.moduleInfo[0].routes.length > 1 ? 'RoundTrip' : 'oneway'
            newCart['bookingType'] = bookingType
            const value = await this.flightAvailiblity(bookingType, cart, user, headers)
            if (typeof value.message == undefined) {
                newCart['moduleInfo'] = value
                newCart['is_available'] = true
                cart.moduleInfo = [value]
                await cart.save()
            }
            else {
                newCart['is_available'] = false
            }
            newCart['id'] = cart.id
            newCart['userId'] = cart.userId
            newCart['moduleId'] = cart.moduleId
            newCart['moduleInfo'] = cart.moduleInfo
            newCart['expiryDate'] = cart.expiryDate
            newCart['isDeleted'] = cart.isDeleted
            newCart['createdDate'] = cart.createdDate
            newCart['moduleId'] = cart.module.id
            newCart['moduleName'] = cart.module.name
            newCart['travelers'] = cart.travelers
            responce.push(newCart)
        }
        return {
            data: responce,
            count: count
        }
    }

    async flightAvailiblity(bookingType, cart, user, headers) {
        let flights: any = null;

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
            console.log('oneway dto', dto)
            flights = await this.flightService.searchOneWayFlight(dto, headers, user);

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
            flights = await this.flightService.searchOneWayFlight(dto, Headers, user);
        }
        var match = 0;
        for await (const flight of flights.items) {
            if (flight.unique_code == cart.moduleInfo[0].unique_code) {
                match = match + 1
                return flight;
            }
        }

        if (match == 0) {
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
        cartItem.isDeleted = true;

        cartItem.save();

        return {
            message: `Item removed successfully`
        }
    }
}
