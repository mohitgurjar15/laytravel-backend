import { FlightRoute } from "src/entity/flight-route.entity";
import { getManager } from "typeorm";
import * as moment from 'moment';
import { flightDataUtility } from "./flight-data.utility";
import { NotFoundException } from "@nestjs/common";

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
        /* return {
            id: 21,
            parentBy: null,
            categoryId: 2,
            fromAirportCode: 'BOS',
            fromAirportName: 'Logan Intl.',
            fromAirportCity: 'Boston',
            fromAirportCountry: 'USA',
            toAirportCode: 'LAX',
            toAirportName: 'All Airports',
            toAirportCity: 'Los Angeles',
            toAirportCountry: 'USA',
            createBy: 'df1c38f6-954b-4947-b202-d50c2fece143',
            updateBy: null,
            createDate: '2021-03-03T07:06:53.011Z',
            status: true,
            isDeleted: false,
            updateDate: null,
            category : {
              id: 2,
              name: 'Gold',
              createBy: 'df1c38f6-954b-4947-b202-d50c2fece143',
              installmentAvailableAfter: 30,
              updateBy: null,
              createDate: '2021-03-02T07:00:33.637Z',
              status: true,
              updateDate: null
            }
          } */

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
                return { available: true, categoryId: routeDetails?.category?.id };
            } else {
                return { available: false, categoryId: routeDetails?.category?.id }
            }
            
        }
        else {
            return { available: false };
        }
    }
}