import { BaseEntity, Column, Entity, Index, OneToMany } from "typeorm";
import { Cities } from "./cities.entity";
import { States } from "./states.entity";
import { User } from "./user.entity";

//@Index("countries_pkey", ["id"], { unique: true })
@Entity("countries")
export class Countries extends BaseEntity {
  @Column("integer", { primary: true, name: "id" })
  id: number;

  @Column("character varying", { name: "name", length: 100 })
  name: string;

  @Column("character", { name: "iso3", nullable: true, length: 3 })
  iso3: string | null;

  @Column("character", { name: "iso2", nullable: true, length: 2 })
  iso2: string | null;

  @Column("character varying", {
    name: "phonecode",
    nullable: true,
    length: 255
  })
  phonecode: string | null;

  @Column("character varying", { name: "capital", nullable: true, length: 255 })
  capital: string | null;

  @Column("character varying", {
    name: "currency",
    nullable: true,
    length: 255
  })
  currency: string | null;

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
    cities => cities.country
  )
  cities: Cities[];

  @OneToMany(
    () => States,
    states => states.country
  )
  states: States[];

  @OneToMany(
    () => User,
    user => user.country
  )
  users: User[];
}
