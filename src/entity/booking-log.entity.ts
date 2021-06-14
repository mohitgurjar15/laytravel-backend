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

@Index("booking_log_module_id", ["moduleId"], {})
@Index("booking_log_booking_id", ["bookingId"], {})
@Entity("booking_log")
export class BookingLog extends BaseEntity {
    @Column("uuid", { primary: true, name: "id" })
    id: string;

    @Column("uuid", { name: "booking_id", nullable: true })
    bookingId: string | null;

    @Column("integer", { name: "module_id",nullable: true })
    moduleId: number | null;

    @Column("json", { name: "cart_info",nullable: true })
    cartInfo: object | null;

    @Column("character varying", { name: "payment_authorize_log", nullable: true })
    paymentAuthorizeLog: string | null;

    @Column("character varying", { name: "cart_book_log", nullable: true })
    cartBookLog: string |  null;

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


    @ManyToOne(
        () => Module,
        module => module.bookinglogs
    )
    @JoinColumn([{ name: "module_id", referencedColumnName: "id" }])
    module: Module;

    
    @ManyToOne(
        () => Booking,
        module => module.bookinglogs
    )
    @JoinColumn([{ name: "booking_id", referencedColumnName: "id" }])
    booking: Booking;
}
