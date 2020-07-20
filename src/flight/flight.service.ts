import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Strategy } from './strategy/strategy';
import { Static } from './strategy/static';
import { OneWaySearchFlightDto } from './dto/oneway-flight.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FlightRepository } from './flight.repository';
import { AirportRepository } from './airport.repository';
import { SeatAllocationRepository } from './seat-allocation.repository';
import { getManager } from 'typeorm';
import { Baggage } from 'src/entity/baggage.entity';
import { FlightRoute } from 'src/entity/flight-route.entity';
import { RouteIdsDto } from './dto/routeids.dto';
import { RoundtripSearchFlightDto } from './dto/roundtrip-flight.dto';

@Injectable()
export class FlightService {

    constructor(
        @InjectRepository(FlightRepository)
        private flightRepository:FlightRepository,

        @InjectRepository(AirportRepository)
        private airportRepository:AirportRepository,

        @InjectRepository(SeatAllocationRepository)
        private seatAllocationRepository:SeatAllocationRepository
    ){}
    
    async searchAirport(name:String){

        try{
            let result = await this.airportRepository.find({
                where : `("code" ILIKE '%${name}%' or "name" ILIKE '%${name}%' or "city" ILIKE '%${name}%' or "country" ILIKE '%${name}%') and status=true and is_deleted=false`,
                cache : {
                    id:'flight_search',
                    milliseconds:15000
                }
            })

            if(!result.length)
                throw new NotFoundException(`No Airport Found.&&&name`)
            return result;
        }
        catch(error){

            if (typeof error.response!=='undefined' && error.response.statusCode == 404) {
                throw new NotFoundException(`No Airport Found.`)
            }
            throw new InternalServerErrorException(error.message)
        }
    }

    async searchOneWayFlight(searchFlightDto:OneWaySearchFlightDto){

        const local = new Strategy(new Static(this.flightRepository));
        const result = new Promise((resolve) => resolve(local.oneWaySearch(searchFlightDto)));
        return result;
    }

    async baggageDetails(routeIdsDto:RouteIdsDto){

        const { routes } = routeIdsDto;

        let baggageResult =  await getManager()
            .createQueryBuilder(Baggage, "Baggage")
            .leftJoinAndSelect("Baggage.route","route")
            .leftJoinAndSelect("route.arrival","arrival")
            .leftJoinAndSelect("route.departure","departure")
            /* .select([
                "Baggage.freeAllowance",
                "Baggage.allowanceUnit",
                "route.departureId",
                "route.arrivalId"
            ]) */
            .where(`("Baggage"."route_id" in (:...routes)) and "Baggage"."status"=:status and "Baggage"."is_deleted"=:is_deleted`,{ routes, status:true, is_deleted:false})
            .getMany();
        
        let baggageDetails=[];
        if(baggageResult){

            baggageDetails = baggageResult.map(baggage=>{

                return {
                    route_id       : baggage.id,
                    arrival_id     : baggage.route.arrival.id,
                    arrival_code   : baggage.route.arrival.code,
                    departure_id   : baggage.route.departure.id,
                    departure_code : baggage.route.departure.code,
                    free_allowance : baggage.freeAllowance,
                    allowance_unit : baggage.allowanceUnit,
                }
            })
            return baggageDetails;
        }
        else{
            throw new NotFoundException(`No baggage details found(s)`)
        }
        
     }

     
     async cancellationPolicy(routeIdsDto:RouteIdsDto){

        const { routes } = routeIdsDto;

        let policyResult =  await getManager()
            .createQueryBuilder(FlightRoute, "FlightRoute")
            .leftJoinAndSelect("FlightRoute.arrival","arrival")
            .leftJoinAndSelect("FlightRoute.departure","departure")
            .select([
                "FlightRoute.id",
                "FlightRoute.isRefundable",
                "arrival.id",
                "arrival.code",
                "departure.code",
                "departure.code"
            ])
            .where(`("FlightRoute"."id" in (:...routes)) and "FlightRoute"."is_available"=:status and "FlightRoute"."is_deleted"=:is_deleted`,{ routes, status:true, is_deleted:false})
            .getMany();
        
         let policyDetails=[];
        if(policyResult){

            policyDetails = policyResult.map(policy=>{

                return {
                    route_id       : policy.id,
                    arrival_id     : policy.arrival.id,
                    arrival_code   : policy.arrival.code,
                    departure_id   : policy.departure.id,
                    departure_code : policy.departure.code,
                    is_refundable  : policy.isRefundable,
                }
            })
            return policyDetails;
        }
        else{
            throw new NotFoundException(`No cancellation policy found(s)`)
        } 
        
     }

     async searchRoundTripFlight(searchFlightDto:RoundtripSearchFlightDto){
        const local = new Strategy(new Static(this.flightRepository));
        const result = new Promise((resolve) => resolve(local.roundTripSearch(searchFlightDto)));
        return result;
     }
}
