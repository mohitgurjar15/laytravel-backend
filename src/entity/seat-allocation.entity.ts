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

@Index("seat_allocation_flight_id", ["flightId"], {})
//@Index("seat_allocation_pk", ["id"], { unique: true })
@Index("seat_allocation_route_id", ["routeId"], {})
@Index("seat_allocation_seat_id", ["seatId"], {})
@Entity("seat_allocation")
export class SeatAllocation extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "seat_id", nullable: true })
  seatId: number | null;

  @Column("integer", { name: "route_id", nullable: true })
  routeId: number | null;

  @Column("integer", { name: "flight_id", nullable: true })
  flightId: number | null;

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
