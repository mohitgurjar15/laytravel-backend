import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("faq_category")
export class FaqCategory extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("character varying", { name: "name", length: 255 })
    name: string;

    @Column("boolean", { name: "is_deleted", default: () => "false" })
    isDeleted: boolean;
}
