import { StrategyVacationRental } from "./strategy.interface";

export class MonakerStrategy{
    
    public strategyVacationRental:StrategyVacationRental;

    constructor(searchVacationRental : StrategyVacationRental){
        this.strategyVacationRental = searchVacationRental;
    }

    async availabilityVacationRental(param1){
        const data = await this.strategyVacationRental.vacationRentalAvaiability(param1);
        return data;
    }
    
}