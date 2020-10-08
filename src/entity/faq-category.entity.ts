import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Faq } from "./faq.entity";

@Entity("faq_category")
export class FaqCategory extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("character varying", { name: "name", length: 255 })
    name: string;

    @Column("boolean", { name: "is_deleted", default: () => "false" })
    isDeleted: boolean;

    @OneToMany(
        () => Faq,
        Faq => Faq.category_id
      )
      faqs: Faq[];
}
