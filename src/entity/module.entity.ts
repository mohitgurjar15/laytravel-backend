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

//@Index("module_pk", ["id"], { unique: true })
@Entity("module")
export class Module extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name", length: 50 })
  name: string;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @Column("uuid", { name: "created_by" })
  createdBy: string;

  @Column("date", { name: "created_date" })
  createdDate: string;

  @Column("date", { name: "update_date" })
  updateDate: string;

  @ManyToOne(
    () => User,
    user => user.modules
  )
  @JoinColumn([{ name: "updated_by", referencedColumnName: "userId" }])
  updatedBy: User;
}
