import { Repository, EntityRepository } from "typeorm";
import { SeatAllocation } from "src/entity/seat-allocation.entity";

@EntityRepository(SeatAllocation)
export class SeatAllocationRepository extends Repository<SeatAllocation>{
    
}