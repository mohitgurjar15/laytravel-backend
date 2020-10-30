import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import { MarketingGameRewordMarkup } from "./marketing-game-reword-markup.entity";
import { MarketingUserActivity } from "./marketing-user-activity.entity";


//@Index("markup_pk", ["id"], { unique: true })
@Index("userdata_idx", ["userId"], {})
@Index("socialAccountId_idx", ["socialAccountId"], {})
@Index("phoneNo_idx", ["phoneNo"], {})
@Index("email_idx", ["email"], {})
@Index("ipAddress_idx", ["ipAddress"], {})

@Entity("marketing_user_data")
export class MarketingUserData extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("character varying", { name: "first_name", length: 255, nullable: true })
    firstName: string;

    @Column("character varying", { name: "last_name", length: 255, nullable: true })
    lastName: string;

    @Column("character varying", { name: "social_account_id", length: 255 })
    socialAccountId: string;

    @Column("character varying", { name: "email", length: 255, nullable: true })
    email: string | null;

    @Column("character varying", { name: "phone_no", length: 20 })
    phoneNo: string;

    @Column("integer", { name: "device_type" })
    deviceType: number;

    @Column("character varying", {
        name: "ip_address",
        length: 255
    })
    ipAddress: string;

    @Column("character varying", {
        name: "app_version",
        nullable: true,
        length: 10
    })
    appVersion: string | null;

    @Column("character varying", {
        name: "os_version",
        nullable: true,
        length: 10
    })
    osVersion: string | null;

    @Column("timestamp with time zone", { name: "created_date", nullable: true })
    createdDate: Date | null;

    @Column("timestamp with time zone", { name: "updated_date", nullable: true })
    updatedDate: Date | null;

    @Column("uuid", { name: "user_id", nullable: true })
    userId: string | null;

    @Column("character varying", {
        name: "device_model",
        nullable: true,
        length: 255
    })
    deviceModel: string | null;

    @OneToMany(
        () => MarketingUserActivity,
        marketingUserActivity => marketingUserActivity.marketingUserData
    )
    marketingUserActivity: MarketingUserActivity[];
}

