import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne
} from "typeorm";
import { PaymentGateway } from "./payment-gateway.entity";
import { User } from "./user.entity";

//@Index("user_card_pk", ["id"], { unique: true })
@Entity("user_card")
export class UserCard extends BaseEntity {
  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("integer", { name: "card_type" })
  cardType: number;

  @Column("character varying", { name: "card_holder_name", length: 255 })
  cardHolderName: string;

  @Column("character varying", { name: "card_digits", length: 30 })
  cardDigits: string;

  @Column("character varying", { name: "card_token", length: 255 })
  cardToken: string;

  @Column("json", { name: "card_meta_data" })
  cardMetaData: object;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @Column("boolean", { name: "is_deleted", default: () => "false" })
  isDeleted: boolean;

  @Column("date", { name: "created_date" })
  createdDate: string;

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
}
