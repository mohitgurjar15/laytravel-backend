import {
  BaseEntity,
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { Booking } from "./booking.entity";
import { BookingInstalments } from "./booking-instalments.entity";
import { Invoice } from "./invoice.entity";
import { Plan } from "./plan.entity";
import { PlanSubscription } from "./plan-subscription.entity";

//@Index("currency_pk", ["id"], { unique: true })
@Entity("currency")
export class Currency extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "country", length: 150 })
  country: string;

  @Column("character varying", { name: "code", length: 10 })
  code: string;

  @Column("numeric", { name: "live_rate", precision: 8, scale: 3 })
  liveRate: string;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @Column("boolean", { name: "is_deleted", default: () => "false" })
  isDeleted: boolean;

  @Column("date", { name: "created_date" })
  createdDate: string;

  @Column("date", { name: "updated_date" })
  updatedDate: string;

  @OneToMany(
    () => Booking,
    booking => booking.currency2
  )
  bookings: Booking[];

  @OneToMany(
    () => BookingInstalments,
    bookingInstalments => bookingInstalments.currency
  )
  bookingInstalments: BookingInstalments[];

  @OneToMany(
    () => Invoice,
    invoice => invoice.currency
  )
  invoices: Invoice[];

  @OneToMany(
    () => Plan,
    plan => plan.currency
  )
  plans: Plan[];

  @OneToMany(
    () => PlanSubscription,
    planSubscription => planSubscription.currency
  )
  planSubscriptions: PlanSubscription[];
}
