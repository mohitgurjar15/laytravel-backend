import { BaseEntity, Column, Entity, Index } from "typeorm";

//@Index("cms_pk", ["id"], { unique: true })
@Entity("cms")
export class Cms extends BaseEntity {
  @Column("integer", { primary: true, name: "id" })
  id: number;

  @Column("integer", { name: "page_type" })
  pageType: number;

  @Column("character varying", { name: "title", nullable: true, length: 255 })
  title: string | null;

  @Column("text", { name: "en_content", nullable: true })
  enContent: string | null;
}
