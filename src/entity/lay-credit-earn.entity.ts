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
  points: string;

  @Column("date", { name: "earn_date" })
  earnDate: string;

  @Column("integer", { name: "status" })
  status: number;

  @Column("character varying", { name: "credit_mode", length: 20 })
  creditMode: string;

  @Column("text", { name: "description" })
  description: string;

  @Column("uuid", { name: "credit_by" })
  creditBy: string;

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
}
