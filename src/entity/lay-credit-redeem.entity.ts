import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { User } from "./user.entity";

//@Index("lay_credit_redeem_pk", ["id"], { unique: true })
@Index("lay_credit_redeem_redeem_by", ["redeemBy"], {})
@Index("lay_credit_redeem_user_id", ["userId"], {})
@Entity("lay_credit_redeem")
export class LayCreditRedeem extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("uuid", { name: "user_id" })
  userId: string;

  @Column("numeric", { name: "points", precision: 15, scale: 2 })
  points: string;

  @Column("date", { name: "redeem_date" })
  redeemDate: string;

  @Column("integer", { name: "status" })
  status: number;

  @Column("character varying", { name: "redeem_mode", length: 20 })
  redeemMode: string;

  @Column("text", { name: "description" })
  description: string;

  @Column("uuid", { name: "redeem_by" })
  redeemBy: string;

  @ManyToOne(
    () => User,
    user => user.layCreditRedeems
  )
  @JoinColumn([{ name: "redeem_by", referencedColumnName: "userId" }])
  redeemBy2: User;

  @ManyToOne(
    () => User,
    user => user.layCreditRedeems2
  )
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;
}
