import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { OtherPayments } from "./other-payment.entity";
import { User } from "./user.entity";

@Index("lay_credit_earn_credit_by", ["creditBy"], {})
//@Index("lay_credit_earn_pk", ["id"], { unique: true })
@Index("lay_credit_earn_user_id", ["userId"], {})
@Entity("lay_credit_earn")
export class LayCreditEarn extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("uuid", { name: "user_id" })
  userId: string;

  @Column("numeric", { name: "points", precision: 15, scale: 2 })
  points: number;

  @Column("date", { name: "earn_date" })
  earnDate: Date;

  @Column("integer", { name: "status" })
  status: number;

  @Column("integer", { name: "type", default: 1 })
  type: number;

  @Column("character varying", { name: "subscription_type", length: 20 , nullable : true})
  subscriptionType: string;

  @Column("integer", { name: "transaction_id", nullable: true })
  transactionId: number;

  @Column("character varying", { name: "credit_mode", length: 20 })
  creditMode: string;

  @Column("text", { name: "description" })
  description: string;

  @Column("uuid", { name: "credit_by" })
  creditBy: string;

  @Column("character varying", { name: "card_token", nullable: true })
  cardToken: string;

  @Column("date", { name: "created_date", nullable: true })
  createdDate: Date;

  @ManyToOne(
    () => User,
    user => user.layCreditEarns
  )
  @JoinColumn([{ name: "credit_by", referencedColumnName: "userId" }])
  creditBy2: User;

  @ManyToOne(
    () => User,
    user => user.layCreditEarns2
  )
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;

  @ManyToOne(
    () => OtherPayments,
    otherPayments => otherPayments.id
  )
  @JoinColumn([{ name: "transaction_id", referencedColumnName: "id" }])
  payments: OtherPayments;
}
