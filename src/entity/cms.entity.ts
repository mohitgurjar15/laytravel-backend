import { BaseEntity, Column, Entity, Index } from "typeorm";

//@Index("cms_pk", ["id"], { unique: true })
@Entity("cms")
export class Cms extends BaseEntity {
  @Column("integer", { primary: true, name: "id" })
  id: number;

  @Column("character varying", { name: "page_type",  length: 100 })
  pageType: string;

  @Column("character varying", { name: "title", length: 255 })
  title: string | null;

  @Column("text", { name: "en_content", nullable: true })
  enContent: string | null;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @Column("boolean", { name: "is_deleted", default: () => "false" })
  isDeleted: boolean;
}
