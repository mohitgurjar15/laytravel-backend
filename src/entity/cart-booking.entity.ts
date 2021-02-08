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
import { User } from "./user.entity";
import { Booking } from "./booking.entity";

@Index("cart_booking_user_id", ["userId"], {})

@Entity("cart_booking")
export class CartBooking extends BaseEntity {
    @Column("uuid", { primary: true, name: "id" })
    id: string;

    @Column("uuid", { name: "user_id" })
    userId: string;

    @Column("integer", { name: "booking_type" })
    bookingType: number;

    @Column("integer", { name: "status" })
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


    @ManyToOne(
        () => User,
        user => user.bookings
    )
    @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
    user: User;

    @OneToMany(
        () => Booking,
        booking => booking.cartId
    )
    bookings: Booking[];

}
