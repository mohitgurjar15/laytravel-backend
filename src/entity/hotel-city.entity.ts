import {
    BaseEntity,
    Column,
    Entity,
    Index,
    PrimaryGeneratedColumn,
  } from 'typeorm';

  export class HotelCity extends BaseEntity {
    @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
    id: number;
  
    @Column('character varying', { name: 'cityid_ppn', length: 100 })
    cityid_ppn: string;
  
    @Column('character varying', { name: 'cityid_a', length: 100, nullable: true })
    cityid_a: string;
  
    @Column('character varying', { name: 'cityid_b', length: 100, nullable: true  })
    cityid_b: string;

    @Column('character varying', { name: 'cityid_t', length: 100 })
    cityid_t: string;

    @Column('character varying', { name: 'city', length: 100 })
    city: string;

    @Column('character varying', { name: 'state', length: 100, nullable: true })
    state: string;

    @Column('character varying', { name: 'country', length: 100 })
    country: string;

    @Column('character varying', { name: 'state_code', length: 100 })
    state_code: string;

    @Column('character varying', { name: 'country_code', length: 100 })
    country_code: string;

    @Column('character varying', { name: 'latitude', length: 100 })
    latitude: string;

    @Column('character varying', { name: 'longitude', length: 100 })
    longitude: string;

    @Column('character varying', { name: 'timezone', length: 100 })
    timezone: string;
  }
  