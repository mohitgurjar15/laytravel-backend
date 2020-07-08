import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { Flight } from "./flight.entity";
import { FlightRoute } from "./flight-route.entity";

//@Index("airline_pk", ["id"], { unique: true })
@Entity("airline")
export class Airline extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "code", length: 10 })
  code: string;

  @Column("character varying", { name: "name", length: 255 })
  name: string;

  @Column("character varying", { name: "logo", length: 255 })
  logo: string;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @Column("boolean", { name: "is_deleted", default: () => "false" })
  isDeleted: boolean;

  @OneToMany(
    () => Flight,
    flight => flight.airline
  )
  flights: Flight[];

  @OneToMany(
    () => FlightRoute,
    flightRoute => flightRoute.airline
  )
  flightRoutes: FlightRoute[];
}
