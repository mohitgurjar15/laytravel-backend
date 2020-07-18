import { StrategyAirline } from "./strategy.interface";
import { SearchFlightDto } from "../dto/search-flight.dto";
import { getManager } from "typeorm";
import { SeatPlan } from "src/entity/seat-plan.entity";
import { SeatAllocation } from "src/entity/seat-allocation.entity";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { Airport } from "src/entity/airport.entity";
import { FlightRoute } from "src/entity/flight-route.entity";
import { PriceMarkup } from "src/utility/markup.utility";
import { Markup } from "src/entity/markup.entity";


export class Static implements StrategyAirline{

    private flightRepository;
    constructor(flightRepository){
        this.flightRepository = flightRepository;
    }

    async oneWaySearch(searchFlightDto:SearchFlightDto){

        const {
            source_location,
            destination_location,
            departure_date,
            flight_class,
            adult_count,
            child_count,
            infant_count
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
        
        let searchResult=[];
        let supplierData;
        let result =  await getManager()
            .createQueryBuilder(FlightRoute, "FlightRoute")
            .leftJoinAndSelect("FlightRoute.airline","airline")
            .leftJoinAndSelect("FlightRoute.arrival","arrival")
            .leftJoinAndSelect("FlightRoute.departure","departure")
            .leftJoinAndSelect("FlightRoute.flight","flight")
            .select([
                "FlightRoute.id","FlightRoute.departureTime","FlightRoute.arrivalTime",
                "FlightRoute.departureId","FlightRoute.arrivalId","FlightRoute.adultPrice",
                "FlightRoute.childPrice","FlightRoute.infantPrice",
                "airline.id","airline.name","airline.logo",
                "arrival.id","arrival.code","arrival.name",
                "departure.id","departure.code","departure.name",
                "flight.id","flight.flightNumber","flight.class"
            ])
            .orWhere(`("arrival"."id" = :arrivalId OR "departure"."id"=:departureId)`,{arrivalId:arrivalId,departureId:departureId})
            .andWhere(departure_date==today ? (`"departure_time">=:departure_time`): `1=1`,{departure_time:time}) 
            //.andWhere(`"flight"."class"=:flight_class`,{flight_class:flight_class})
            .getMany();

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

            supplierData = await getManager()
                               .createQueryBuilder(Markup,'markup')
                               .leftJoinAndSelect("markup.supplier","supplier")
                               .select([
                                   "markup.supplierId"
                               ])
                               .where("supplier.name=:name",{ name:'local1' })
                               .getOne();
        }

        let supplierId = typeof supplierData!='undefined'?supplierData.supplierId : 0
        let searchItem={ stop:0,  price:0.00,route_details: [] };
        
        if(result.length){

            for(let i=0; i < result.length; i++){
                    
                searchItem={ stop:0, price:0.00, route_details: [] };
                if(result[i].departure.id ===departureId && result[i].arrival.id===arrivalId){
                
                    searchItem.stop=0;
                    searchItem.route_details.push(result[i]);
                    let totalPrice = searchItem.route_details.map(route=>{

                        return (parseInt(route.adultPrice)*adult_count + parseInt(route.childPrice)*child_count +parseInt(route.infantPrice)*infant_count)  
                    })

                    let total = (totalPrice.reduce((a, b) => a + b, 0));
                    searchItem.price = await PriceMarkup.applyMarkup(total,supplierId,6);
                    searchResult.push(searchItem)
                }
                
                else{
                    if(result[i].departure.id==departureId){
                            
                        let xArrivalId = result[i].arrival.id;
                        searchItem.route_details.push(result[i])
                        
                        result.forEach((res,j)=>{
                            
                            if(res.departure.id === xArrivalId && (res.departure.id !==departureId) && i!=j){
                                searchItem.route_details.push(res);
                                xArrivalId = res.arrival.id;
                            }
                            
                            if(xArrivalId==arrivalId)
                                return
                                
                        })
                        
                        searchItem.stop = searchItem.route_details.length-1;
                        let totalPrice = searchItem.route_details.map(route=>{
                            
                            return (parseInt(route.adultPrice)*adult_count + parseInt(route.childPrice)*child_count +parseInt(route.infantPrice)*infant_count)  
                        })
        
                        let total = (totalPrice.reduce((a, b) => a + b, 0));
                        searchItem.price = await PriceMarkup.applyMarkup(total,supplierId,5);

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

        const arrivalTime=[];
        const departureTime=[];
        const airlines=[];
        searchResult.forEach(item=>{

            item.route_details.forEach(subItem=>{
                departureTime.push(subItem.departureTime);
                arrivalTime.push(subItem.arrivalTime);
                airlines.push(subItem.airline.name)
            })
        })

        //const minPrice = Math.min.apply(null, searchResult.map(item => item.price));
        const minPrice = Math.min.apply(null, searchResult.map(item => item.price));
        const maxPrice = Math.max.apply(null, searchResult.map(item => item.price));

        arrivalTime.sort((a,b) => a.localeCompare(b));
        departureTime.sort((a,b) => a.localeCompare(b));
        return {
            "flight_list":searchResult,
            "price_range":{
                "min_price":minPrice,
                "max_price":maxPrice
            },
            "departure_time_duration":{
                "min_time":departureTime[0],
                "max_time":departureTime[departureTime.length-1]
            },
            "arrival_time_duration":{
                "min_time":arrivalTime[0],
                "max_time":arrivalTime[arrivalTime.length-1]
            },
            "airlines":[...new Set(airlines)]
        }
    }

    async roundTripSearch(params){
        
    }
} 