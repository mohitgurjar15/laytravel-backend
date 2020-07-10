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

//@Index("failed_payment_attempt_pk", ["id"], { unique: true })
@Index("failed_payment_attempt_instalment_id", ["instalmentId"], {})
@Entity("failed_payment_attempt")
export class FailedPaymentAttempt extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("bigint", { name: "instalment_id" })
  instalmentId: string;

  @Column("date", { name: "date" })
  date: string;

  @ManyToOne(
    () => BookingInstalments,
    bookingInstalments => bookingInstalments.failedPaymentAttempts
  )
  @JoinColumn([{ name: "instalment_id", referencedColumnName: "id" }])
  instalment: BookingInstalments;
}
