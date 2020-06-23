import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

//@Index("booking_installments_pk", ["id"], { unique: true })
@Entity("booking_installments")
export class BookingInstallments extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("uuid", { name: "booking_id" })
  bookingId: string;

  @Column("integer", { name: "installment_type" })
  installmentType: number;

  @Column("date", { name: "installment_date" })
  installmentDate: string;

  @Column("integer", { name: "installment_status" })
  installmentStatus: number;

  @Column("integer", { name: "payment_gateway_id" })
  paymentGatewayId: number;

  @Column("json", { name: "payment_info" })
  paymentInfo: object;

  @Column("integer", { name: "payment_status" })
  paymentStatus: number;
}
