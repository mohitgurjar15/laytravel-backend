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

  @Column("text", { name: "fr_content", nullable: true })
  frContent: string | null;

  @Column("text", { name: "it_content", nullable: true })
  itContent: string | null;

  @Column("text", { name: "es_content", nullable: true })
  esContent: string | null;

  @Column("text", { name: "de_content", nullable: true })
  deContent: string | null;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @Column("boolean", { name: "is_deleted", default: () => "false" })
  isDeleted: boolean;
}
