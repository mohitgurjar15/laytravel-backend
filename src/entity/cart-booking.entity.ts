import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
} from "typeorm";
import { User } from "./user.entity";
import { Booking } from "./booking.entity";
import { OtherPayments } from "./other-payment.entity";
import { LandingPages } from "./landing-page.entity";

@Index("cart_booking_user_id", ["userId"], {})
@Entity("cart_booking")
export class CartBooking extends BaseEntity {
    @Column("uuid", { primary: true, name: "id" })
    id: string;

    @Column("uuid", { name: "user_id" })
    userId: string;

    @Column("integer", { name: "booking_type" })
    bookingType: number;

    @Column("integer", { name: "status", default: 0 })
    status: number;

    @Column("date", { name: "booking_date" })
    bookingDate: Date;

    @Column("date", { name: "update_date", nullable: true })
    updateDate: Date;

    @Column("date", { name: "check_in_date", nullable: true })
    checkInDate: Date;

    @Column("date", { name: "check_out_date", nullable: true })
    checkOutDate: Date;

    @Column("character varying", { name: "laytrip_cart_id" })
    laytripCartId: string;

    @OneToMany(
        () => OtherPayments,
        (otherPayments) => otherPayments.booking
    )
    otherPayments: OtherPayments[];

    @Column("json", { name: "refund_payment_info", nullable: true })
    refundPaymentInfo: object;

    @ManyToOne(
        () => User,
        (user) => user.bookings
    )
    @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
    user: User;

    @OneToMany(
        () => Booking,
        (booking) => booking.cart
    )
    bookings: Booking[];

    @Column("uuid", { name: "referral_id" , nullable : true })
    referralId: string;

    @ManyToOne(
        () => LandingPages,
        (landingPages) => landingPages.refferalBookings
    )
    @JoinColumn([{ name: "referral_id", referencedColumnName: "id" }])
    referral: LandingPages;
}
