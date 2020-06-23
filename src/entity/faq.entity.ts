import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

//@Index("faq_pk", ["id"], { unique: true })
@Entity("faq")
export class Faq extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "category", length: 100 })
  category: string;

  @Column("text", { name: "question" })
  question: string;

  @Column("text", { name: "answer" })
  answer: string;

  @Column("date", { name: "created_date" })
  createdDate: string;

  @Column("date", { name: "updated_date" })
  updatedDate: string;
}
