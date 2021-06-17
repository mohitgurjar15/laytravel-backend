import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Booking } from "./booking.entity";
import { User } from "./user.entity";

@Index("booking_id_idx", ["bookingId"], {})
//@Index("user_id_idx", ["userId"], {})
// @Index("property_id_idx", ["propertyId"], {})

@Entity("intial_cancel_booking")
export class IntialCancelBooking extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("character varying", { name: "booking_id", nullable: true })
    bookingId: string;

    @Column("character varying", { name: "create_by" })
    createBy: string;

    @Column("character varying", { name: "update_by",nullable:true })
    updateBy: string;

    @Column("text", { name: "message", nullable: true })
    message: string;

    @Column("date", { name: "created_date", nullable: true })
    createdDate: Date;

    @Column("date", { name: "updated_date", nullable: true })
    updatedDate: Date;

    @Column("integer", { name: "status" })
    status: number;

    @Column("integer", { name: "count" , default : 0 })
    count: number;

    @Column("timestamp without time zone", {
        name: "resend_on",
        nullable: true,
    })
    resendOn: Date;

    @ManyToOne(
        () => Booking,
        (booking) => booking.id
    )
    @JoinColumn([{ name: "booking_id", referencedColumnName: "id" }])
    booking: Booking;

    @ManyToOne(
        () => User,
        (user) => user.userId
    )
    @JoinColumn([{ name: "create_by", referencedColumnName: "userId" }])
    createdBy: User;

    @ManyToOne(
        () => User,
        (user) => user.userId
    )
    @JoinColumn([{ name: "update_by", referencedColumnName: "userId" }])
    updatedBy: User;

    //   @Column("boolean", { name: "status" , default : true})
    //   status: boolean;
}
