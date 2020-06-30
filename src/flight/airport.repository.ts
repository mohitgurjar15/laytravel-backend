import { Repository, EntityRepository } from "typeorm";
import { Airport } from "src/entity/airport.entity";

@EntityRepository(Airport)
export class AirportRepository extends Repository<Airport>{
    
}