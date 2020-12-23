import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import { User } from "./user.entity";
@Index("WebPushNotifications_user_id", ["userId"], {})
@Entity("web_push_notifications")
export class WebPushNotifications extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("character varying", {
        name: "end_point",
        length: 255
    })
    endPoint: string;

    @Column("text", {
        name: "auth_keys",
    })
    authKeys: string;

    @Column("text", {
        name: "p256dh_keys"
    })
    P256dhKeys: string | null;

    @Column("timestamp with time zone", { name: "created_date", nullable: true })
    createdDate: Date | null;

    @Column("timestamp with time zone", { name: "updated_date", nullable: true })
    updatedDate: Date | null;

    @Column("uuid", { name: "user_id", nullable: true })
    userId: string | null;

    @Column("boolean", { name: "is_subscribed", default: () => "false" })
    isSubscribed: boolean;

    @ManyToOne(
        () => User,
        user => user.userDeviceDetails
    )
    @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
    user: User;
}
