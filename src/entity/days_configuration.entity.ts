import {
    BaseEntity,
    Column,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import { LandingPageDiscountConfig } from "./landing-page-discount.entity";
import { LandingPageDownPaymentConfig } from "./landing-page-downPayment.entity";
import { PaymentConfiguration } from "./payment-configuration.entity";

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

    @OneToMany(
        () => PaymentConfiguration,
        config => config.daysConfiguration
    )
    paymentConfiguration: PaymentConfiguration[];

    @OneToMany(
        () => LandingPageDownPaymentConfig,
        config => config.daysConfiguration
    )
    landingPageDownPaymentConfig: LandingPageDownPaymentConfig[];

    @OneToMany(
        () => LandingPageDiscountConfig,
        config => config.daysConfiguration
    )
    landingPageDiscountConfig: LandingPageDiscountConfig[];
}