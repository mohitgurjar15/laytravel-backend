import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { BookingInstalments } from "./booking-instalments.entity";
import { OtherPayments } from "./other-payment.entity";

//@Index("failed_payment_attempt_pk", ["id"], { unique: true })
@Index("failed_payment_attempt_instalment_id", ["instalmentId"], {})
@Entity("failed_payment_attempt")
export class FailedPaymentAttempt extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("bigint", { name: "instalment_id" })
  instalmentId: number;

  @Column("date", { name: "date" })
  date: Date;

  @Column("json", { name: "payment_info", nullable:true })
  paymentInfo: object | null;

  @ManyToOne(
    () => BookingInstalments,
    bookingInstalments => bookingInstalments.failedPaymentAttempts
  )
  @JoinColumn([{ name: "instalment_id", referencedColumnName: "id" }])
  instalment: BookingInstalments;


  // @ManyToOne(
  //   () => OtherPayments,
  //   otherPayments => otherPayments.failedPaymentAttempts
  // )
  // @JoinColumn([{ name: "instalment_id", referencedColumnName: "id" }])
  // otherPayments: OtherPayments;
}
