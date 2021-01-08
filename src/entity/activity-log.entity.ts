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

//@Index("activity_log_pk", ["id"], { unique: true })
@Index("actvity_user_id", ["userId"], {})
@Entity("activity_log")
export class ActivityLog extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("uuid", { name: "user_id" })
  userId: string;

  @Column("character varying", { name: "module_name", length: 100 })
  moduleName: string;

  @Column("text", { name: "activity_name" })
  activityName: string;

  @Column("timestamp without time zone", { name: "created_date" })
  createdDate: Date;

  @Column("json", { name: "previous_value", nullable: true })
  previousValue: object;

  @Column("json", { name: "current_value", nullable: true })
  currentValue: object;

  @ManyToOne(
    () => User,
    user => user.activityLogs
  )
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;
}
