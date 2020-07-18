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
import { BookingInstalments } from "./booking-instalments.entity";
import { Invoice } from "./invoice.entity";
import { Module } from "./module.entity";
import { User } from "./user.entity";
import { Markup } from "./markup.entity";

//@Index("supplier_pk", ["id"], { unique: true })
@Index("supplier_module_id", ["moduleId"], {})
@Index("supplier_updated_by", ["updatedBy"], {})
@Entity("supplier")
export class Supplier extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "module_id" })
  moduleId: number;

  @Column("character varying", { name: "name", length: 255 })
  name: string;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @Column("date", { name: "updated_date" })
  updatedDate: string;

  @Column("uuid", { name: "updated_by" })
  updatedBy: string;

  @OneToMany(
    () => Booking,
    booking => booking.supplier
  )
  bookings: Booking[];

  @OneToMany(
    () => BookingInstalments,
    bookingInstalments => bookingInstalments.supplier
  )
  bookingInstalments: BookingInstalments[];

  @OneToMany(
    () => Invoice,
    invoice => invoice.supplier
  )
  invoices: Invoice[];

  @OneToMany(
    () => Markup,
    markup => markup.supplier
  )
  markups: Markup[];

  @ManyToOne(
    () => Module,
    module => module.suppliers
  )
  @JoinColumn([{ name: "module_id", referencedColumnName: "id" }])
  module: Module;

  @ManyToOne(
    () => User,
    user => user.suppliers
  )
  @JoinColumn([{ name: "updated_by", referencedColumnName: "userId" }])
  updatedBy2: User;
}
