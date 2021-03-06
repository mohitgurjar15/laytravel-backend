import { Module } from "./module.entity";
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne
} from "typeorm";
import { Booking } from "./booking.entity";
import { CartBooking } from "./cart-booking.entity";

// @Index("booking_log_module_id", ["moduleId"], {})
@Index("booking_log_booking_id", ["cartBookingId"], {})
@Entity("booking_log")
export class BookingLog extends BaseEntity {
    @Column("uuid", { primary: true, name: "id" })
    id: string;

    @Column("uuid", { name: "cart_booking_id", nullable: true })
    cartBookingId: string | null;

    // @Column("integer", { name: "module_id",nullable: true })
    // moduleId: number | null;

    @Column("integer", { name: "last_updated_timestamp", default: 0, nullable: true })
    timeStamp: number;

    @Column("json", { name: "cart_info",nullable: true })
    cartInfo: object | null;

    @Column("character varying", { name: "payment_authorize_log", nullable: true })
    paymentAuthorizeLog: string | null;

    @Column("character varying", { name: "payment_refund_log", nullable: true })
    paymentRefundLog: string | null;

    @Column("json", { name: "cart_book_log", nullable: true })
    cartBookLog: object | null;

    @Column("character varying", { name: "markup_formula", nullable: true })
    markupFormula: string | null;

    @Column("character varying", { name: "supplier_availability_log", nullable: true })
    supplierAvailabilityLog: string | null;

    @Column("character varying", { name: "suppllier_booking_log", nullable: true })
    suppllierBookingLog: string | null;

    @Column("character varying", { name: "payment_capture_log", nullable: true })
    paymentCaptureLog: string | null;

    @Column("character varying", { name: "other", nullable: true })
    other: string |  null;

    @Column("character varying", { name: "error", nullable: true })
    error: string | null;


    @ManyToOne(
        () => Module,
        module => module.bookinglogs
    )
    @JoinColumn([{ name: "module_id", referencedColumnName: "id" }])
    module: Module;

    
    @ManyToOne(
        () => CartBooking,
        module => module.bookinglogs
    )
    @JoinColumn([{ name: "cart_booking_id", referencedColumnName: "id" }])
    cartBookings: CartBooking;
}
