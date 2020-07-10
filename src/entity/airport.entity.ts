import {
  BaseEntity,
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { FlightRoute } from "./flight-route.entity";

//@Index("airport_pk", ["id"], { unique: true })
@Entity("airport")
export class Airport extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name", length: 255 })
  name: string;

  @Column("character varying", { name: "code", length: 10 })
  code: string;

  @Column("numeric", { name: "latitude", precision: 10, scale: 2 })
  latitude: string;

  @Column("numeric", { name: "longitude", precision: 10, scale: 2 })
  longitude: string;

  @Column("character varying", { name: "city", length: 255 })
  city: string;

  @Column("character varying", { name: "country", length: 255 })
  country: string;

  @Column("character varying", { name: "icao", length: 10 })
  icao: string;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @Column("boolean", { name: "is_deleted", default: () => "false" })
  isDeleted: boolean;

  @OneToMany(
    () => FlightRoute,
    flightRoute => flightRoute.arrival
  )
  flightRoutes: FlightRoute[];

  @OneToMany(
    () => FlightRoute,
    flightRoute => flightRoute.departure
  )
  flightRoutes2: FlightRoute[];
}