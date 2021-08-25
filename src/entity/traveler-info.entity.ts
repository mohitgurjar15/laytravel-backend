import {
	Entity,
	BaseEntity,
	PrimaryGeneratedColumn,
	Column,
	OneToOne,
	JoinColumn,
	ManyToOne,
	Index,
	OneToMany,
} from "typeorm";
import { User } from "./user.entity";
import { Booking } from "./booking.entity";
import { TravelerInfoModel } from "src/config/email_template/model/traveler-info.model";
import { OtherPayments } from "./other-payment.entity";

@Index("userId_idx", ["userId"], {})
@Index("bookingId_idx", ["bookingId"], {})
@Entity("traveler_info")
export class TravelerInfo extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("uuid", { name: "booking_id" })
    bookingId: string;

    @Column("uuid", { name: "user_id",nullable: true  })
    userId: string;

    @Column("character varying", { name: "role_id",nullable: true  })
    roleId: number;

    @Column("json", { name: "traveler_info", nullable: true })
    travelerInfo: TravelerInfoModel;

    @Column("uuid", { name: "update_by", nullable: true })
    updateBy: string;

    @Column("boolean", { name: "is_primary", default: () => false })
    isPrimary: boolean;

     @Column("json", { name: "old_traveler_info", nullable: true })
    oldTravelerInfo: TravelerInfoModel;

    @ManyToOne(
        () => Booking,
        (booking) => booking.travelers
    )
    @JoinColumn([{ name: "booking_id", referencedColumnName: "id" }])
    bookingData: Booking;

    @ManyToOne(
        () => User,
        (User) => User.traveler
    )
    @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
    userData: User;

    @OneToMany(
        () => OtherPayments,
        (otherPayments) => otherPayments.travelerInfo
    )
    charges: OtherPayments[];
}
