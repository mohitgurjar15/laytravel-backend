import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany
} from "typeorm";
import { Booking } from "./booking.entity";
import { PaymentGateway } from "./payment-gateway.entity";
import { User } from "./user.entity";
@Index("user_card_payment_gateway_id", ["paymentGatewayId"], {})
@Index("user_card_userId", ["userId"], {})
@Index("user_card_guestUserId", ["guestUserId"], {})
@Index("user_card_cardToken", ["cardToken"], {})
@Index("user_card_createdDate", ["createdDate"], {})
//@Index("user_card_pk", ["id"], { unique: true })
@Entity("user_card")
export class UserCard extends BaseEntity {
  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("uuid", { name: "user_id", nullable: true })
  userId: string;

  @Column("uuid", { name: "guest_user_id", nullable: true })
  guestUserId: string;

  @Column("integer", { name: "payment_gateway_id", nullable: true })
  paymentGatewayId: number | null;

  @Column("bigint", { name: "timeStamp", nullable: true })
  timeStamp: number | null;

  @Column("character varying", { name: "card_type", length: 100 })
  cardType: string;

  @Column("character varying", { name: "card_holder_name", length: 255 })
  cardHolderName: string;

  @Column("character varying", { name: "card_digits", length: 30 })
  cardDigits: string;

  @Column("character varying", { name: "card_token", length: 255 })
  cardToken: string;

  @Column("json", { name: "card_meta_data", nullable:true })
  cardMetaData: object|null;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @Column("boolean", { name: "is_default", default: () => "false" })
  isDefault: boolean;

  @Column("boolean", { name: "is_deleted", default: () => "false" })
  isDeleted: boolean;

  @Column("timestamp with time zone", { name: "created_date" })
  createdDate: Date;

  @ManyToOne(
    () => PaymentGateway,
    paymentGateway => paymentGateway.userCards
  )
  @JoinColumn([{ name: "payment_gateway_id", referencedColumnName: "id" }])
  paymentGateway: PaymentGateway;

  @ManyToOne(
    () => User,
    user => user.userCards
  )
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;

  @OneToMany(
    () => Booking,
    booking => booking.user
  )
  bookings: Booking[];
}
