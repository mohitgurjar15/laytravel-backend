import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { FlightRoute } from "src/entity/flight-route.entity";
import { LaytripCategory } from "src/entity/laytrip-category.entity";
import { User } from "src/entity/user.entity";
import { airports } from "src/flight/airports";
import { getConnection } from "typeorm";
import { AddFlightRouteDto } from "./dto/add-flight-route.dto";
import { EnableDisableFlightRouteDto } from "./dto/enable-disable-route.dto";
import { ListFlightRouteDto } from "./dto/list-flight-route.dto";

@Injectable()
export class FlightRouteService {
    async listFlightRoutes(listFlightRouteDto: ListFlightRouteDto) {
        const { limit, page_no, search, status } = listFlightRouteDto;
        let where = `1=1`;

        const take = limit || 10;
        const skip = (page_no - 1) * limit || 0;

        if (search) {
            where += `AND (("route"."to_airport_city" ILIKE '%${search}%')
            or("route"."to_airport_code" ILIKE '%${search}%')
            or("route"."to_airport_country" ILIKE '%${search}%') 
            or ("route"."to_airport_name" ILIKE '%${search}%') 
            or ("route"."from_airport_city" ILIKE '%${search}%')
            or("route"."from_airport_code" ILIKE '%${search}%')
            or("route"."from_airport_country" ILIKE '%${search}%') 
            or ("route"."from_airport_name" ILIKE '%${search}%'))`;
        }

        if (status) {
            where += `AND ("route"."status" = ${status} )`;
        }
        let [result, count] = await getConnection()
            .createQueryBuilder(FlightRoute, "route")
            .where(where)
            .skip(skip)
            .take(take)
            .getManyAndCount();

        if (!result) {
            throw new NotFoundException(
                `No any route available for given location`
            );
        }

        return { route: result, count };
    }

    async addFlightRoute(addFlightRouteDto: AddFlightRouteDto, user: User) {
        const {
            category_id,
            from_airport_codes,
            to_airport_codes,
        } = addFlightRouteDto;

        const category = await getConnection()
            .createQueryBuilder(LaytripCategory, "category")
            .where(`"id" =:id `, { id: category_id })
            .getOne();

        if (!category) {
            throw new BadRequestException("Given category id not found.");
        }

        let where = ` 
            "route"."to_airport_code" = '${to_airport_codes}' AND
            "route"."from_airport_code" = '${from_airport_codes}'`;

        const dublicate = await getConnection()
            .createQueryBuilder(FlightRoute, "route")
            .where(where)
            .getOne();
        if (dublicate) {
            throw new ConflictException("Given route already added.");
        }

        let parentFromCode = "";
        let parentToCode = "";
        let parentFromCount = 0;
        for await (const airport of from_airport_codes) {
            if (airport.is_parent == true) {
                parentFromCount++;
                parentFromCode = airport.airport_code;
            }
            if (typeof airports[airport.airport_code] == "undefined") {
                throw new BadRequestException(
                    `${airport.airport_code} is not available please check it`
                );
            }
        }
        if (parentFromCount > 1) {
            throw new BadRequestException(
                "You have pass only one parent in from locations"
            );
        }
        let parentToCount = 0;
        for await (const airport of to_airport_codes) {
            if (airport.is_parent == true) {
                parentToCount++;
                parentToCode = airport.airport_code;
            }
            if (typeof airports[airport.airport_code] == "undefined") {
                throw new BadRequestException(
                    `${airport.airport_code} is not available please check it`
                );
            }
        }
        if (parentToCount > 1) {
            throw new BadRequestException(
                "You have pass only one parent in to locations"
            );
        }

        let parentRoute: FlightRoute;
        if (parentFromCode && parentToCode && parentToCode != parentToCode) {
            const fromAirport = airports[parentFromCode];
            const toAirport = airports[parentToCode];
            const route = new FlightRoute();
            route.categoryId = category.id;
            route.createBy = user.userId;
            route.fromAirportCity = fromAirport.city;
            route.fromAirportCode = fromAirport.code;
            route.fromAirportCountry = fromAirport.country;
            route.fromAirportName = fromAirport.name;
            route.toAirportCity = toAirport.city;
            route.toAirportCode = toAirport.code;
            route.toAirportCountry = toAirport.country;
            route.toAirportName = toAirport.name;
            route.status = true;
            route.isDeleted = false;
            route.createDate = new Date();
            parentRoute = await route.save();
        }

        for await (const fromCode of from_airport_codes) {
            const fromAirport = airports[fromCode.airport_code];
            for await (const toCode of to_airport_codes) {
                const toAirport = airports[toCode.airport_code];
                if (
                    parentFromCode != fromCode.airport_code ||
                    parentToCode != toCode.airport_code
                ) {
                    const route = new FlightRoute();
                    route.categoryId = category.id;
                    route.createBy = user.userId;
                    route.parentRoute = parentRoute || null;
                    route.fromAirportCity = fromAirport.city;
                    route.fromAirportCode = fromAirport.code;
                    route.fromAirportCountry = fromAirport.country;
                    route.fromAirportName = fromAirport.name;
                    route.toAirportCity = toAirport.city;
                    route.toAirportCode = toAirport.code;
                    route.toAirportCountry = toAirport.country;
                    route.toAirportName = toAirport.name;
                    route.status = true;
                    route.createDate = new Date();
                    route.isDeleted = false;
                    await route.save();
                }
            }
        }

        return {
            message: `Your routes added in ${category.name} category`,
        };
    }

    async enableDisableFlightRoute(
        id: number,
        enableDisableFlightRouteDto : EnableDisableFlightRouteDto,
        user : User
    ) {
        const {status} = enableDisableFlightRouteDto
        const route = await getConnection()
            .createQueryBuilder(FlightRoute, "route")
            .where(`id = ${id} `)
            .getOne();
        if (route) {
            throw new ConflictException("Given route not found.");
        }

        route.updateDate = new Date()
        route.updateBy = user.userId
        route.status = status

        await route.save()

        return {
            message : `Flight route status changed successfully`
        }
    }
}
