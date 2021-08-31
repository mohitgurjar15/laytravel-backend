import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import { FaqCategory } from "./faq-category.entity";
import { Faq } from "./faq.entity";
import { Language } from "./language.entity";

@Entity("faq_meta")
export class FaqMeta extends BaseEntity {

    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("text", { name: "question" })
    question: string;

    @Column("text", { name: "answer" })
    answer: string;

    @ManyToOne(() => Faq, (faq) => faq.faqMetas)
    @JoinColumn([{ name: "faq_id", referencedColumnName: "id" }])
    faq: Faq;

    @ManyToOne(() => Language, (language) => language.faqMetas)
    @JoinColumn([{ name: "language_id", referencedColumnName: "id" }])
    language: Language;

}
