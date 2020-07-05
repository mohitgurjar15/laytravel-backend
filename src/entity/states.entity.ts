import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany
} from "typeorm";
import { Cities } from "./cities.entity";
import { Countries } from "./countries.entity";
import { User } from "./user.entity";

@Index("country_id", ["countryId"], {})
//@Index("states_pkey", ["id"], { unique: true })
@Entity("states")
export class States extends BaseEntity {
  @Column("integer", { primary: true, name: "id" })
  id: number;

  @Column("character varying", { name: "name", length: 255 })
  name: string;

  @Column("integer", { name: "country_id" })
  countryId: number;

  @Column("character", { name: "country_code", length: 2 })
  countryCode: string;

  @Column("character varying", {
    name: "fips_code",
    nullable: true,
    length: 255
  })
  fipsCode: string | null;

  @Column("character varying", { name: "iso2", nullable: true, length: 255 })
  iso2: string | null;

  @Column("timestamp without time zone", { name: "created_at", nullable: true })
  createdAt: Date | null;

  @Column("timestamp without time zone", { name: "updated_at" })
  updatedAt: Date;

  @Column("integer", { name: "flag" })
  flag: number;

  @Column("character varying", {
    name: "wikidataid",
    nullable: true,
    length: 255
  })
  wikidataid: string | null;

  @OneToMany(
    () => Cities,
    cities => cities.state
  )
  cities: Cities[];

  @ManyToOne(
    () => Countries,
    countries => countries.states
  )
  @JoinColumn([{ name: "country_id", referencedColumnName: "id" }])
  country: Countries;

  @OneToMany(
    () => User,
    user => user.state
  )
  users: User[];
}
