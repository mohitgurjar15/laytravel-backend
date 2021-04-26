import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Index('priceline_hotel_ids_idx_ids', ['refId', 'hotelId'], {})
@Index('priceline_hotel_ids_idx_hotelId', ['hotelId'], {})
@Index('priceline_hotel_ids_idx_refId', ['refId'], {})
@Entity('priceline_hotel_ids')
export class PricelineHotelIds extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'ref_id', length: 100 })
  refId: string;

  @Column('character varying', { name: 'ref_id2', length: 100, nullable: true })
  refId2: string;

  @Column('character varying', { name: 'hotel_id', length: 100, unique: true })
  hotelId: string;

  //   @Column("text", { name: "activity_name" })
  //   activityName: string;

  //   @Column("timestamp without time zone", { name: "created_date" })
  //   createdDate: Date;

  //   @Column("json", { name: "previous_value", nullable: true })
  //   previousValue: object;

  //   @Column("json", { name: "current_value", nullable: true })
  //   currentValue: object;

  //   @ManyToOne(
  //     () => User,
  //     user => user.activityLogs
  //   )
  //   @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  //   user: User;
}
