import { StrategyAirline } from "./strategy.interface";

export class Strategy{

    public airline:StrategyAirline;

    constructor(searchFlight:StrategyAirline){

        this.airline =searchFlight;
    }

    async oneWaySearch(params){

        const data = await this.airline.oneWaySearch(params);
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
}