import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne
} from "typeorm";
import { Currency } from "./currency.entity";
import { Plan } from "./plan.entity";
import { User } from "./user.entity";

@Index("plan_subscription_currency_id", ["currencyId"], {})
//@Index("plan_subscription_pk", ["id"], { unique: true })
@Index("plan_subscription_plan_id", ["planId"], {})
@Index("plan_subscription_user_id", ["userId"], {})
@Entity("plan_subscription")
export class PlanSubscription extends BaseEntity {
  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("uuid", { name: "plan_id" })
  planId: string;

  @Column("uuid", { name: "user_id" })
  userId: string;

  @Column("date", { name: "subscription_date" })
  subscriptionDate: Date;

  @Column("integer", { name: "currency_id" })
  currencyId: number;

  @Column("numeric", { name: "amount", precision: 10, scale: 2 })
  amount: string;

  @Column("integer", { name: "payment_status" })
  paymentStatus: number;

  @Column("json", { name: "payment_info" })
  paymentInfo: object;

  @ManyToOne(
    () => Currency,
    currency => currency.planSubscriptions
  )
  @JoinColumn([{ name: "currency_id", referencedColumnName: "id" }])
  currency: Currency;

  @ManyToOne(
    () => Plan,
    plan => plan.planSubscriptions
  )
  @JoinColumn([{ name: "plan_id", referencedColumnName: "id" }])
  plan: Plan;

  @ManyToOne(
    () => User,
    user => user.planSubscriptions
  )
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;
}
