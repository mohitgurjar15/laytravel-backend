import { BaseEntity, Column, Entity, Index } from "typeorm";

//@Index("role_pk", ["id"], { unique: true })
@Entity("role")
export class Role extends BaseEntity {
  @Column("integer", { primary: true, name: "id", generated: "increment" })
  id: number;

  @Column("character varying", { name: "name", length: 100 })
  name: string;

  @Column("boolean", { name: "is_active", default: () => "true" })
  isActive: boolean;

  @Column("timestamp with time zone", { name: "created_date", nullable: true })
  createdDate: Date | null;
}
