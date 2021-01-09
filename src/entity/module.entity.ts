import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { Booking } from "./booking.entity";
import { BookingInstalments } from "./booking-instalments.entity";
import { Invoice } from "./invoice.entity";
import { User } from "./user.entity";
import { Supplier } from "./supplier.entity";
import { Markup } from "./markup.entity";
import { Notification } from "./notification.entity";
import { Cart } from "./cart.entity";
import { SearchLog } from "./search-log.entity";
//@Index("module_pk", ["id"], { unique: true })
@Entity("module")
export class Module extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name", length: 50 })
  name: string;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @Column("boolean", { name: "mode", default: () => "false" })
  mode: boolean;

  @Column("text", { name: "live_credential", nullable:true })
  liveCredential: string;

  @Column("text", { name: "test_credential", nullable:true })
  testCredential: string;

  @Column("uuid", { name: "created_by" })
  createdBy: string;

  @Column("date", { name: "created_date" })
  createdDate: Date;

  @Column("date", { name: "update_date" })
  updateDate: Date;

  @OneToMany(
    () => Booking,
    booking => booking.module
  )
  bookings: Booking[];

  @OneToMany(
    () => Cart,
    booking => booking.module
  )
  cartList: Cart[];

  @OneToMany(
    () => BookingInstalments,
    bookingInstalments => bookingInstalments.module
  )
  bookingInstalments: BookingInstalments[];

  @OneToMany(
    () => Invoice,
    invoice => invoice.module
  )
  invoices: Invoice[];

  @OneToMany(
    () => Markup,
    markup => markup.module
  )
  markups: Markup[];

  @ManyToOne(
    () => User,
    user => user.modules
  )
  @JoinColumn([{ name: "updated_by", referencedColumnName: "userId" }])
  updatedBy: User;

  @OneToMany(
    () => Supplier,
    supplier => supplier.module
  )
  suppliers: Supplier[];

  @OneToMany(
    () => Notification,
    notification => notification.module
  )
  notifications: Notification[];

  @OneToMany(
    () => SearchLog,
    searchLog => searchLog.module
  )
  searchLog: SearchLog[];
}
