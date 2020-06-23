import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

//@Index("baggage_pk", ["id"], { unique: true })
@Entity("baggage")
export class Baggage extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "route_id" })
  routeId: number;

  @Column("integer", { name: "free_allowance" })
  freeAllowance: number;

  @Column("character varying", { name: "allowance_unit", length: 10 })
  allowanceUnit: string;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @Column("boolean", { name: "is_deleted", default: () => "false" })
  isDeleted: boolean;
}
