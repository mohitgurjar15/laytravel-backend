import { BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Booking } from "./booking.entity";
import { User } from "./user.entity";

//@Index("booking_id_idx", ["bookingId"], {})
@Index("user_id_idx", ["userId"], {})
// @Index("property_id_idx", ["propertyId"], {})


@Entity("laytrip_booking_feedback")
export class BookingFeedback extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "user_id" })
  userId: string;

  @Column("integer", { name: "rating" })
  rating: number;

  @Column("text", { name: "message" })
  message: string;

  @Column("date", { name: "created_date" ,nullable : true})
  createdDate: Date;

  @Column("date", { name: "updated_date" ,nullable : true })
  updatedDate: Date;

  @Column("boolean", { name: "is_deleted" , default : true})
  isDeleted: boolean;

  @ManyToOne(
    () => User,
    user => user.userId
  )
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;

}
