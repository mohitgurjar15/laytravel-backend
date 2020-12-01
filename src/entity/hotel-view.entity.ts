import {
    Index,
    Entity,
    BaseEntity,
    Column,
    PrimaryGeneratedColumn
  } from 'typeorm';
  
  @Index("hotel_view_id", ["id"], {})
  @Index("hotel_view_hotel_id", ["hotelId"], {})
  @Index("hotel_view_name", ["city"], {})
  @Index("hotel_view_state_name", ["state"], {})
  @Index("hotel_view_country_name", ["country"], {})
  @Index("hotel_view_hotel_latitude", ["latitude"], {})
  @Index("hotel_view_longitude", ["longitude"])
  @Entity('hotel_view')
  export class HotelView extends BaseEntity {
  
    @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
    id: number;
  
    @Column('character varying', { name: 'suuplier_code', length: 255 })
    suplierCode: string;
  
    @Column('bigint', { name: 'hotel_id'})
    hotelId: number;
  
    @Column('character varying', { name: 'hotel_name', length: 255 })
    hotelName: string;
  
    @Column('character varying', { name: 'hotel_category', length: 255,nullable: true  })
    hotelCategory: string;
  
    @Column('character varying', { name: 'city' ,nullable: true })
    city: string;
  
  
    @Column('character varying', { name: 'state' ,nullable: true })
    state: string;
  
    @Column('character varying', { name: 'country' ,nullable: true })
    country: string;
  
    @Column('float', { name: 'latitude' })
    latitude: string;
  
    @Column('float', { name: 'longitude' })
    longitude: string;
  
  }
  