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
import { UserCard } from "./user-card.entity";
import * as bcrypt from "bcrypt";
import { Module } from "./module.entity";
import { UserDeviceDetail } from "./user-device-detail.entity";
import { Role } from "./role.entity";
import { Countries } from "./countries.entity";
import { States } from "./states.entity";


//@Index("user_pk", ["userId"], { unique: true })
@Entity("user")
export class User extends BaseEntity {
  @Column("uuid", { primary: true, name: "user_id" })
  userId: string;

  @Column("integer", { name: "role_id" , nullable: true})
  roleId: number | null;
  
  @Column("character varying", { name: "first_name", length: 255 })
  firstName: string;

  @Column("character varying", { name: "middle_name", length: 255 })
  middleName: string;

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
  password: string | null

  @Column("character varying", { name: "phone_no", length: 20 })
  phoneNo: string;

  @Column("character varying", { name: "profile_pic", length: 255 })
  profilePic: string;

  @Column("character varying", { name: "timezone", length: 255 })
  timezone: string;

  @Column("character varying", { name: "zip_code", length: 20 })
  zipCode: string;

  @Column("integer", { name: "status" })
  status: number;

  @Column("character varying", { name :"gender", length:10, nullable : true})
  gender:string

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

  @Column("boolean", { name: "is_deleted", default: () => "false" })
  isDeleted: boolean;

  @Column("timestamp with time zone", { name: "created_date" })
	createdDate: Date;

  @Column("timestamp with time zone", { name: "updated_date", nullable: true })
	updatedDate: Date | null;

  @OneToMany(
    () => Booking,
    booking => booking.user
  )
  bookings: Booking[];

  @ManyToOne(
    () => User,
    user => user.users
  )
  @JoinColumn([{ name: "created_by", referencedColumnName: "userId" }])
  createdBy: User;

  @OneToMany(
    () => User,
    user => user.createdBy
  )
  users: User[];

  @ManyToOne(
    () => User,
    user => user.users2
  )
  @JoinColumn([{ name: "updated_by", referencedColumnName: "userId" }])
  updatedBy: User;

  @OneToMany(
    () => User,
    user => user.updatedBy
  )
  users2: User[];

  @OneToMany(
    () => UserCard,
    userCard => userCard.user
  )
  userCards: UserCard[];

  @OneToMany(
    () => Module,
    module => module.updatedBy
  )
  modules: Module[];

  @OneToMany(
		() => UserDeviceDetail,
		(userDeviceDetail) => userDeviceDetail.user,
	)
  userDeviceDetails: UserDeviceDetail[];
  
  @ManyToOne(
    () => Countries,
    countries => countries.users
  )
  @JoinColumn([{ name: "country_id", referencedColumnName: "id" }])
  country: Countries;

  @ManyToOne(
    () => States,
    states => states.users
  )
  @JoinColumn([{ name: "state_id", referencedColumnName: "id" }])
  state: States;

  async validatePassword(password: string): Promise<boolean> {
		const hash = await bcrypt.hash(password, this.salt);
		return hash === this.password;
	}
}
