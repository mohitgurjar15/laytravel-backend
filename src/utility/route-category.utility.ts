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
        return routeDetails;
    }

    static checkInstalmentEligibility(checkInDate,bookingDate,days){

        let dayDiffernce = moment(checkInDate).diff(moment(bookingDate), 'days')
        //console.log(days,dayDiffernce,"dayDiffernce")
        if(days>0 && dayDiffernce>=days){
            return true;
        }
        else{
            return false;
        }
    }
}