import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne
} from "typeorm";
import * as bcrypt from "bcrypt";
import { EncryptionTransformer } from "typeorm-encrypted";
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
import { Markup } from "./markup.entity";
import { Currency } from "./currency.entity";
import { TravelerInfo } from "./traveler-info.entity";
import { OtherPayments } from "./other-payment.entity";
import { Notification } from "./notification.entity";
import { Deal } from "./deal.entity";
import { DeleteUserAccountRequest } from "./delete-user-account-request.entity";
import { CryptoKey } from "src/config/common.config";
@Index("user_country_id", ["countryId"], {})
@Index("user_created_by", ["createdBy"], {})
@Index("user_preferred_language", ["preferredLanguage"], {})
@Index("user_preferred_currency", ["preferredCurrency"], {})
@Index("user_state_id", ["stateId"], {})
@Index("user_updated_by", ["updatedBy"], {})
//@Index("user_pk", ["userId"], { unique: true })
@Entity("user")
export class User extends BaseEntity {
  @Column("uuid", { primary: true, name: "user_id" })
  userId: string;

  @Column("character varying", { name: "first_name", nullable: true, transformer: new EncryptionTransformer(CryptoKey) })
  firstName: string;

  @Column("character varying", { name: "last_name", nullable: true, transformer: new EncryptionTransformer(CryptoKey) })
  lastName: string;

  @Column("integer", { name: "account_type" })
  accountType: number;

  @Column("character varying", { name: "social_account_id", length: 255 })
  socialAccountId: string;

  @Column("character varying", { name: "email", nullable: true, transformer: new EncryptionTransformer(CryptoKey) })
  email: string | null;

  @Column("character varying", { name: "salt", length: 255, nullable: true })
  salt: string | null;

  @Column("character varying", { name: "password", length: 255, nullable: true })
  password: string | null;

  @Column("character varying", { name: "phone_no", nullable: true, transformer: new EncryptionTransformer(CryptoKey) })
  phoneNo: string;

  @Column("character varying", { name: "home_airport", nullable: true})
  homeAirport: string;

  @Column("character varying", {
    name: "profile_pic",
    nullable: true,
    length: 255
  })
  profilePic: string | null;

  @Column("character varying", { name: "timezone", length: 255 })
  timezone: string;

  @Column("integer", { name: "status" })
  status: number;

  @Column("boolean", { name: "is_deleted", default: () => "false" })
  isDeleted: boolean;

  @Column("boolean", { name: "is_verified", default: () => "false" })
  isVerified: boolean;

  @Column("integer", { name: "otp", nullable: true })
  otp: number;

  @Column("uuid", { name: "created_by", nullable: true })
  createdBy: string | null;

  @Column("uuid", { name: "parent_guest_user_id", nullable: true })
  parentGuestUserId: string | null;

  @Column("uuid", { name: "updated_by", nullable: true })
  updatedBy: string | null;

  @Column("character varying", { name: "middle_name", length: 255 })
  middleName: string;

  @Column("character varying", { name: "zip_code", length: 20, nullable: true })
  zipCode: string;

  @Column("timestamp with time zone", { name: "created_date" })
  createdDate: Date;

  @Column("timestamp with time zone", { name: "updated_date", nullable: true })
  updatedDate: Date | null;

  @Column("character varying", { name: "gender", nullable: true, transformer: new EncryptionTransformer(CryptoKey) })
  gender: string;

  @Column("integer", { name: "role_id", nullable: true })
  roleId: number | null;

  @Column("character varying", {
    name: "country_code",
    nullable: true,
    length: 30
  })
  countryCode: string | null;

  @Column("text", { name: "address", nullable: true, transformer: new EncryptionTransformer(CryptoKey) })
  address: string;

  @Column("integer", { name: "country_id", nullable: true })
  countryId: number | null;

  @Column("integer", { name: "state_id", nullable: true })
  stateId: number | null;

  @Column("character varying", { name: "title", nullable: true, transformer: new EncryptionTransformer(CryptoKey) })
  title: string;

  @Column("integer", { name: "preferred_language", nullable: true })
  preferredLanguage: number | null;

  @Column("integer", { name: "preferred_currency", nullable: true })
  preferredCurrency: number | null;

  user_type: string;

  age: number;


  @Column("character varying", {
    name: "register_via",
    nullable: true,
    length: 20
  })
  registerVia: string | null;

  @Column("date", { name: "next_subscription_date", nullable: true })
  nextSubscriptionDate: Date | null;

  @Column("character varying", {
    name: "city_name",
    nullable: true,
    transformer: new EncryptionTransformer(CryptoKey)
  })
  cityName: string;



  @Column("character varying", { name: "dob", nullable: true, transformer: new EncryptionTransformer(CryptoKey) })
  dob: string;

  @Column("character varying", {
    name: "passport_number",
    nullable: true,
    transformer: new EncryptionTransformer(CryptoKey)
  })
  passportNumber: string;

  @Column("character varying", { name: "passport_expiry", nullable: true, transformer: new EncryptionTransformer(CryptoKey) })
  passportExpiry: string;

  get full_name() {
    return `${this.firstName} ${this.lastName}`;
  }

  @Column("boolean", { name: "is_email", default: true })
  isEmail: boolean;

  @Column("boolean", { name: "is_sms", default: true })
  isSMS: boolean;

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
    () => OtherPayments,
    otherPayments => otherPayments.user
  )
  otherPayments: OtherPayments[];

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
    () => Markup,
    markup => markup.updatedBy
  )
  markups: Markup[];

  @OneToMany(
    () => Module,
    module => module.updatedBy
  )
  modules: Module[];

  @OneToMany(
    () => Notification,
    notification => notification.fromUser
  )
  notifications: Notification[];

  @OneToMany(
    () => Notification,
    notification => notification.toUser
  )
  notifications2: Notification[];

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
    () => Currency,
    currency => currency.users
  )
  @JoinColumn([{ name: "preferred_currency", referencedColumnName: "id" }])
  preferredCurrency2: Currency;

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

  async validateOtp(Otp: number): Promise<boolean> {
    return Otp == this.otp;
  }

  @OneToMany(
    () => TravelerInfo,
    traveler => traveler.userData
  )
  traveler: TravelerInfo[];

  @OneToMany(
    () => Deal,
    deal => deal.updateBy)
  deal: Deal[];

  @OneToMany(
    () => DeleteUserAccountRequest,
    deleteUserAccountRequest => deleteUserAccountRequest.updateBy)
  deleteUserAccountRequest: DeleteUserAccountRequest[];


}
