import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany
} from "typeorm";
import * as bcrypt from "bcrypt";

import { ActivityLog } from "./activity-log.entity";
import { Booking } from "./booking.entity";
import { BookingInstalments } from "./booking-instalments.entity";
import { Language } from "./language.entity";
import { LayCreditEarn } from "./lay-credit-earn.entity";
import { LayCreditRedeem } from "./lay-credit-redeem.entity";
import { LoginLog } from "./login-log.entity";
import { Module } from "./module.entity";
import { PlanSubscription } from "./plan-subscription.entity";
import { Supplier } from "./supplier.entity";
import { Countries } from "./countries.entity";
import { States } from "./states.entity";
import { UserCard } from "./user-card.entity";
import { UserDeviceDetail } from "./user-device-detail.entity";

@Index("user_country_id", ["countryId"], {})
@Index("user_created_by", ["createdBy"], {})
@Index("user_preferred_language", ["preferredLanguage"], {})
@Index("user_state_id", ["stateId"], {})
@Index("user_updated_by", ["updatedBy"], {})
//@Index("user_pk", ["userId"], { unique: true })
@Entity("user")
export class User extends BaseEntity {
  @Column("uuid", { primary: true, name: "user_id" })
  userId: string;

  @Column("character varying", { name: "first_name", length: 255 })
  firstName: string;

  @Column("character varying", { name: "last_name", length: 255 })
  lastName: string;

  @Column("integer", { name: "account_type" })
  accountType: number;

  @Column("character varying", { name: "social_account_id", length: 255 })
  socialAccountId: string;

  @Column("character varying", { name: "email", length: 255 })
  email: string;

  @Column("character varying", { name: "salt", length: 255 })
  salt: string;

  @Column("character varying", { name: "password", length: 255 })
  password: string;

  @Column("character varying", { name: "phone_no", length: 20 })
  phoneNo: string;

  @Column("character varying", { name: "profile_pic", length: 255 })
  profilePic: string | null;

  @Column("character varying", { name: "timezone", length: 255 })
  timezone: string;

  @Column("integer", { name: "status" })
  status: number;

  @Column("boolean", { name: "is_deleted", default: () => "false" })
  isDeleted: boolean;

  @Column("uuid", { name: "created_by", nullable: true })
  createdBy: string | null;

  @Column("uuid", { name: "updated_by", nullable: true })
  updatedBy: string | null;

  @Column("character varying", { name: "middle_name", length: 255 })
  middleName: string;

  @Column("character varying", { name: "zip_code", length: 20 })
  zipCode: string;

  @Column("timestamp with time zone", { name: "created_date" })
  createdDate: Date;

  @Column("timestamp with time zone", { name: "updated_date", nullable: true })
  updatedDate: Date | null;

  @Column("character varying", { name: "gender", nullable: true, length: 10 })
  gender: string | null;

  @Column("integer", { name: "role_id", nullable: true })
  roleId: number | null;

  @Column("character varying", {
    name: "country_code",
    nullable: true,
    length: 10
  })
  countryCode: string | null;

  @Column("character varying", { name: "address", nullable: true, length: 500 })
  address: string | null;

  @Column("integer", { name: "country_id", nullable: true })
  countryId: number | null;

  @Column("integer", { name: "state_id", nullable: true })
  stateId: number | null;

  @Column("character varying", { name: "city_name", nullable: true, length: 255 })
  cityName: string | null;

  @Column("character varying", { name: "title", nullable: true, length: 10 })
  title: string | null;

  @Column("integer", { name: "preferred_language", nullable: true })
  preferredLanguage: number | null;

  @Column("character varying", {
    name: "register_via",
    nullable: true,
    length: 20
  })
  registerVia: string | null;

  @Column("date", { name: "next_subscription_date", nullable: true })
  nextSubscriptionDate: string | null;

  @OneToMany(
    () => ActivityLog,
    activityLog => activityLog.user
  )
  activityLogs: ActivityLog[];

  @OneToMany(
    () => Booking,
    booking => booking.user
  )
  bookings: Booking[];

  @OneToMany(
    () => BookingInstalments,
    bookingInstalments => bookingInstalments.user
  )
  bookingInstalments: BookingInstalments[];

  @OneToMany(
    () => Language,
    language => language.updatedBy
  )
  languages: Language[];

  @OneToMany(
    () => LayCreditEarn,
    layCreditEarn => layCreditEarn.creditBy2
  )
  layCreditEarns: LayCreditEarn[];

  @OneToMany(
    () => LayCreditEarn,
    layCreditEarn => layCreditEarn.user
  )
  layCreditEarns2: LayCreditEarn[];

  @OneToMany(
    () => LayCreditRedeem,
    layCreditRedeem => layCreditRedeem.redeemBy2
  )
  layCreditRedeems: LayCreditRedeem[];

  @OneToMany(
    () => LayCreditRedeem,
    layCreditRedeem => layCreditRedeem.user
  )
  layCreditRedeems2: LayCreditRedeem[];

  @OneToMany(
    () => LoginLog,
    loginLog => loginLog.user
  )
  loginLogs: LoginLog[];

  @OneToMany(
    () => Module,
    module => module.updatedBy
  )
  modules: Module[];

  @OneToMany(
    () => PlanSubscription,
    planSubscription => planSubscription.user
  )
  planSubscriptions: PlanSubscription[];

  @OneToMany(
    () => Supplier,
    supplier => supplier.updatedBy2
  )
  suppliers: Supplier[];

  @ManyToOne(
    () => Countries,
    countries => countries.users
  )
  @JoinColumn([{ name: "country_id", referencedColumnName: "id" }])
  country: Countries;

  @ManyToOne(
    () => User,
    user => user.users
  )
  @JoinColumn([{ name: "created_by", referencedColumnName: "userId" }])
  createdBy2: User;

  @OneToMany(
    () => User,
    user => user.createdBy2
  )
  users: User[];

  @ManyToOne(
    () => Language,
    language => language.users
  )
  @JoinColumn([{ name: "preferred_language", referencedColumnName: "id" }])
  preferredLanguage2: Language;

  @ManyToOne(
    () => States,
    states => states.users
  )
  @JoinColumn([{ name: "state_id", referencedColumnName: "id" }])
  state: States;

  @ManyToOne(
    () => User,
    user => user.users2
  )
  @JoinColumn([{ name: "updated_by", referencedColumnName: "userId" }])
  updatedBy2: User;

  @OneToMany(
    () => User,
    user => user.updatedBy2
  )
  users2: User[];

  @OneToMany(
    () => UserCard,
    userCard => userCard.user
  )
  userCards: UserCard[];

  @OneToMany(
    () => UserDeviceDetail,
    userDeviceDetail => userDeviceDetail.user
  )
  userDeviceDetails: UserDeviceDetail[];

  async validatePassword(password: string): Promise<boolean> {
		const hash = await bcrypt.hash(password, this.salt);
		return hash === this.password;
	}
}
