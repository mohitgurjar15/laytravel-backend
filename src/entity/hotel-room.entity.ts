import {
  Index,
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Index('id1', ['id'], {})
@Index('room_id1', ['roomId'], {})
@Index('room_code1', ['roomCode'], {})
@Index('hotel_code1', ['hotelCode'], {})
@Entity('hotel_room')
export class HotelRoom extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'hotel_code' })
  hotelCode: string;

  @Column('bigint', { name: 'room_id' })
  roomId: string;

  @Column('character varying', { name: 'room_code', length: 255 })
  roomCode: string;

  @Column('boolean', { name: 'is_nonSmoking', default: () => 'false' })
  isNoSmoking: boolean;
  @Column('boolean', { name: 'is_pet_allow', default: () => 'false' })
  isPetsAllowed: boolean;
  @Column('character varying', { name: 'room_name', length: 255 })
  roomName: string;

  @Column('integer', { name: 'max_adult', nullable: true })
  maxAdult: number;

  @Column('integer', { name: 'max_child', nullable: true })
  maxChild: number;

  @Column('integer', { name: 'max_infant', nullable: true })
  maxInfant: number;

  @Column('integer', { name: 'max_occupancy', nullable: true })
  maxOccupancy: number;

  @Column('integer', { name: 'number_of_bedrooms', nullable: true })
  numberOfBedrooms: number;

  @Column('float', { name: 'number_of_bathrooms', nullable: true })
  numberOfBathrooms: number;

  @Column('text', { name: 'segment_category', nullable: true })
  segmentCategory: string;

  @Column('text', { name: 'guest_room_infos', nullable: true })
  guestRoomInfos: string;

  @Column('text', { name: 'unit_type_views', nullable: true })
  unitTypeViews: string;

  @Column('text', { name: 'unit_type_locations', nullable: true })
  unitTypeLocations: string;

  @Column('text', { name: 'bed_types', nullable: true })
  bedTypes: string;

  @Column('text', { name: 'amenties', nullable: true })
  amenties: string;

  @Column('json', { name: 'descriptions', nullable: true })
  descriptions: string;

  @Column('text', { name: 'additional_details', nullable: true })
  additionalDetails: string;

  @Column('text', { name: 'age_qualifying_codes', nullable: true })
  ageQualifyingCodes: string;

  @Column('text', { name: 'images' ,nullable: true })
  images: string;

}
