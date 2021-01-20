import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'src/entity/user.entity';
import { ModulesName } from 'src/enum/module.enum';
import { FlightService } from 'src/flight/flight.service';
import { DateTime } from 'src/utility/datetime.utility';
import { AddInCartDto } from './dto/add-in-cart.dto';
import * as moment from 'moment';
import { Cart } from 'src/entity/cart.entity';
import { getConnection } from 'typeorm';
import { VacationRentalService } from 'src/vacation-rental/vacation-rental.service';

@Injectable()
export class CartService {

    constructor(
        private flightService: FlightService,
        private vacationService: VacationRentalService
    ) { }

    async addInCart(addInCartDto: AddInCartDto, user: User, Header) {
        const { module_id, route_code, property_id, room_id, rate_plan_code, check_in_date, check_out_date, adult_count, number_and_children_ages = [], payment_type, instalment_type, travelers } = addInCartDto
        switch (module_id) {
            case ModulesName.HOTEL:
                break;

            case ModulesName.FLIGHT:
                return await this.addFlightDataInCart(route_code, user, Header,payment_type, instalment_type, travelers);
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

    async addFlightDataInCart(route_code: string, user: User, Header,payment_type :string, instalment_type : string, travelers) {
        const flightInfo: any = await this.flightService.airRevalidate({ route_code: route_code }, Header, user);

        if (flightInfo) {

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
            cart.instalmentType = instalment_type;
            cart.paymentType = payment_type

            await cart.save();

            return {
                message: `Flight added to cart`
            }
        }
        else {
            throw new NotFoundException(`flight not available`)
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

    async listCart(user: User) {
        var tDate = new Date();

        var todayDate = tDate.toISOString().split(' ')[0];
        todayDate = todayDate
            .replace(/T/, " ") // replace T with a space
            .replace(/\..+/, "");

        let query = getConnection()
            .createQueryBuilder(Cart, "cart")
            .leftJoinAndSelect("cart.module", "module")
            .select(["cart.id",
                "cart.userId",
                "cart.moduleId",
                "cart.moduleInfo",
                "cart.expiryDate",
                "cart.isDeleted",
                "cart.createdDate",
                "cart.paymentType",
                "cart.instalmentType",
                "module.id",
                "module.name"])

            .where(`(DATE("cart"."expiry_date") >= DATE('${todayDate}') )  AND ("cart"."is_deleted" = false) AND ("cart"."user_id" = '${user.userId}') `)
            .orderBy(`cart.id`, 'DESC')

        const [result, count] = await query.getManyAndCount();

        if (!result.length) {
            throw new NotFoundException(`Cart is empty`)
        }
        return {
            data: result,
            count: count
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
