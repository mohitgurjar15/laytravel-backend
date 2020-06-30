import { SearchFlight } from "./search-flight.interface";
import { SearchFlightDto } from "../dto/search-flight.dto";
import { json } from "express";


export class Static implements SearchFlight{

    private flightRepository;
    constructor(flightRepository){
        this.flightRepository = flightRepository;
    }

    async oneWaySearch(searchFlightDto:SearchFlightDto){

        const {
            source_location,
            destination_location,
            departure_date
        } = searchFlightDto;

        var today = new Date();
        var time = `${today.getHours()}:${today.getMinutes()}`;
        console.log(time);
        let departureId = 1;
        let arrivalId = 4;

        let result = await this.flightRepository.find({
            relations:['arrival','departure','seatAllocations'],
            where : [{ departure : departureId }, {arrival : arrivalId}]
        })
        let searchResult=[];
        

        let searchItem={ stop:0, route_details: [] };
        
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

                    if(searchItem.route_details[searchItem.route_details.length-1].arrival.id!=arrivalId)
                        continue;
                    else
                        searchResult.push(searchItem)
                    
                }
            }
        }
        /* console.log(result);
        console.log("========");
        console.log(JSON.stringify(searchResult)); */



    }

    async roundTripSearch(params){
        
    }
} 