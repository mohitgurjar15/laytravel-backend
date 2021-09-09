import { FlightRoute } from "src/entity/flight-route.entity";
import { getManager } from "typeorm";
import * as moment from 'moment';
import { flightDataUtility } from "./flight-data.utility";
import { NotFoundException } from "@nestjs/common";
import { LaytripCategory } from "src/entity/laytrip-category.entity";

export class RouteCategory {

    /**
     * Function to get route category and installment avaiblibity details
     */
    static async flightRouteAvailability(departureCode: string, arrivalCode: string) {

        let data = await flightDataUtility.getFlightRoutes(departureCode, arrivalCode)

        let routeDetails = await getManager()
            .createQueryBuilder(FlightRoute, "flight_route")
            .where("flight_route.from_airport_code In (:...departureCode) and flight_route.to_airport_code In (:...arrivalCode)", { departureCode: data.fromLocations, arrivalCode: data.toLocations })
            .leftJoinAndSelect("flight_route.category", "category")
            .getOne();
        return routeDetails;
    }

    static async checkInstalmentEligibility(searchData: { departure: string, arrival: string, checkInDate: string }
        ) {
    
        let dayDiffernce = moment(searchData.checkInDate).diff(moment().format("YYYY-MM-DD"), 'days')
        //return true;
        if (dayDiffernce >= 30) {

            let routeDetails = await getManager()
                .createQueryBuilder(FlightRoute, "flight_route")
                .where("flight_route.from_airport_code In (:departureCode) and flight_route.to_airport_code In (:arrivalCode) and is_deleted=false", { departureCode: searchData.departure, arrivalCode: searchData.arrival })
                .leftJoinAndSelect("flight_route.category", "category")
                .getOne();
                if (routeDetails?.category?.isInstallmentAvailable) {
                    return { available: true, categoryId: routeDetails?.category?.id, categoryName : routeDetails?.category?.name };
                } 
                else {
                    let categoryDetails = await getManager()
                    .createQueryBuilder(LaytripCategory, "laytrip_category")
                    .where("laytrip_category.name = :name ", { name:'Unclear' })
                    .getOne();
                    return { available: categoryDetails.isInstallmentAvailable, categoryId: categoryDetails.id, categoryName : categoryDetails.name }
                }
        }
        else {
            return { available: false };
        }
    }
}