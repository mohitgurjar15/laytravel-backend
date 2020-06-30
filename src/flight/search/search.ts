import { SearchFlight } from "./search-flight.interface";

export class Search{

    public searchFlight:SearchFlight;

    constructor(searchFlight:SearchFlight){

        this.searchFlight =searchFlight;
    }

    async oneWaySearch(params){

        const data = await this.searchFlight.oneWaySearch(params);
        return data;
    }

    async roundTripSearch(params){
        const data = await this.searchFlight.roundTripSearch(params);
        return data;
    }
}