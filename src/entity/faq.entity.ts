import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { FaqCategory } from "./faq-category.entity";
import { FaqMeta } from "./faq-meta.entity";
import { Language } from "./language.entity";

//@Index("faq_pk", ["id"], { unique: true })
@Entity("faq")
export class Faq extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("date", { name: "created_date", nullable: true })
  createdDate: Date | null;

  @Column("date", { name: "updated_date", nullable: true })
  updatedDate: Date | null;

  @Column("boolean", { name: "is_deleted", default: () => "false" })
  isDeleted: boolean;

  @Column("boolean", { name: "status", default: () => "true" })
  status: boolean;

  @ManyToOne(() => FaqCategory, (faqCategory) => faqCategory.id)
  @JoinColumn([{ name: "category_id", referencedColumnName: "id" }])
  category_id: FaqCategory;

  @OneToMany(() => FaqMeta, (faqMeta) => faqMeta.faq)
  faqMetas: FaqMeta[];

  // @ManyToOne(() => Language, (Language) => Language.id)
  // language: Language;
}
