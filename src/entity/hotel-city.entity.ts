import {
    BaseEntity,
    Column,
    Entity,
    Index,
    PrimaryGeneratedColumn,
  } from 'typeorm';

  @Entity('hotel_cities')
  export class HotelCity extends BaseEntity {
    @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
    id: number;
  
    @Column('character varying', { name: 'cityid_ppn', length: 100 })
    cityidPpn: string;
  
    @Column('character varying', { name: 'cityid_a', length: 100, nullable: true })
    cityIdA: string;
  
    @Column('character varying', { name: 'cityid_b', length: 100, nullable: true  })
    cityIdB: string;

    @Column('character varying', { name: 'cityid_t', length: 100 })
    cityIdT: string;

    @Column('character varying', { name: 'city', length: 100 })
    city: string;

    @Column('character varying', { name: 'state', length: 100, nullable: true })
    state: string;

    @Column('character varying', { name: 'country', length: 100 })
    country: string;

    @Column('character varying', { name: 'state_code', length: 100 })
    stateCode: string;

    @Column('character varying', { name: 'country_code', length: 100 })
    countryCode: string;

    @Column('character varying', { name: 'latitude', length: 100 })
    latitude: string;

    @Column('character varying', { name: 'longitude', length: 100 })
    longitude: string;

    @Column('character varying', { name: 'timezone', length: 100 })
    timeZone: string;
  }
  