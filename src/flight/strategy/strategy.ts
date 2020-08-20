import { StrategyAirline } from "./strategy.interface";

export class Strategy{

    public airline:StrategyAirline;

    constructor(searchFlight:StrategyAirline){

        this.airline =searchFlight;
    }

    async oneWaySearch(param1,param2){

        const data = await this.airline.oneWaySearch(param1,param2);
        return data;
    }

    async roundTripSearch(params){
        const data = await this.airline.roundTripSearch(params);
        return data;
    }

    async baggageDetails(params){
        const data = await this.airline.baggageDetails(params);
        return data;
    }

    async airRevalidate(params){
        const data = await this.airline.airRevalidate(params);
        return data;
    }

    async bookFlight(params1,params2){
        const data = await this.airline.bookFlight(params1,params2);
        return data;
    }
}