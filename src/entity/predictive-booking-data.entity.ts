import { BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Booking } from "./booking.entity";

@Index("booking_id_idx2", ["bookingId"], {})

@Entity("predictive_booking_data")
export class PredictiveBookingData extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("character varying", { name: "booking_id" })
    bookingId: string;

    @Column("integer", { name: "price" })
    price: number;

    @Column("date", { name: "created_date", nullable: true })
    date: Date;

    @Column("boolean", { name: "is_below_minimum", default: false })
    isBelowMinimum: boolean;

    @Column("boolean", { name: "book_it", default: false })
    bookIt: boolean;

    @ManyToOne(
        () => Booking,
        booking => booking.id
    )
    @JoinColumn([{ name: "booking_id", referencedColumnName: "id" }])
    booking: Booking;
}
