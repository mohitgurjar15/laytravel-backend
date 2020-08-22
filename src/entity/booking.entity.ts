import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany
} from "typeorm";
import { Currency } from "./currency.entity";
import { PaymentGateway } from "./payment-gateway.entity";
import { User } from "./user.entity";
import { Module } from "./module.entity";
import { Supplier } from "./supplier.entity";
import { BookingInstalments } from "./booking-instalments.entity";

@Index("booking_currency_id", ["currency"], {})
@Index("booking_module_id", ["moduleId"], {})
@Index("booking_paymnet_gateway_id", ["paymentGatewayId"], {})
@Index("booking_supplier_id", ["supplierId"], {})
@Index("booking_user_id", ["userId"], {})

//@Index("booking_pk", ["id"], { unique: true })
@Entity("booking")
export class Booking extends BaseEntity {
  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("uuid", { name: "user_id", nullable: true })
  userId: string | null;

  @Column("integer", { name: "module_id", nullable: true })
  moduleId: number | null;

  @Column("integer", { name: "booking_type" })
  bookingType: number;

  @Column("integer", { name: "booking_status" })
  bookingStatus: number;

  @Column("integer", { name: "currency", nullable: true })
  currency: number | null;

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

  @Column("integer", { name: "payment_gateway_id", nullable: true })
  paymentGatewayId: number | null;

  @Column("integer", { name: "payment_status" })
  paymentStatus: number;

  @Column("json", { name: "payment_info" })
  paymentInfo: object;

  @Column("boolean", { name: "is_predictive", default: () => false})
  isPredictive: boolean;

  @Column("numeric", {
    name: "payment_gateway_processing_fee",
    nullable: true,
    precision: 15,
    scale: 3
  })
  paymentGatewayProcessingFee: string | null;

  @Column("integer", { name: "supplier_id", nullable: true })
  supplierId: number | null;

  @Column("date", { name: "next_instalment_date", nullable: true })
  nextInstalmentDate: string | null;

  @Column("character varying", { name: "supplier_booking_id", length: 255 })
  supplierBookingId: string;

  @ManyToOne(
    () => Currency,
    currency => currency.bookings
  )
  @JoinColumn([{ name: "currency", referencedColumnName: "id" }])
  currency2: Currency;

  @ManyToOne(
    () => Module,
    module => module.bookings
  )
  @JoinColumn([{ name: "module_id", referencedColumnName: "id" }])
  module: Module;

  @ManyToOne(
    () => PaymentGateway,
    paymentGateway => paymentGateway.bookings
  )
  @JoinColumn([{ name: "payment_gateway_id", referencedColumnName: "id" }])
  paymentGateway: PaymentGateway;

  @ManyToOne(
    () => Supplier,
    supplier => supplier.bookings
  )
  @JoinColumn([{ name: "supplier_id", referencedColumnName: "id" }])
  supplier: Supplier;

  @ManyToOne(
    () => User,
    user => user.bookings
  )
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;

  @OneToMany(
    () => BookingInstalments,
    bookingInstalments => bookingInstalments.booking
  )
  bookingInstalments: BookingInstalments[];
}
