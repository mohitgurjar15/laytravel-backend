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
import { Booking } from "./booking.entity";
import { Airline } from "./airline.entity";
import { FlightRoute } from "./flight-route.entity";
import { SeatAllocation } from "./seat-allocation.entity";
import { SeatPlan } from "./seat-plan.entity";

//@Index("flight_pk", ["id"], { unique: true })
@Index("flight_airline_id", ["airlineId"], {})
@Entity("flight")
export class Flight extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "airline_id", nullable: true })
  airlineId: number | null;

  @Column("character varying", { name: "flight_number", length: 30 })
  flightNumber: string;

  @Column("character varying", { name: "class", length: 20 })
  class: string;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @Column("boolean", { name: "is_deleted", default: () => "false" })
  isDeleted: boolean;

  @ManyToOne(
    () => Airline,
    airline => airline.flights
  )
  @JoinColumn([{ name: "airline_id", referencedColumnName: "id" }])
  airline: Airline;

  @OneToMany(
    () => FlightRoute,
    flightRoute => flightRoute.flight
  )
  flightRoutes: FlightRoute[];

  @OneToMany(
    () => SeatAllocation,
    seatAllocation => seatAllocation.flight
  )
  seatAllocations: SeatAllocation[];

  @OneToMany(
    () => SeatPlan,
    seatPlan => seatPlan.flight
  )
  seatPlans: SeatPlan[];
}
