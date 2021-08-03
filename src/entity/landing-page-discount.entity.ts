
import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import { daysConfiguration } from "./days_configuration.entity";
import { LandingPages } from "./landing-page.entity";
import { LaytripCategory } from "./laytrip-category.entity";
import { Module } from "./module.entity";

@Entity("landing_page_down_payment_config")
export class LandingPageDiscountConfig extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("integer", { name: "module_id" })
    moduleId: number;

    @Column("integer", { name: "days_config_id" })
    daysConfigId: number;

    @Column("uuid", { name: "landing_page_id" })
    landingPageId: string | null;

    @Column("character varying", {
        name: "offer_criteria",
    })
    offerCriteria: string

    @Column("character varying", {
        name: "offer_criteria",
    })
    offerVariable: string

    @Column("json", { name: "offer_criteria_values", nullable: true })
    offerCriteriaValues: object;


    @Column("boolean", { name: "is_down_payment_in_percentage", default: () => "true" })
    isDiscountInPercentage: boolean;


    @Column("integer", { name: "discount", nullable: true })
    discount: number;

    @Column("integer", { name: "minimum_amount", default: () => 0 })
    minimumAmount : number;

    @Column("date", { name: "start_date", nullable: true })
    startDate: Date;
    @Column("date", { name: "end_date", nullable: true })
    endDate: Date;
    @Column("date", { name: "check_in_date", nullable: true })
    checkInDate: Date;
    @Column("date", { name: "check_out_date", nullable: true })
    checkoutDate: Date;

    @Column("date", { name: "updated_date", nullable: true })
    updatedDate: Date;

    @Column("uuid", { name: "update_by", nullable: true })
    updateBy: string | null;

    @Column("date", { name: "create_date", nullable: true })
    createDate: Date;

    @Column("uuid", { name: "create_by", nullable: true })
    createBy: string | null;

    @ManyToOne(
        () => LaytripCategory,
        (laytripCategory) => laytripCategory.landingPageDiscountConfig
    )
    @JoinColumn([{ name: "category_id", referencedColumnName: "id" }])
    category: LaytripCategory;

    @ManyToOne(
        () => Module,
        module => module.landingPageDownPaymentConfig
    )
    @JoinColumn([{ name: "module_id", referencedColumnName: "id" }])
    module: Module;

    @ManyToOne(
        () => daysConfiguration,
        config => config.paymentConfiguration
    )
    @JoinColumn([{ name: "days_config_id", referencedColumnName: "id" }])
    daysConfiguration: daysConfiguration;

    @ManyToOne(
        () => LandingPages,
        (landingPage) => landingPage.landingPageDownPaymentConfig
    )
    @JoinColumn([{ name: "landing_page_id", referencedColumnName: "id" }])
    landingPageDetail: LandingPages;
}