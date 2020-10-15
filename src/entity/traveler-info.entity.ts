import {
	Entity,
	BaseEntity,
	PrimaryGeneratedColumn,
	Column,
	OneToOne,
	JoinColumn,
    ManyToOne,
	Index,
} from "typeorm";
import { User } from "./user.entity";
import { Booking } from "./booking.entity";

@Index("userId_idx", ["userId"], {})
@Index("bookingId_idx", ["bookingId"], {})

@Entity("traveler_info")
export class TravelerInfo extends BaseEntity {
	@PrimaryGeneratedColumn({ type: "integer", name: "id" })
	id: number;

	@Column("uuid", { name: "booking_id" })
	bookingId: string;

	@Column("uuid", { name: "user_id" })
	userId: string;

	@Column("character varying", { name: "role_id" })
	roleId: number;

	@ManyToOne(
		() => User,
		User => User.traveler
	)
	@JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
	userData: User;

	@ManyToOne(
		() => Booking,
		booking => booking.travelers
	)
	@JoinColumn([{ name: "booking_id", referencedColumnName: "id" }])
	bookingData: Booking;
}
