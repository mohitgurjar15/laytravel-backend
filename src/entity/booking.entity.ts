import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne
} from "typeorm";
import { Currency } from "./currency.entity";
import { Flight } from "./flight.entity";
import { PaymentGateway } from "./payment-gateway.entity";
import { User } from "./user.entity";

//@Index("booking_pk", ["id"], { unique: true })
@Entity("booking")
export class Booking extends BaseEntity {
  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("integer", { name: "booking_type" })
  bookingType: number;

  @Column("integer", { name: "booking_status" })
  bookingStatus: number;

  @Column("numeric", { name: "total_amount", precision: 15, scale: 3 })
  totalAmount: string;

  @Column("numeric", { name: "net_rate", precision: 15, scale: 3 })
  netRate: string;

  @Column("numeric", { name: "markup_amount", precision: 15, scale: 3 })
  markupAmount: string;

  @Column("date", { name: "booking_date" })
  bookingDate: string;

  @Column("integer", { name: "total_installments" })
  totalInstallments: number;

  @Column("json", { name: "location_info" })
  locationInfo: object;

  @Column("json", { name: "module_info" })
  moduleInfo: object;

  @Column("integer", { name: "payment_status" })
  paymentStatus: number;

  @Column("json", { name: "payment_info" })
  paymentInfo: object;

  @ManyToOne(
    () => Currency,
    currency => currency.bookings
  )
  @JoinColumn([{ name: "currency", referencedColumnName: "id" }])
  currency: Currency;

  @ManyToOne(
    () => Flight,
    flight => flight.bookings
  )
  @JoinColumn([{ name: "module_id", referencedColumnName: "id" }])
  module: Flight;

  @ManyToOne(
    () => PaymentGateway,
    paymentGateway => paymentGateway.bookings
  )
  @JoinColumn([{ name: "payment_gateway_id", referencedColumnName: "id" }])
  paymentGateway: PaymentGateway;

  @ManyToOne(
    () => User,
    user => user.bookings
  )
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;
}
