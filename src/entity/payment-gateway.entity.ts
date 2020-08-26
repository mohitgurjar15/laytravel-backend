import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { Booking } from "./booking.entity";
import { UserCard } from "./user-card.entity";

//@Index("payment_gateway_pk", ["id"], { unique: true })
@Entity("payment_gateway")
export class PaymentGateway extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "gateway_name", length: 255 })
  gatewayName: string;

  @Column("json", { name: "test_credentials" })
  testCredentials: object;

  @Column("json", { name: "live_credentials" })
  liveCredentials: object;

  @Column("character varying", { name: "payment_mode", length: 10 })
  paymentMode: string;

  @OneToMany(
    () => Booking,
    booking => booking.paymentGateway
  )
  bookings: Booking[];

  @OneToMany(
    () => UserCard,
    userCard => userCard.paymentGateway
  )
  userCards: UserCard[];
}
