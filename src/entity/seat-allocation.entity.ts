import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { Flight } from "./flight.entity";
import { FlightRoute } from "./flight-route.entity";
import { SeatPlan } from "./seat-plan.entity";

//@Index("seat_allocation_pk", ["id"], { unique: true })
@Entity("seat_allocation")
export class SeatAllocation extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("date", { name: "date" })
  date: string;

  @Column("integer", { name: "is_confirm" })
  isConfirm: number;

  @ManyToOne(
    () => Flight,
    flight => flight.seatAllocations
  )
  @JoinColumn([{ name: "flight_id", referencedColumnName: "id" }])
  flight: Flight;

  @ManyToOne(
    () => FlightRoute,
    flightRoute => flightRoute.seatAllocations
  )
  @JoinColumn([{ name: "route_id", referencedColumnName: "id" }])
  route: FlightRoute;

  @ManyToOne(
    () => SeatPlan,
    seatPlan => seatPlan.seatAllocations
  )
  @JoinColumn([{ name: "seat_id", referencedColumnName: "id" }])
  seat: SeatPlan;
}
