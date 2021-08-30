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

    @ManyToOne(
        () => Faq,
        Faq => Faq.id
    )
    @JoinColumn([{ name: "faq_id", referencedColumnName: "id" }])
    faq_id: Faq;

    @Column("text", { name: "question" })
    question: string;

    @Column("text", { name: "answer" })
    answer: string;

    @ManyToOne(
        () => Language,
        Language => Language.id
    )
    @JoinColumn([{ name: "language_id", referencedColumnName: "id" }])
    language_id: Language;

}
