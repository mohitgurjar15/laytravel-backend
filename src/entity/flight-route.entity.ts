import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { Airline } from "./airline.entity";
import { Airport } from "./airport.entity";
import { Flight } from "./flight.entity";
import { SeatAllocation } from "./seat-allocation.entity";

@Index("flight_route_airline_id", ["airlineId"], {})
@Index("flight_route_arrival_id", ["arrivalId"], {})
@Index("flight_route_departure_id", ["departureId"], {})
@Index("flight_route_flight_id", ["flightId"], {})
//@Index("flight_route_pk", ["id"], { unique: true })
@Entity("flight_route")
export class FlightRoute extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "flight_id", nullable: true })
  flightId: number | null;

  @Column("integer", { name: "airline_id", nullable: true })
  airlineId: number | null;

  @Column("integer", { name: "departure_id", nullable: true })
  departureId: number | null;

  @Column("integer", { name: "arrival_id", nullable: true })
  arrivalId: number | null;

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

  @Column("numeric", {
    name: "adult_price",
    nullable: true,
    precision: 10,
    scale: 2
  })
  adultPrice: string | null;

  @Column("numeric", {
    name: "child_price",
    nullable: true,
    precision: 10,
    scale: 2
  })
  childPrice: string | null;

  @Column("numeric", {
    name: "infant_price",
    nullable: true,
    precision: 10,
    scale: 2
  })
  infantPrice: string | null;

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

  @OneToMany(
    () => SeatAllocation,
    seatAllocation => seatAllocation.route
  )
  seatAllocations: SeatAllocation[];
}
