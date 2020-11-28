import {
  Index,
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { HotelRoom } from './hotel-room.entity';

@Index("id_idx", ["id"], {})
@Index("hotel_code_idx", ["hotelCode"], {})
@Index("city_name_idx", ["city"], {})
@Index("state_name_idx", ["state"], {})
@Index("country_name_idx", ["country"], {})
@Index("hotel_latitude_idx", ["latitude"], {})
@Index("hotel_longitude_idx", ["longitude"])
@Entity('hotel_view')
export class HotelView extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'suuplier_code', length: 255 })
  suplierCode: string;

  @Column('bigint', { name: 'hotel_id'})
  hotelId: number;

  @Column('character varying', { name: 'hotel_code', length: 255 })
  hotelCode: string;

  @Column('character varying', { name: 'hotel_name', length: 255 })
  hotelName: string;

  @Column('character varying', { name: 'category_code', length: 255 ,nullable: true })
  categoryCode: string;

  @Column('character varying', { name: 'hotel_category', length: 255,nullable: true  })
  hotelCategory: string;

  @Column('date', { name: 'hotel_created_date',nullable: true })
  hotelCreatedDate: Date;


  @Column('json', { name: 'descriptions' ,nullable: true })
  descriptions: string;

  @Column('text', { name: 'additional_details' ,nullable: true })
  additionalDetails: string;

  @Column('text', { name: 'address_line1' ,nullable: true })
  addressLine1: string;


  @Column('text', { name: 'address_line2' ,nullable: true })
  addressLine2: string;

  @Column('character varying', { name: 'city' ,nullable: true })
  city: string;


  @Column('character varying', { name: 'state' ,nullable: true })
  state: string;

  @Column('character varying', { name: 'country' ,nullable: true })
  country: string;

  @Column("character", { name: "country_coe", nullable: true, length: 3 })
  CountryCode: string | null;

  @Column('character varying', { name: 'zip' ,nullable: true })
  zip: string;

  @Column('float', { name: 'latitude' })
  latitude: string;

  @Column('float', { name: 'longitude' })
  longitude: string;

  @Column('text', { name: 'amenties' ,nullable: true })
  amenties: string;

  @Column('text', { name: 'images' ,nullable: true })
  images: string;

  @Column('text', { name: 'banner_image' ,nullable: true })
  bannerImage: string;

  @Column('text', { name: 'activites' ,nullable: true })
  activites: string;

  // @OneToMany(
  //   () => HotelMonakarENRoom,
  //   HotelMonakarENRoom => HotelMonakarENRoom.hotelCode
  // )
  // @JoinColumn([{ name: "hotel_code", referencedColumnName: "hotel_code" }])
  // hotelRoom: HotelMonakarENRoom;
}
