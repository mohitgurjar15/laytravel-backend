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
import { Currency } from "./currency.entity";
import { Module } from "./module.entity";
import { Supplier } from "./supplier.entity";
import { User } from "./user.entity";
import { FailedPaymentAttempt } from "./failed-payment-attempt.entity";

@Index("booking_instalments_booking_id", ["bookingId"], {})
@Index("booking_instalments_currency_id", ["currencyId"], {})
//@Index("booking_instalments_pk", ["id"], { unique: true })
@Index("booking_instalments_module_id", ["moduleId"], {})
@Index("booking_instalments_supplier_id", ["supplierId"], {})
@Index("booking_instalments_user_id", ["userId"], {})
@Entity("booking_instalments")
export class BookingInstalments extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("uuid", { name: "booking_id" })
  bookingId: string;

  @Column("uuid", { name: "user_id" })
  userId: string;

  @Column("integer", { name: "module_id" })
  moduleId: number;

  @Column("integer", { name: "supplier_id" })
  supplierId: number;

  @Column("character varying", { name: "instalment_type", length: 30 })
  instalmentType: string;

  @Column("character varying", { name: "transaction_token", length: 255, nullable: true })
  transactionToken: string;

  @Column("date", { name: "instalment_date", default: null })
  instalmentDate: string;

  @Column("integer", { name: "attempt", default: 0 })
  attempt: number;

  @Column("date", { name: "payment_capture_date" , nullable:true})
  paymentCaptureDate: Date;

  @Column("integer", { name: "currency_id" })
  currencyId: number;

  @Column("numeric", { name: "amount", precision: 15, scale: 3 })
  amount: string;

  @Column("integer", { name: "instalment_status" })
  instalmentStatus: number;

  @Column("integer", { name: "payment_gateway_id", nullable: true })
  paymentGatewayId: number | null;

  @Column("json", { name: "payment_info", nullable: true })
  paymentInfo: object | null;

  @Column("integer", { name: "payment_status" })
  paymentStatus: number;

  @Column("integer", {
    name: "is_payment_processed_to_supplier",
    default: () => "0"
  })
  isPaymentProcessedToSupplier: number;

  @Column("integer", { name: "is_invoice_generated", default: () => "0" })
  isInvoiceGenerated: number;

  @Column("text", { name: "comment", nullable: true })
  comment: string | null;

  @ManyToOne(
    () => Booking,
    booking => booking.bookingInstalments
  )
  @JoinColumn([{ name: "booking_id", referencedColumnName: "id" }])
  booking: Booking;

  @ManyToOne(
    () => Currency,
    currency => currency.bookingInstalments
  )
  @JoinColumn([{ name: "currency_id", referencedColumnName: "id" }])
  currency: Currency;

  @ManyToOne(
    () => Module,
    module => module.bookingInstalments
  )
  @JoinColumn([{ name: "module_id", referencedColumnName: "id" }])
  module: Module;

  @ManyToOne(
    () => Supplier,
    supplier => supplier.bookingInstalments
  )
  @JoinColumn([{ name: "supplier_id", referencedColumnName: "id" }])
  supplier: Supplier;

  @ManyToOne(
    () => User,
    user => user.bookingInstalments
  )
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;

  @OneToMany(
    () => FailedPaymentAttempt,
    failedPaymentAttempt => failedPaymentAttempt.instalment
  )
  failedPaymentAttempts: FailedPaymentAttempt[];
}
