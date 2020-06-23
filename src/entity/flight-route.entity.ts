import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { Airline } from "./airline.entity";
import { Airport } from "./airport.entity";
import { Flight } from "./flight.entity";

//@Index("flight_route_pk", ["id"], { unique: true })
@Entity("flight_route")
export class FlightRoute extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("time without time zone", { name: "departure_time" })
  departureTime: string;

  @Column("time without time zone", { name: "arrival_time" })
  arrivalTime: string;

  @Column("character varying", { name: "currency_code", length: 5 })
  currencyCode: string;

  @Column("numeric", { name: "amount", precision: 10, scale: 2 })
  amount: string;

  @Column("boolean", { name: "is_refundable" })
  isRefundable: boolean;

  @Column("boolean", { name: "is_available", default: () => "true" })
  isAvailable: boolean;

  @Column("boolean", { name: "is_deleted", default: () => "false" })
  isDeleted: boolean;

  @ManyToOne(
    () => Airline,
    airline => airline.flightRoutes
  )
  @JoinColumn([{ name: "airline_id", referencedColumnName: "id" }])
  airline: Airline;

  @ManyToOne(
    () => Airport,
    airport => airport.flightRoutes
  )
  @JoinColumn([{ name: "arrival_id", referencedColumnName: "id" }])
  arrival: Airport;

  @ManyToOne(
    () => Airport,
    airport => airport.flightRoutes2
  )
  @JoinColumn([{ name: "departure_id", referencedColumnName: "id" }])
  departure: Airport;

  @ManyToOne(
    () => Flight,
    flight => flight.flightRoutes
  )
  @JoinColumn([{ name: "flight_id", referencedColumnName: "id" }])
  flight: Flight;
}
