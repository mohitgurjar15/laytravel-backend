import { FlightRoute } from "src/entity/flight-route.entity";
import { getManager } from "typeorm";
import * as moment from 'moment';

export class RouteCategory{

    /**
     * Function to get route category and installment avaiblibity details
     */
    static async flightRouteAvailability(departureCode:string,arrivalCode:string){

        let routeDetails = await getManager()
                    .createQueryBuilder(FlightRoute, "flight_route")
                    .where("flight_route.from_airport_code = :departureCode and flight_route.to_airport_code=:arrivalCode", { departureCode,arrivalCode })
                    .leftJoinAndSelect("flight_route.category", "category")
                    .getOne();
        //return routeDetails;
        return {
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
          }
          
    }

    static checkInstalmentEligibility(checkInDate,bookingDate,days){

        let dayDiffernce = moment(checkInDate).diff(moment(bookingDate), 'days')
        return true;
        /* if(days>0 && dayDiffernce>=days){
            return true;
        }
        else{
            return false;
        } */
    }
}