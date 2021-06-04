import { StrategyAirline } from "./strategy.interface";

export class Strategy {
           public airline: StrategyAirline;

           constructor(searchFlight: StrategyAirline) {
               this.airline = searchFlight;
           }

           async getMystiflyCredential() {
               const data = await this.airline.getMystiflyCredential();
               return data;
           }

           async startSession() {
               const data = await this.airline.startSession();
               return data;
           }

           async oneWaySearch(param1, param2) {
               const data = await this.airline.oneWaySearch(param1, param2);
               return data;
           }

           async oneWaySearchZip(
               param1,
               param2,
               param3,
               param4,
               param5,
               param6
           ) {
               const data = await this.airline.oneWaySearchZip(
                   param1,
                   param2,
                   param3,
                   param4,
                   param5,
                   param6
               );
               return data;
           }

           async oneWaySearchZipWithFilter(
               param1,
               param2,
               param3,
               param4,
               param5,
               param6
           ) {
               const data = await this.airline.oneWaySearchZipWithFilter(
                   param1,
                   param2,
                   param3,
                   param4,
                   param5,
                   param6
               );
               return data;
           }

           async roundTripSearch(param1, param2) {
               const data = await this.airline.roundTripSearch(param1, param2);
               return data;
           }

           async roundTripSearchZip(
               param1,
               param2,
               param3,
               param4,
               param5,
               param6
           ) {
               const data = await this.airline.roundTripSearchZip(
                   param1,
                   param2,
                   param3,
                   param4,
                   param5,
                   param6
               );
               return data;
           }

           async roundTripSearchZipWithFilter(
               param1,
               param2,
               param3,
               param4,
               param5,
               param6
           ) {
               const data = await this.airline.roundTripSearchZipWithFilter(
                   param1,
                   param2,
                   param3,
                   param4,
                   param5,
                   param6
               );
               return data;
           }

           async baggageDetails(params) {
               const data = await this.airline.baggageDetails(params);
               return data;
           }

           async airRevalidate(param1, param2) {
               const data = await this.airline.airRevalidate(param1, param2);
               return data;
           }

           async bookFlight(params1, params2, param3) {
               const data = await this.airline.bookFlight(
                   params1,
                   params2,
                   param3
               );
               return data;
           }

           async cancellationPolicy(params1) {
               const data = await this.airline.cancellationPolicy(params1);
               return data;
           }

           async ticketFlight(params1) {
               const data = await this.airline.ticketFlight(params1);
               return data;
           }

           async tripDetails(param1) {
               const data = await this.airline.tripDetails(param1);
               return data;
           }

           async cancelBooking(param1) {
               const data = await this.airline.cancelBooking(param1);
               return data;
           }
       }