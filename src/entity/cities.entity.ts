import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne
} from "typeorm";
import { Countries } from "./countries.entity";
import { States } from "./states.entity";

@Index("country_id1", ["countryId"], {})
//@Index("cities_pkey", ["id"], { unique: true })
@Index("state_id1", ["stateId"], {})
@Entity("cities")
export class Cities extends BaseEntity {
  @Column("integer", { primary: true, name: "id" })
  id: number;

  @Column("character varying", { name: "name", length: 255 })
  name: string;

  @Column("integer", { name: "state_id" })
  stateId: number;

  @Column("character varying", { name: "state_code", length: 255 })
  stateCode: string;

  @Column("integer", { name: "country_id" })
  countryId: number;

  @Column("character", { name: "country_code", length: 2 })
  countryCode: string;

  @Column("integer", { name: "latitude" })
  latitude: number;

  @Column("integer", { name: "longitude" })
  longitude: number;

  @Column("timestamp without time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updated_on" })
  updatedOn: Date;

  @Column("integer", { name: "flag" })
  flag: number;

  @Column("character varying", {
    name: "wikidataid",
    nullable: true,
    length: 255
  })
  wikidataid: string | null;

  @ManyToOne(
    () => Countries,
    countries => countries.cities
  )
  @JoinColumn([{ name: "country_id", referencedColumnName: "id" }])
  country: Countries;

  @ManyToOne(
    () => States,
    states => states.cities
  )
  @JoinColumn([{ name: "state_id", referencedColumnName: "id" }])
  state: States;
}
