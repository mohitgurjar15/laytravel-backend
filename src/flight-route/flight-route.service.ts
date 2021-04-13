import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { FlightRoute } from "src/entity/flight-route.entity";
import { LaytripCategory } from "src/entity/laytrip-category.entity";
import { User } from "src/entity/user.entity";
import { airports } from "src/flight/airports";
import { Activity } from "src/utility/activity.utility";
import { getConnection } from "typeorm";
import { AddFlightRouteDto } from "./dto/add-flight-route.dto";
import { EnableDisableFlightRouteDto } from "./dto/enable-disable-route.dto";
import { ImportRouteDto } from "./dto/import-route.dto";
import { ListFlightRouteDto } from "./dto/list-flight-route.dto";
import { UpdateFlightRouteDto } from "./dto/update-flight-route.dto";

@Injectable()
export class FlightRouteService {
    async listFlightRoutes(listFlightRouteDto: ListFlightRouteDto) {
        const {
            limit,
            page_no,
            search,
            status,
            category_id,
        } = listFlightRouteDto;
        let where = `("route"."is_deleted" = false)`;

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
        if (category_id) {
            where += `AND ("route"."category_id" = ${category_id} )`;
        }

        let [result, count] = await getConnection()
            .createQueryBuilder(FlightRoute, "route")
            .leftJoinAndSelect("route.category", "category")
            .where(where)
            .skip(skip)
            .take(take)
            .orderBy(`route.id`, "DESC")
            .getManyAndCount();

        if (!result) {
            throw new NotFoundException(
                `No any route available for given location`
            );
        }

        return { route: result, count };
    }

    async routesCounts() {
        const typeCount = await getConnection().query(
            `SELECT "type",COUNT(id) as "count" FROM "flight_route" WHERE "is_deleted" = false GROUP BY type`
        );

        const categoryCount = await getConnection().query(
            `SELECT (SELECT "name" FROM laytrip_category where laytrip_category.id = flight_route.category_id),COUNT(id) as "count" FROM "flight_route" WHERE "is_deleted" = false GROUP BY category_id`
        );

        const totalFlightRoutes = await getConnection().query(
            `SELECT COUNT(id) as "count" FROM "flight_route" WHERE "is_deleted" = false`
        );

        let responce = {};

        for await (const category of categoryCount) {
            responce[category.name] = category.count;
        }

        for await (const type of typeCount) {
            responce[type.type] = type.count;
        }

        responce["flight_route_count"] = totalFlightRoutes[0].count;
        // return {
        //     flight_route_count: totalFlightRoutes[0].count,
        //     category_count: categoryCount,
        //     type_count: typeCount,
        // };
        return responce;
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

        let dublicateRoutes = [];

        let parentRoute: FlightRoute;
        if (parentFromCode && parentToCode && parentToCode != parentFromCode) {
            let where = ` "route"."is_deleted" = false AND
            "route"."to_airport_code" = '${parentToCode}' AND
            "route"."from_airport_code" = '${parentFromCode}'`;

            const dublicate = await getConnection()
                .createQueryBuilder(FlightRoute, "route")
                .where(where)
                .getOne();
            if (dublicate) {
                let r = {
                    fromCode: parentFromCode,
                    ToCode: parentToCode,
                };
                dublicateRoutes.push(r);
                //throw new ConflictException("Given route already added.");
            } else {
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
        }

        for await (const fromCode of from_airport_codes) {
            const fromAirport = airports[fromCode.airport_code];
            for await (const toCode of to_airport_codes) {
                const toAirport = airports[toCode.airport_code];
                if (
                    parentFromCode != fromCode.airport_code ||
                    parentToCode != toCode.airport_code
                ) {
                    let where = ` "route"."is_deleted" = false AND
                            "route"."to_airport_code" = '${toAirport.code}' AND
                            "route"."from_airport_code" = '${fromAirport.code}'`;

                    const dublicate = await getConnection()
                        .createQueryBuilder(FlightRoute, "route")
                        .where(where)
                        .getOne();
                    if (dublicate) {
                        let r = {
                            fromCode: fromAirport.code,
                            ToCode: toAirport.code,
                        };
                        dublicateRoutes.push(r);
                        //throw new ConflictException(
                        //  "Given route already added."
                        //);
                    } else {
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
        }

        Activity.logActivity(
            user.userId,
            "flight-route",
            `Flight routes added in ${category.name} category`
        );

        return {
            message: `Your routes added in ${category.name} category`,
            dublicateRoutes,
        };
    }

    async enableDisableFlightRoute(
        id: number,
        enableDisableFlightRouteDto: EnableDisableFlightRouteDto,
        user: User
    ) {
        const { status } = enableDisableFlightRouteDto;
        const route = await getConnection()
            .createQueryBuilder(FlightRoute, "route")
            .where(`"id" = ${id} AND "is_deleted" = false`)
            .getOne();
        if (!route) {
            throw new NotFoundException("Given route not found.");
        }
        const previous = JSON.stringify(route);
        route.updateDate = new Date();
        route.updateBy = user.userId;
        route.status = status;

        const current = await route.save();
        Activity.logActivity(
            user.userId,
            "flight-route",
            `Flight route status changed successfully`,
            previous,
            JSON.stringify(current)
        );
        return {
            message: `Flight route status changed successfully`,
        };
    }

    async deleteFlightRoute(id: number, user: User) {
        const route = await getConnection()
            .createQueryBuilder(FlightRoute, "route")
            .where(`"id" = ${id} AND "is_deleted" = false`)
            .getOne();
        if (!route) {
            throw new ConflictException("Given route not found.");
        }
        const previous = JSON.stringify(route);
        route.updateDate = new Date();
        route.updateBy = user.userId;
        route.isDeleted = true;

        const current = await route.save();
        Activity.logActivity(
            user.userId,
            "flight-route",
            `Flight route deleted `,
            previous,
            JSON.stringify(current)
        );
        return {
            message: `Flight route deleted successfully`,
        };
    }

    async updateFlightRoute(
        id: number,
        updateFlightRouteDto: UpdateFlightRouteDto,
        user: User
    ) {
        const { category_id } = updateFlightRouteDto;
        const route = await getConnection()
            .createQueryBuilder(FlightRoute, "route")
            .where(`"id" = ${id} AND "is_deleted" = false`)
            .getOne();
        if (!route) {
            throw new ConflictException("Given route not found.");
        }

        const category = await getConnection()
            .createQueryBuilder(LaytripCategory, "category")
            .where(`"id" =:id `, { id: category_id })
            .getOne();

        if (!category) {
            throw new BadRequestException("Given category id not found.");
        }
        const previous = JSON.stringify(route);
        route.updateDate = new Date();
        route.updateBy = user.userId;
        route.categoryId = category_id;

        const current = await route.save();
        Activity.logActivity(
            user.userId,
            "flight-route",
            `Flight route deleted `,
            previous,
            JSON.stringify(current)
        );
        return {
            message: `Flight route updated successfully`,
        };
    }

    async importFlightRoute(
        importRouteDto: ImportRouteDto,
        file,
        userId: string,
        siteUrl: string
    ) {
        var count = 0;
        const unsuccessRecord = new Array();
        const csvData = [];
        const csv = require("csvtojson");
        const array = await csv().fromFile("./" + file[0].path);

        let errors = [];
        let dublicateRoutes = [];

        for (let index = 0; index < array.length; index++) {
            var row = array[index];
            if (row) {
                let categoryId = parseInt(row.category_id);
                if (
                    typeof airports[row.from_airport_code] != "undefined" &&
                    typeof airports[row.to_airport_code] != "undefined" &&
                    typeof categoryId == "number"
                ) {
                    var error_message = {};
                    const category = await getConnection()
                        .createQueryBuilder(LaytripCategory, "category")
                        .where(`"id" =:id `, { id: row.category_id })
                        .getOne();

                    if (!category) {
                        error_message[
                            "category_id"
                        ] = `Wrong category id for route ${row.from_airport_code} to ${row.to_airport_code}.`;

                        errors.push(error_message);
                    } else {
                        let where = ` "route"."is_deleted" = false AND
                        "route"."to_airport_code" = '${row.to_airport_code}' AND
                        "route"."from_airport_code" = '${row.from_airport_code}'`;

                        const dublicate = await getConnection()
                            .createQueryBuilder(FlightRoute, "route")
                            .where(where)
                            .getOne();
                        if (dublicate) {
                            let r = {
                                fromCode: row.from_airport_code,
                                ToCode: row.to_airport_code,
                            };
                            dublicateRoutes.push(r);
                            //throw new ConflictException("Given route already added.");
                        } else {
                            const fromAirport = airports[row.from_airport_code];
                            const toAirport = airports[row.to_airport_code];
                            const route = new FlightRoute();
                            route.categoryId = category.id;
                            route.createBy = userId;
                            route.parentRoute = null;
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
                            count++;
                        }
                    }
                } else {
                    var error_message = {};
                    if (typeof airports[row.from_airport_code] == "undefined") {
                        error_message[
                            "from_airport_code"
                        ] = `From Airport code ${row.from_airport_code} not found.`;
                    }
                    if (typeof airports[row.to_airport_code] == "undefined") {
                        error_message[
                            "to_airport_code"
                        ] = `To Airport code ${row.from_airport_code} not found.`;
                    }
                    if (!parseInt(row.category_id)) {
                        error_message[
                            "category_id"
                        ] = `Wrong category id for route ${row.from_airport_code} to ${row.to_airport_code}.`;
                    }
                    errors.push(error_message);
                }
            }
        }
        Activity.logActivity(userId, "flight-route", `Import flight route`);
        return { importCount: count, unsuccessRecord: errors, dublicateRoutes };
    }

    async getFlightRoute(id) {
        const route = await getConnection()
            .createQueryBuilder(FlightRoute, "route")
            .leftJoinAndSelect("route.category", "category")
            .where(`"route"."id" = ${id} AND "route"."is_deleted" = false`)
            .getOne();
        if (!route) {
            throw new ConflictException("Given route not found.");
        }
        return route;
    }
}
