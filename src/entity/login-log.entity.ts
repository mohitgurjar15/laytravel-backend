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

//@Index("login_log_pk", ["id"], { unique: true })
@Index("login_log_user_id", ["userId"], {})
@Entity("login_log")
export class LoginLog extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("uuid", { name: "user_id" })
  userId: string;

  @Column("character varying", { name: "ip_address", length: 25 })
  ipAddress: string;

  @Column("character varying", { name: "login_via", length: 25 })
  loginVia: string;

  @Column("text", { name: "login_agent" })
  loginAgent: string;

  @Column("timestamp without time zone", { name: "login_date" })
  loginDate: Date;

  @ManyToOne(
    () => User,
    user => user.loginLogs
  )
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;
}
