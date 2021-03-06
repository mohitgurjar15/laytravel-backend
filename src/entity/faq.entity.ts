import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { FaqCategory } from "./faq-category.entity";

//@Index("faq_pk", ["id"], { unique: true })
@Entity("faq")
export class Faq extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "category_id"})
  categoryId: number;

  @Column("text", { name: "question" })
  question: string;

  @Column("text", { name: "answer" })
  answer: string;

  @Column("date", { name: "created_date" })
  createdDate: Date;

  @Column("date", { name: "updated_date" })
  updatedDate: Date;

  @Column("boolean", { name: "is_deleted" , default : false})
  isDeleted: boolean;

  @Column("boolean", { name: "status" , default : true})
  status: boolean;


  @ManyToOne(
    () => FaqCategory,
    faq_category => faq_category.id
  )
  @JoinColumn([{ name: "category_id", referencedColumnName: "id" }])
  category_id: FaqCategory;
}
