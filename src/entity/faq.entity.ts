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

//@Index("faq_pk", ["id"], { unique: true })
@Entity("faq")
export class Faq extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "category_id"})
  categoryId: number;

  @Column("date", { name: "created_date",nullable : true })
  createdDate: Date;

  @Column("date", { name: "updated_date",nullable : true })
  updatedDate: Date;

  @Column("boolean", { name: "is_deleted" , default : false})
  isDeleted: boolean;

  @Column("boolean", { name: "status" , default : true})
  status: boolean;


  @OneToMany(()=>FaqMeta,(fm)=>fm.faq_id)
  faq_meta : FaqMeta

  @ManyToOne(
    () => FaqCategory,
    faq_category => faq_category.id
  )
  @JoinColumn([{ name: "category_id", referencedColumnName: "id" }])
  category_id: FaqCategory;
}
