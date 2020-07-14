import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { FlightRoute } from "./flight-route.entity";

//@Index("baggage_pk", ["id"], { unique: true })
@Index("baggage_route_id1", ["routeId"], {})
@Entity("baggage")
export class Baggage extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "route_id" })
  routeId: number;

  @Column("integer", { name: "free_allowance" })
  freeAllowance: number;

  @Column("character varying", { name: "allowance_unit", length: 10 })
  allowanceUnit: string;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @Column("boolean", { name: "is_deleted", default: () => "false" })
  isDeleted: boolean;

  @ManyToOne(
    () => FlightRoute,
    flightRoute => flightRoute.baggages
  )
  @JoinColumn([{ name: "route_id", referencedColumnName: "id" }])
  route: FlightRoute;
}
