import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { Module } from "./module.entity";
import { Supplier } from "./supplier.entity";
import { User } from "./user.entity";

//@Index("markup_pk", ["id"], { unique: true })
@Index("markup_module_id", ["moduleId"], {})
@Index("markup_supplier_id", ["supplierId"], {})
@Entity("markup")
export class Markup extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "module_id"})
  moduleId: number;

  @Column("integer", { name: "supplier_id" })
  supplierId: number;

  @Column("integer", { name: "user_type" ,default : 6})
  userType: number;

  @Column("character varying", { name: "booking_type", length: 20, nullable:true })
  bookingType: string;

  @Column("character varying", { name: "operator", length: 5 })
  operator: string;

  @Column("numeric", { name: "operand", precision: 10, scale: 2 })
  operand: string;

  @Column("date", { name: "created_date" })
  createdDate: Date;

  @Column("date", { name: "updated_date" })
  updatedDate: Date;

  @ManyToOne(
    () => Module,
    module => module.markups
  )
  @JoinColumn([{ name: "module_id", referencedColumnName: "id" }])
  module: Module;

  @ManyToOne(
    () => Supplier,
    supplier => supplier.markups
  )
  @JoinColumn([{ name: "supplier_id", referencedColumnName: "id" }])
  supplier: Supplier;

  @ManyToOne(
    () => User,
    user => user.markups
  )
  @JoinColumn([{ name: "updated_by", referencedColumnName: "userId" }])
  updatedBy: User;
}
