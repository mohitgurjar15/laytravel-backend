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
import { User } from "./user.entity";
import { Supplier } from "./supplier.entity";

//@Index("module_pk", ["id"], { unique: true })
@Entity("module")
export class Module extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name", length: 50 })
  name: string;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @Column("uuid", { name: "created_by" })
  createdBy: string;

  @Column("date", { name: "created_date" })
  createdDate: string;

  @Column("date", { name: "update_date" })
  updateDate: string;

  @OneToMany(
    () => Booking,
    booking => booking.module
  )
  bookings: Booking[];

  @OneToMany(
    () => BookingInstalments,
    bookingInstalments => bookingInstalments.module
  )
  bookingInstalments: BookingInstalments[];

  @OneToMany(
    () => Invoice,
    invoice => invoice.module
  )
  invoices: Invoice[];

  @ManyToOne(
    () => User,
    user => user.modules
  )
  @JoinColumn([{ name: "updated_by", referencedColumnName: "userId" }])
  updatedBy: User;

  @OneToMany(
    () => Supplier,
    supplier => supplier.module
  )
  suppliers: Supplier[];
}
