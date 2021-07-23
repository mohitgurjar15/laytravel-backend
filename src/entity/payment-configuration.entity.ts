import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import { LaytripCategory } from "./laytrip-category.entity";
import { Module } from "./module.entity";

@Entity("payment_configuration")
export class PaymentConfiguration extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("integer", { name: "module_id" })
    moduleId: number;

    @Column("integer", { name: "category_id" })
    categoryId: number;

    @Column("boolean", { name: "is_down_payment_in_percentage", default: () => "true" })
    isDownPaymentInPercentage: boolean;

    // @Column("json", { name: "payment_frequency", nullable: true })
    // paymentFrequency: object;

    @Column("json", { name: "down_payment_option", nullable: true })
    downPaymentOption: object;

    @Column("boolean", { name: "is_installment_available", default: () => "true" })
    isInstallmentAvailable: boolean;

    @Column("boolean", { name: "is_weekly_installment_available", default: () => "true" })
    isWeeklyInstallmentAvailable: boolean;

    @Column("boolean", { name: "is_biweekly_installment_available", default: () => "true" })
    isBiWeeklyInstallmentAvailable: boolean;

    @Column("boolean", { name: "is_monthly_installment_available", default: () => "true" })
    isMonthlyInstallmentAvailable: boolean;

    @Column("date", { name: "updated_date" , nullable : true})
    updatedDate: Date;

    @Column("uuid", { name: "update_by", nullable: true })
    updateBy: string | null;

    @ManyToOne(
        () => LaytripCategory,
        (laytripCategory) => laytripCategory.paymentConfiguration
    )
    @JoinColumn([{ name: "category_id", referencedColumnName: "id" }])
    category: LaytripCategory;

    @ManyToOne(
        () => Module,
        module => module.paymentConfiguration
    )
    @JoinColumn([{ name: "module_id", referencedColumnName: "id" }])
    module: Module;
}