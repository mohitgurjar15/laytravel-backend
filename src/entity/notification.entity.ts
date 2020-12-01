import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { User } from "./user.entity";
import { Module } from "./module.entity";

@Index("notification_pk", ["id"], { unique: true })
@Entity("notification")
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "type", length: 50 })
  type: string;

  @Column("character varying", { name: "resource_id", length: 255 })
  resourceId: string;

  @Column("text", { name: "message" })
  message: string;

  @Column("date", { name: "created_date" })
  createdDate: string;

  @ManyToOne(
    () => User,
    user => user.notifications
  )
  @JoinColumn([{ name: "from_user_id", referencedColumnName: "userId" }])
  fromUser: User;

  @ManyToOne(
    () => Module,
    module => module.notifications
  )
  @JoinColumn([{ name: "module_id", referencedColumnName: "id" }])
  module: Module;

  @ManyToOne(
    () => User,
    user => user.notifications2
  )
  @JoinColumn([{ name: "to_user_id", referencedColumnName: "userId" }])
  toUser: User;
}
