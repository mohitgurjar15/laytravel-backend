import { Repository, EntityRepository } from "typeorm";
import { FlightRoute } from "src/entity/flight-route.entity";

@EntityRepository(FlightRoute)
export class FlightRepository extends Repository<FlightRoute>{
    
}