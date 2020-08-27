import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany
} from "typeorm";
import { Currency } from "./currency.entity";
import { PlanSubscription } from "./plan-subscription.entity";

//@Index("plan_pk", ["id"], { unique: true })
@Entity("plan")
export class Plan extends BaseEntity {
  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("character varying", { name: "name", length: 255 })
  name: string;

  @Column("text", { name: "description" })
  description: string;

  @Column("numeric", { name: "amount", precision: 10, scale: 2 })
  amount: number;

  @Column("integer", { name: "validity_days" })
  validityDays: number;

  @Column("timestamp without time zone", { name: "created_date" })
  createdDate: Date;

  @Column("timestamp without time zone", { name: "updated_date" })
  updatedDate: Date;

  @ManyToOne(
    () => Currency,
    currency => currency.plans
  )
  @JoinColumn([{ name: "currency_id", referencedColumnName: "id" }])
  currency: Currency;

  @OneToMany(
    () => PlanSubscription,
    planSubscription => planSubscription.plan
  )
  planSubscriptions: PlanSubscription[];
}
