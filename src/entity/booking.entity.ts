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
import { Currency } from "./currency.entity";
import { PaymentGateway } from "./payment-gateway.entity";
import { User } from "./user.entity";
import { Module } from "./module.entity";
import { Supplier } from "./supplier.entity";
import { BookingInstalments } from "./booking-instalments.entity";
import { TravelerInfo } from "./traveler-info.entity";
import { PredictiveBookingData } from "./predictive-booking-data.entity";
import { UserCard } from "./user-card.entity";
import { type } from "os";
import { CartBooking } from "./cart-booking.entity";
import { OtherPayments } from "./other-payment.entity";

@Index("booking_currency_id", ["currency"], {})
@Index("booking_module_id", ["moduleId"], {})
@Index("booking_paymnet_gateway_id", ["paymentGatewayId"], {})
@Index("booking_supplier_id", ["supplierId"], {})
@Index("booking_user_id", ["userId"], {})
//@Index("booking_pk", ["id"], { unique: true })
@Entity("booking")
export class Booking extends BaseEntity {
    @Column("uuid", { primary: true, name: "id" })
    id: string;

    @Column("uuid", { name: "user_id" })
    userId: string | null;

    @Column("integer", { name: "module_id" })
    moduleId: number | null;

    @Column("integer", { name: "booking_type" })
    bookingType: number;

    @Column("integer", { name: "booking_status" })
    bookingStatus: number;

    @Column("integer", { name: "currency" })
    currency: number | null;

    @Column("numeric", { name: "total_amount", precision: 15, scale: 3 })
    totalAmount: string;

    @Column("numeric", { name: "net_rate", precision: 15, scale: 3 })
    netRate: string;

    @Column("numeric", { name: "markup_amount", precision: 15, scale: 3 })
    markupAmount: string;

    @Column("numeric", {
        name: "usd_factor",
        precision: 15,
        scale: 3,
        default: 1,
    })
    usdFactor: string;

    @Column("date", { name: "booking_date" })
    bookingDate: string;

    @Column("integer", { name: "total_installments", default: 0 })
    totalInstallments: number;

    @Column("uuid", { name: "cart_id", nullable: true })
    cartId: string;

    @Column("date", { name: "predected_booking_date", nullable: true })
    predectedBookingDate: string;

    @Column("date", { name: "check_in_date", nullable: true })
    checkInDate: string;

    @Column("date", { name: "check_out_date", nullable: true })
    checkOutDate: string;

    @Column("json", { name: "location_info", nullable: true })
    locationInfo: object;

    @Column("json", { name: "module_info" })
    moduleInfo: object;

    @Column("integer", { name: "payment_gateway_id", nullable: true })
    paymentGatewayId: number | null;

    @Column("integer", { name: "payment_status" })
    paymentStatus: number;

    @Column("json", { name: "payment_info", nullable: true })
    paymentInfo: object;

    @Column("boolean", { name: "is_predictive", default: () => false })
    isPredictive: boolean;

    @Column("numeric", {
        name: "lay_credit",
        precision: 15,
        scale: 3,
        nullable: true,
    })
    layCredit: string | null;

    @Column("character varying", {
        name: "fare_type",
        length: 20,
        nullable: true,
    })
    fareType: string | null;

    @Column("character varying", {
        name: "booking_through",
        length: 20,
        nullable: true,
    })
    bookingThrough: string | null;

    @Column("character varying", {
        name: "card_token",
        length: 200,
        nullable: true,
    })
    cardToken: string | null;

    @Column("character varying", {
        name: "laytrip_booking_id",
        length: 200,
        nullable: true,
    })
    laytripBookingId: string | null;

    @Column("character varying", {
        name: "reservation_id",
        length: 200,
        nullable: true,
    })
    reservationId: string | null;

    @Column("character varying", {
        name: "category_name",
        length: 200,
        nullable: true,
    })
    categoryName: string | null;

    @Column("boolean", { name: "is_ticketd", default: () => false })
    isTicketd: boolean;

    @Column("text", { name: "message", nullable: true })
    message: string;

    @Column("numeric", {
        name: "payment_gateway_processing_fee",
        nullable: true,
        precision: 15,
        scale: 3,
    })
    paymentGatewayProcessingFee: string | null;

    @Column("integer", { name: "supplier_status", nullable: true })
    supplierStatus: number;

    @Column("integer", { name: "supplier_id", nullable: true })
    supplierId: number | null;

    @Column("date", { name: "next_instalment_date", nullable: true })
    nextInstalmentDate: string | null;

    @Column("character varying", {
        name: "supplier_booking_id",
        length: 255,
        nullable: true,
    })
    supplierBookingId: string | null;

    @ManyToOne(
        () => Currency,
        (currency) => currency.bookings
    )
    @JoinColumn([{ name: "currency", referencedColumnName: "id" }])
    currency2: Currency;

    @ManyToOne(
        () => Module,
        (module) => module.bookings
    )
    @JoinColumn([{ name: "module_id", referencedColumnName: "id" }])
    module: Module;

    @ManyToOne(
        () => PaymentGateway,
        (paymentGateway) => paymentGateway.bookings
    )
    @JoinColumn([{ name: "payment_gateway_id", referencedColumnName: "id" }])
    paymentGateway: PaymentGateway;

    @ManyToOne(
        () => Supplier,
        (supplier) => supplier.bookings
    )
    @JoinColumn([{ name: "supplier_id", referencedColumnName: "id" }])
    supplier: Supplier;

    @Column("timestamp without time zone", {
        name: "updated_date",
        nullable: true,
    })
    updatedDate: Date;

    @Column("uuid", { name: "update_by", nullable: true })
    updateBy: string | null;

    @Column("json", { name: "old_booking_info", nullable: true })
    oldBookingInfo: object;

    @ManyToOne(
        () => User,
        (user) => user.bookings
    )
    @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
    user: User;

    @ManyToOne(
        () => CartBooking,
        (cartBooking) => cartBooking.bookings
    )
    @JoinColumn([{ name: "cart_id", referencedColumnName: "id" }])
    cart: CartBooking;

    @OneToMany(
        () => BookingInstalments,
        (bookingInstalments) => bookingInstalments.booking
    )
    bookingInstalments: BookingInstalments[];

    @OneToMany(
        () => OtherPayments,
        (otherPayments) => otherPayments.booking
    )
    otherPayments: OtherPayments[];

    @OneToMany(
        () => TravelerInfo,
        (traveler) => traveler.bookingData
    )
    travelers: TravelerInfo[];

    @OneToMany(
        () => PredictiveBookingData,
        (predictiveBookingData) => predictiveBookingData.booking
    )
    predictiveBookingData: PredictiveBookingData[];

    // @ManyToOne(
    //   () => UserCard,
    //   card => card.bookings
    // )
    // @JoinColumn([{ name: "card_token", referencedColumnName: "cardToken" }])
    // card: UserCard;
}
