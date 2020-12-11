import { StrategyVacationRental } from "./strategy.interface";

export class MonakerStrategy{
    
    public strategyVacationRental:StrategyVacationRental;

    constructor(searchVacationRental : StrategyVacationRental){
        this.strategyVacationRental = searchVacationRental;
    }

    async checkAllavaiability(param1,param2){
        const data = await this.strategyVacationRental.checkAllavaiability(param1,param2);
        return data;
    }
    
    async unitTypeListAvailability(param1,param2){
        const data = await this.strategyVacationRental.unitTypeListAvailability(param1,param2);

        return data;
    }

    async verifyUnitTypeAvailability(param1,param2){
        const data = await this.strategyVacationRental.verifyUnitTypeAvailability(param1,param2);

        return data;
    }

    async booking(param1,param2,param3,param4){
        const data = await this.strategyVacationRental.booking(param1,param2,param3,param4);
        return data;
    }

    async deleteBooking(param1){
        const data = await this.strategyVacationRental.deleteBooking(param1);
        return data;
    }
}