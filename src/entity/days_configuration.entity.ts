import {
    BaseEntity,
    Column,
    Entity,
    Index,
    PrimaryGeneratedColumn
} from "typeorm";

@Entity("days_configuration")
export class daysConfiguration extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("integer", { name: "min_days" })
    minDays: number;

    @Column("integer", { name: "max_days" })
    maxDays: number;

    @Column("boolean", { name: "is_installment_available", default: () => "true" })
    isInstallmentAvailable: boolean;
}
