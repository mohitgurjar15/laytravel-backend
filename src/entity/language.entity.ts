import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { User } from "./user.entity";

//@Index("language_pk", ["id"], { unique: true })
@Entity("language")
export class Language extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number; 

  @Column("character varying", { name: "name", length: 100, nullable:true })
  name: string;

  @Column("character varying", { name: "iso_1_code", length: 5 })
  iso_1Code: string;

  @Column("character varying", { name: "iso_2_code", length: 5 })
  iso_2Code: string;

  @Column("boolean", { name: "active", default: () => "true" })
  active: boolean;

  @Column("boolean", { name: "is_deleted", default: () => "false" })
  isDeleted: boolean;

  @Column("date", { name: "updated_date" })
  updatedDate: Date;

  @ManyToOne(
    () => User,
    user => user.userId
  )
  @JoinColumn([{ name: "updated_by", referencedColumnName: "userId" }])
  updatedBy: User;

  @OneToMany(
    () => User,
    user => user.preferredLanguage2
  )
  users: User[];
}
