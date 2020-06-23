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

//@Index("seat_allocation_pk", ["id"], { unique: true })
@Entity("seat_allocation")
export class SeatAllocation extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "seat_id" })
  seatId: number;

  @Column("date", { name: "route_id" })
  routeId: string;

  @Column("integer", { name: "flight_id" })
  flightId: number;

  @Column("date", { name: "date" })
  date: string;

  @ManyToOne(
    () => Flight,
    flight => flight.seatAllocations
  )
  @JoinColumn([{ name: "is_confirm", referencedColumnName: "id" }])
  isConfirm: Flight;
}
