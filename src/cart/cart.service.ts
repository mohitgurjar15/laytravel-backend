import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'src/entity/user.entity';
import { ModulesName } from 'src/enum/module.enum';
import { FlightService } from 'src/flight/flight.service';
import { DateTime } from 'src/utility/datetime.utility';
import { AddInCartDto } from './dto/add-in-cart.dto';
import * as moment from 'moment';
import { Cart } from 'src/entity/cart.entity';
import { getConnection } from 'typeorm';

@Injectable()
export class CartService {

    constructor(
        private flightService: FlightService,
    ) { }

    async addInCart(addInCartDto: AddInCartDto, user: User, Header) {
        const { module_id, route_code } = addInCartDto
        switch (module_id) {
            case ModulesName.HOTEL:
                break;

            case ModulesName.FLIGHT:
                return await this.addFlightDataInCart(route_code, user, Header);
                break;

            default:
                break;
        }
    }

    async addFlightDataInCart(route_code: string, user: User, Header) {
        const flightInfo: any = await this.flightService.airRevalidate({ route_code: route_code }, Header, user);

        if (flightInfo) {
            console.log(flightInfo[0].departure_date);

            const depatureDate = flightInfo[0].departure_date;

            console.log(depatureDate);

            const formatedDepatureDate = DateTime.convertDateFormat(depatureDate, 'DD/MM/YYYY', 'YYYY-MM-DD')

            console.log(formatedDepatureDate);

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

            await cart.save();

            return {
                message: `Flight added to cart`
            }
        }
        else {
            throw new NotFoundException(`flight not available`)
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
                "module.id",
                "module.name"])

            .where(`(DATE("cart"."expiry_date") >= DATE('${todayDate}') )  AND ("cart"."is_deleted" = false) AND ("cart"."user_id" = '${user.userId}') `)
            .orderBy(`cart.id`,'DESC')

        const [result , count] = await query.getManyAndCount();

        if(!result.length)
        {
            throw new NotFoundException(`Cart is empty`)
        }
        return {
            data : result,
            count:count
        }
    }

    async deleteFromCart(id:number,user: User) {
        
        let query = getConnection()
            .createQueryBuilder(Cart, "cart")
            .where(`("cart"."is_deleted" = false) AND ("cart"."user_id" = '${user.userId}') AND ("cart"."id" = ${id})`)
            

        const cartItem =  await query.getOne();

        if(!cartItem)
        {
            throw new NotFoundException(`Given item not found`)
        }
        cartItem.isDeleted = true;

        cartItem.save();

        return {
            message:`Item removed successfully`
        }
    }
}
