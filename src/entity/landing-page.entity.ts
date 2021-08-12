import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Module } from "./module.entity";
import { CartBooking } from "./cart-booking.entity";
import { LandingPageDownPaymentConfig } from "./landing-page-downPayment.entity";
import { LandingPageDiscountConfig } from "./landing-page-discount.entity";

@Index("landing_pages_name", ["name"], { unique: true })
@Entity("landing_pages")
export class LandingPages extends BaseEntity {
    @Column("uuid", {
        name: "id",
        primary: true,
    })
    id: string;

    @Column("date", { name: "created_date" })
    createdDate: Date;

    @Column("character varying", { name: "name", length: 100, nullable: true })
    name: string;

    @Column("character varying", {
        name: "templete",
        length: 100,
        nullable: true,
    })
    templete: string;

    @Column("date", { name: "updated_date", nullable: true })
    updatedDate: Date;

    @Column("boolean", { name: "is_deleted", default: false })
    isDeleted: boolean;

    @Column("boolean", { name: "status", default: true })
    status: Boolean;

    @Column("uuid", { name: "user_id" })
    userId: string;

    @Column("uuid", { name: "update_by", nullable: true })
    updateBy: string;

    // @Column("boolean",{name:"is_default_setting_applied"})
    // isDefaultSettingApplied : boolean

    @ManyToOne(
        () => User,
        (user) => user.updateLandingPage
    )
    @JoinColumn([{ name: "update_by", referencedColumnName: "userId" }])
    updateByUser: User;

    @ManyToOne(
        () => User,
        (user) => user.createLandingPage
    )
    @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
    createByUser: User;

    @OneToMany(
        () => User,
        (user) => user.referral
    )
    refferalUsers: User[];

    @OneToMany(
        () => CartBooking,
        (cartBooking) => cartBooking.referral
    )
    refferalBookings: CartBooking[];

    @OneToMany(
        () => LandingPageDownPaymentConfig,
        config => config.category
    )
    landingPageDownPaymentConfig: LandingPageDownPaymentConfig[];

    @OneToMany(
        () => LandingPageDiscountConfig,
        config => config.category
    )
    landingPageDiscountConfig: LandingPageDiscountConfig[];
}
