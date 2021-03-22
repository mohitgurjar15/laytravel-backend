import { Injectable, NotFoundException } from "@nestjs/common";
import { FlightRoute } from "src/entity/flight-route.entity";
import { getConnection } from "typeorm";
import { ListFlightRouteDto } from "./dto/list-flight-route.dto";

@Injectable()
export class FlightRouteService {
    async listFlightRoutes(listFlightRouteDto: ListFlightRouteDto) {
        const { limit, page_no, search, status } = listFlightRouteDto;
        let where = `1=1`;

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

        if (status){
            where += `AND ("route"."status" = status`;
        }
            let result = await getConnection()
                .createQueryBuilder(FlightRoute, "route")
                .where(where)
                .getMany();

        if (!result) {
            throw new NotFoundException(
                `No any route available for given location`
            );
        }
    }
}
