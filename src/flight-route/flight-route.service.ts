import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotAcceptableException,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { errorMessage } from "src/config/common.config";
import { Airport } from "src/entity/airport.entity";
import { FlightRoute } from "src/entity/flight-route.entity";
import { LaytripCategory } from "src/entity/laytrip-category.entity";
import { User } from "src/entity/user.entity";
import { FlightRouteType } from "src/enum/flight-route-type.enum";
import { airports } from "src/flight/airports";
import { Activity } from "src/utility/activity.utility";
import { getConnection, getManager } from "typeorm";
import { AddFlightRouteDto } from "./dto/add-flight-route.dto";
import { BlacklistedUnblacklistedFlightRouteDto } from "./dto/blacklisted-unblacklisted-route.dto";
import { EnableDisableFlightRouteDto } from "./dto/enable-disable-route.dto";
import { ExportFlightRouteDto } from "./dto/export-flight-route.dto";
import { ImportRouteDto } from "./dto/import-route.dto";
import { ListAirportRouteDto } from "./dto/list-airport.dto";
import { ListCityDto } from "./dto/list-city.dto";
import { ListFlightRouteDto } from "./dto/list-flight-route.dto";
import { UpdateFlightRouteDto } from "./dto/update-flight-route.dto";

@Injectable()
export class FlightRouteService {
    async listFlightRoutes(listFlightRouteDto: ListFlightRouteDto) {
        try {
            const {
                limit,
                page_no,
                search,
                status,
                category_id,
                type
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

            if (type) {
                where += `AND ("route"."type" = '${type}' )`;
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
        } catch (error) {
            if (typeof error.response !== "undefined") {
                console.log("m");
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
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }
    async exportFlightRoutes(
        listFlightRouteDto: ExportFlightRouteDto,
        user: User
    ) {
        try {
            const { search, status, category_id } = listFlightRouteDto;
            let where = `("route"."is_deleted" = false)`;

            if (search) {
                where += `AND (("route"."to_airport_city" ILIKE '%${search}%')
            or("route"."to_airport_code" ILIKE '%${search}%')
            or("route"."to_airport_country" ILIKE '%${search}%') 
            or ("route"."to_airport_name" ILIKE '%${search}%') 
            or ("route"."from_airport_city" ILIKE '%${search}%')
            or("route"."from_airport_code" ILIKE '%${search}%')
            or("route"."from_airport_country" ILIKE '%${search}%') 
            or ("route"."from_airport_name" ILIKE '%${search}%')
            or ("route"."type" ILIKE '%${search}%'))`;
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
                .orderBy(`route.id`, "DESC")
                .getManyAndCount();

            if (!result) {
                throw new NotFoundException(
                    `No any route available for given location`
                );
            }

            Activity.logActivity(
                user.userId,
                "Flight Route",
                `Flight route export by admin`
            );

            return { route: result, count };
        } catch (error) {
            if (typeof error.response !== "undefined") {
                console.log("m");
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
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
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
        let domestic = 0;
        let international = 0;
        for await (const type of typeCount) {
            if (type.type == FlightRouteType.DOMESTIC) {
                domestic = parseFloat(type.count);
            }

            if (type.type == FlightRouteType.INTERNATIONAL) {
                international = parseFloat(type.count);
            }
        }

        responce[FlightRouteType.DOMESTIC] = domestic;
        responce[FlightRouteType.INTERNATIONAL] = international;

        responce["flight_route_count"] = totalFlightRoutes[0].count;
        // return {
        //     flight_route_count: totalFlightRoutes[0].count,
        //     category_count: categoryCount,
        //     type_count: typeCount,
        // };
        return responce;
    }

    async addFlightRoute(addFlightRouteDto: AddFlightRouteDto, user: User) {
        try {
            const {
                category_id,
                from_airport_codes,
                to_airport_codes,
                type,
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
                    if (
                        dublicate.categoryId == category.id &&
                        dublicate.type == type
                    ) {
                        let r = {
                            fromCode: parentFromCode,
                            ToCode: parentToCode,
                        };
                        dublicateRoutes.push(r);
                    }

                    dublicate.categoryId = category.id;
                    dublicate.updateBy = user.userId;
                    dublicate.status = true;
                    dublicate.type = type;
                    dublicate.updateDate = new Date();
                    await dublicate.save();

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
                    route.type = type;
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
                            if (
                                dublicate.categoryId == category.id &&
                                dublicate.type == type
                            ) {
                                let r = {
                                    fromCode: fromAirport.code,
                                    ToCode: toAirport.code,
                                };
                                dublicateRoutes.push(r);
                            }

                            dublicate.categoryId = category.id;
                            dublicate.updateBy = user.userId;
                            dublicate.status = true;
                            dublicate.updateDate = new Date();
                            dublicate.type = type;
                            await dublicate.save();
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
                            route.type = type;
                            await route.save();
                        }
                    }
                }
            }

            Activity.logActivity(
                user.userId,
                "Flight Route",
                `Flight routes added in ${category.name} category`
            );

            return {
                message: `Your routes added in ${category.name} category`,
                dublicateRoutes,
            };
        } catch (error) {
            if (typeof error.response !== "undefined") {
                console.log("m");
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
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
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
            "Flight Route",
            `Flight route status changed successfully`,
            previous,
            JSON.stringify(current)
        );
        return {
            message: `Flight route status changed successfully`,
        };
    }

    async listAirportRoutes(listAirportRouteDto: ListAirportRouteDto) {
        try {
            var {
                limit,
                page_no,
                code,
                city,
                country,
            } = listAirportRouteDto;
            let where = `("airport"."is_deleted" = false)`;
            // let results = await getConnection()
            //     .createQueryBuilder(Airport, "airport")
            //     .where(where)
            //     .orderBy(`airport.id`, "ASC")
            //     .getMany();
            // if (limit === 0) {
            //     limit = results.length
            // }
            const take = limit
            const skip = (page_no - 1) * take || 0;

            if (code) {
                where += `AND ("airport"."code" = '${code}' )`;

            }

            if (country) {
                where += `AND ("airport"."country" = '${country}' )`;
            }

            if (city) {
                where += `AND ("airport"."city" = '${city}' )`;
            }
            console.log(where)
            let query = await getConnection()
                .createQueryBuilder(Airport, "airport")
                .where(where)

                .orderBy(`airport.id`, "ASC")
            if (limit != 0) {
                query.skip(skip)
                    .take(take)
            }
            let [result, count] = await query.getManyAndCount();
            if (!result) {
                throw new NotFoundException(
                    `No any Airport available for given location`
                );
            }

            return { route: result, count };
        } catch (error) {
            if (typeof error.response !== "undefined") {
                console.log("m");
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
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async blacklistedUnblacklistedFlightRoute(
        blacklistedUnblacklistedFlightRouteDto: BlacklistedUnblacklistedFlightRouteDto,
        user: User
    ) {
        try {
            const { blackListedArray } = blacklistedUnblacklistedFlightRouteDto;
            for await (const data of blackListedArray) {
                const route = await getManager()
                    .createQueryBuilder(Airport, "airport")
                    .where(`"code"='${data.code}' AND "is_deleted" = false`)
                    .getOne();
                if (!route) {
                    throw new NotFoundException("Given route not found.");
                }
                const previous = JSON.stringify(route);
                route.updateDate = new Date();
                route.updateBy = user.userId;
                route.isBlackListed = data.is_blacklisted;
                const current = await route.save();
                Activity.logActivity(
                    user.userId,
                    "All Airport",
                    `All Airport Blacklisted status changed successfully`,
                    previous,
                    JSON.stringify(current)
                );
            }

            return {
                message: `All Airport Blacklisted status changed successfully`,
            };
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
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async getFlightCode() {
        var andWhere = {
            isDeleted: false,
        }
        let [result] = await getConnection()
            .createQueryBuilder(Airport, "airport")
            .where(andWhere)
            .orderBy(`airport.code`, "ASC")
            .getManyAndCount();

        if (!result.length) {
            throw new NotFoundException('no data found')
        }

        let responce = [];
        for await (const item of result) {
            if (item.code) {
                responce.push(item.code)
            }
        }
        return {
            data: responce
        }
    }

    async getFlightCountry() {
        let results = await getManager()
            .createQueryBuilder(Airport, "airports")
            .select([
                "airports.country"
            ])
            .distinctOn(["airports.country"])
            .getMany()

        if (!results.length) {
            throw new NotFoundException('no data found')
        }

        let responce = [];
        for await (const item of results) {
            if (item.country) {
                responce.push(item.country)
            }
        }
        return {
            data: responce
        }
    }

    async getFlightCity(listCityDto: ListCityDto) {
        const {
            country
        } = listCityDto;
        console.log(country)
        var andWhere = `("airport"."is_deleted" = false)`
        if (country) {
            andWhere += ` AND ("airport"."country" = '${country}' )`;

        }
        console.log(andWhere)
        let results = await getManager()
            // .createQueryBuilder(Airport, "airports")
            // .select([
            //     "airports.city"
            // ])
            // .where(andWhere)
            // .getMany()
            .createQueryBuilder(Airport, "airport")
            .select("airport.city")
            .where(andWhere)
            .getMany();
        if (!results.length) {
            throw new NotFoundException('no data found')
        }

        let responce = [];
        console.log(results)
        for await (const item of results) {
            if (item.city) {
                responce.push(item.city)
            }
        }
        return {
            data: responce
        }
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
            "Flight Route",
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
        try {
            const { category_id, type } = updateFlightRouteDto;
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
            route.type = type;
            route.categoryId = category_id;

            const current = await route.save();
            Activity.logActivity(
                user.userId,
                "Flight Route",
                `Flight route updated.`,
                previous,
                JSON.stringify(current)
            );
            return {
                message: `Flight route updated successfully`,
            };
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
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async importFlightRoute(
        importRouteDto: ImportRouteDto,
        file,
        userId: string,
        siteUrl: string
    ) {
        try {
            var count = 0;
            const unsuccessRecord = new Array();
            const csvData = [];
            const csv = require("csvtojson");
            const array = await csv().fromFile("./" + file[0].path);

            let errors = [];
            let dublicateRoutes = [];
            let updatedRoutes = [];

            for (let index = 0; index < array.length; index++) {
                var row = array[index];
                if (row) {
                    let categoryId = parseInt(row.category_id);
                    if (
                        typeof airports[row.from_airport_code] != "undefined" &&
                        typeof airports[row.to_airport_code] != "undefined" &&
                        row.category_id &&
                        typeof categoryId == "number" &&
                        (row.type == FlightRouteType.DOMESTIC ||
                            row.type == FlightRouteType.INTERNATIONAL)
                    ) {
                        var error_message = {};
                        const category: LaytripCategory = await getConnection()
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
                                if (
                                    dublicate.categoryId == category.id &&
                                    dublicate.type == row.type
                                ) {
                                    let r = {
                                        fromCode: row.from_airport_code,
                                        ToCode: row.to_airport_code,
                                        category: category.id,
                                        type: row.type,
                                        category_id: `Route ${row.from_airport_code} to ${row.to_airport_code}, category ${category.name} and type ${row.type} is already exist.`,
                                    };
                                    errors.push(r);
                                }

                                dublicate.categoryId = category.id;
                                dublicate.updateBy = userId;
                                dublicate.status = true;
                                dublicate.updateDate = new Date();
                                dublicate.type = row.type;
                                await dublicate.save();
                                count++;

                                let r = {
                                    fromCode: row.from_airport_code,
                                    ToCode: row.to_airport_code,
                                };
                                updatedRoutes.push(r);
                                //throw new ConflictException("Given route already added.");
                            } else {
                                const fromAirport =
                                    airports[row.from_airport_code];
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
                                route.type = row.type;
                                route.createDate = new Date();
                                route.isDeleted = false;
                                await route.save();
                                count++;
                            }
                        }
                    } else {
                        var error_message = {};
                        error_message["fromCode"] = row.from_airport_code;
                        error_message["ToCode"] = row.to_airport_code;

                        if (
                            typeof airports[row.from_airport_code] ==
                            "undefined"
                        ) {
                            error_message[
                                "from_airport_code"
                            ] = `From Airport code ${row.from_airport_code} not found.`;
                        }
                        if (
                            typeof airports[row.to_airport_code] == "undefined"
                        ) {
                            error_message[
                                "to_airport_code"
                            ] = `To Airport code ${row.from_airport_code} not found.`;
                        }
                        if (!row.category_id) {

                            error_message[
                                "category_id"
                            ] = `Route ${row.from_airport_code} to ${row.to_airport_code} in Category Id missing.`;

                        } else if (!parseInt(row.category_id)) {
                            error_message[
                                "category_id"
                            ] = `Wrong category id for route ${row.from_airport_code} to ${row.to_airport_code}.`;
                        }
                        if (
                            row.type != FlightRouteType.DOMESTIC &&
                            row.type != FlightRouteType.INTERNATIONAL
                        ) {
                            error_message[
                                "type"
                            ] = `Add valid route type for route ${row.from_airport_code} to ${row.to_airport_code}.`;
                        }

                        errors.push(error_message);
                    }
                }
            }
            Activity.logActivity(userId, "Flight Route", `Import flight route`);
            return {
                importCount: count,
                unsuccessRecord: errors,
                dublicateRoutes,
                updatedRoutes,
            };
        } catch (error) {
            if (typeof error.response !== "undefined") {
                console.log("m");
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
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
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
