import { PaymentStatus } from "src/enum/payment-status.enum";
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Booking } from "./booking.entity";
import { CartBooking } from "./cart-booking.entity";
import { Currency } from "./currency.entity";
import { FailedPaymentAttempt } from "./failed-payment-attempt.entity";
import { TravelerInfo } from "./traveler-info.entity";
import { User } from "./user.entity";

@Index("other_payment_id_idx", ["id"], {})
@Index("other_payment_bookingId_idx", ["bookingId"], {})
@Index("other_payment_currencyId_idx", ["currencyId"], {})
@Index("other_payment_amount_idx", ["amount"], {})
@Index("other_payment_paymentStatus_idx", ["paymentStatus"], {})
@Index("other_payment_paidFor_idx", ["paidFor"], {})
@Index("other_payment_createdDate_idx", ["createdDate"], {})
@Index("other_payment_createdBy_idx", ["createdBy"], {})
@Entity("other_payments")
export class OtherPayments extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("uuid", { name: "booking_id", nullable: true })
  bookingId: string;

  @Column("uuid", { name: "cart_booking_id", nullable: true })
  cartBookingId: string;

  @Column("character varying", { name: "transaction_id" })
  transactionId: string;

  @Column("uuid", { name: "user_id" })
  userId: string;

  @Column("integer", { name: "currency_id" })
  currencyId: number;

  @Column("integer", { name: "traveler_info_id", nullable: true })
  travelerInfoId: number;

  @Column("character varying", { name: "amount", nullable: true })
  amount: string;

  @Column("character varying", {
    name: "paid_for",
    length: 255,
    nullable: true,
  })
  paidFor: string;

  @Column("json", { name: "payment_info", nullable: true })
  paymentInfo: object | null;

  @Column("integer", { name: "payment_status", default: PaymentStatus.CONFIRM })
  paymentStatus: number;

  @Column("text", { name: "comment", nullable: true })
  comment: string | null;

  @Column("timestamp with time zone", { name: "created_date" })
  createdDate: Date;

  @Column("uuid", { name: "created_by", nullable: true })
  createdBy: string | null;

  @ManyToOne(
    () => User,
    (user) => user.users
  )
  @JoinColumn([{ name: "created_by", referencedColumnName: "userId" }])
  createdBy2: User;

  @ManyToOne(
    () => Booking,
    (booking) => booking.otherPayments
  )
  @JoinColumn([{ name: "booking_id", referencedColumnName: "id" }])
  booking: Booking;

  @ManyToOne(
    () => CartBooking,
    (cartBooking) => cartBooking.otherPayments
  )
  @JoinColumn([{ name: "cart_booking_id", referencedColumnName: "id" }])
  cart: CartBooking;

  @ManyToOne(
    () => Currency,
    (currency) => currency.otherPayments
  )
  @JoinColumn([{ name: "currency_id", referencedColumnName: "id" }])
  currency: Currency;

  @ManyToOne(
    () => User,
    (user) => user.otherPayments
  )
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;

  @ManyToOne(
    () => TravelerInfo,
    (travelerInfo) => travelerInfo.charges
  )
  @JoinColumn([{ name: "traveler_info_id", referencedColumnName: "id" }])
  travelerInfo: User;

  // @OneToMany(
  //   () => FailedPaymentAttempt,
  //   failedPaymentAttempt => failedPaymentAttempt.otherPayments
  // )
  // failedPaymentAttempts: FailedPaymentAttempt[];
}
