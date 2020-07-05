import { SearchFlight } from "./search-flight.interface";
import { SearchFlightDto } from "../dto/search-flight.dto";
import { json } from "express";
import { async } from "rxjs/internal/scheduler/async";
import { createQueryBuilder, getManager } from "typeorm";
import { SeatPlan } from "src/entity/seat-plan.entity";
import { SeatAllocation } from "src/entity/seat-allocation.entity";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { Airport } from "src/entity/airport.entity";


export class Static implements SearchFlight{

    private flightRepository;
    private seatAllocationRepository;
    constructor(flightRepository,seatAllocationRepository){
        this.flightRepository = flightRepository;
        this.seatAllocationRepository = seatAllocationRepository;
    }

    async oneWaySearch(searchFlightDto:SearchFlightDto){

        const {
            source_location,
            destination_location,
            departure_date,
            flight_class
        } = searchFlightDto;

        let departurePort =  await getManager()
                .createQueryBuilder(Airport, "Airport")
                .where(`("Airport"."code"=:source_location)`,{ source_location})
                .getOne(); 

        let departureId;
        let arrivalId;

        if(!departurePort)
            throw new BadRequestException(`Please send valid source airport id`)
        
        
        departureId =departurePort.id; 
        
        let arrivalPort =  await getManager()
            .createQueryBuilder(Airport, "Airport")
            .where(`("Airport"."code"=:destination_location)`,{ destination_location})
            .getOne();
        
        if(!arrivalPort)
            throw new BadRequestException(`Please send valid arrival airport id`)
        
        arrivalId = arrivalPort.id;


        var d = new Date();
        var time = `${d.getHours()}:${d.getMinutes()}`;
        var today = d.getFullYear() + "-" + ('0' + (d.getMonth()+1)).slice(-2) + "-" + d.getDate();
        
        console.log(today,time)
       
        let searchResult=[];

        const result = await this.flightRepository.find({
            join: {
                alias: 'flight_route',
                leftJoinAndSelect: {
                    arrival: 'flight_route.arrival',
                    departure: 'flight_route.departure',
                    flight: 'flight_route.flight'
                }
            },
            where: qb => {
                qb.where().
                    orWhere(`("arrival"."id" = :arrivalId OR "departure"."id"=:departureId)`,{arrivalId:arrivalId,departureId:departureId}).
                    andWhere(`"flight"."class"=:flight_class`,{flight_class:flight_class}).
                    andWhere(departure_date==today ? (`"departure_time">=:departure_time`): `1=1`,{departure_time:time}) 
            }
        });

        if(result.length > 0){
            
             result.forEach(async (res,i) => {
                
                let routeId = res.id;
                let flightId = res.flight.id;
                let occupiedSeat = await getManager()
                .createQueryBuilder(SeatAllocation, "SeatAllocation")
                .where(`("SeatAllocation"."route_id"=:routeId and "SeatAllocation"."date"=:departure_date) or ( "is_confirm"!=:is_confirm )`,{ routeId,departure_date,is_confirm:2 })
                .getMany();

                let totalSeat =  await getManager()
                .createQueryBuilder(SeatPlan, "SeatPlan")
                .where(`("SeatPlan"."flight_id"=:flightId and "SeatPlan"."is_enabled"=:is_enabled)`,{ flightId,is_enabled:true })
                .getMany(); 

                const availableSeat = totalSeat.length - occupiedSeat.length;
                
                if(availableSeat == 0)
                    delete result[i];
            });
        }

        let searchItem={ stop:0, route_details: [] };
        
        if(result.length){

            for(let i=0; i < result.length; i++){
                    
                searchItem={ stop:0, route_details: [] };
                if(result[i].departure.id ===departureId && result[i].arrival.id===arrivalId){
                
                searchItem.stop=1;
                searchItem.route_details.push(result[i]);
                searchResult.push(searchItem)
                }
                
                else{
                    if(result[i].departure.id==departureId){
                            
                        let xArrivalId = result[i].arrival.id;
                        searchItem.route_details.push(result[i])
                        
                        result.forEach((res,j)=>{
                            
                            if(res.departure.id === xArrivalId && (res.departure.id !==departureId) && i!=j){
                                searchItem.route_details.push(res);
                                xArrivalId = res.arrival.arrivalId;
                            }
                            
                            if(xArrivalId==arrivalId)
                                return
                                
                        })
                        
                        searchItem.stop = searchItem.route_details.length;
                        if(searchItem.route_details[searchItem.route_details.length-1].arrival.id!=arrivalId)
                            continue;
                        else
                            searchResult.push(searchItem)
                        
                    }
                }
            }

            if(!searchResult.length)
                throw new NotFoundException(`No search result found.`)
        }
        else{

            throw new NotFoundException(`No search result found.`)
        }
        return searchResult;
    }

    async roundTripSearch(params){
        
    }
} 