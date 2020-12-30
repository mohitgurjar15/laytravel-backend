import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import { Module } from "./module.entity";
import { User } from "./user.entity";
@Index("cart_user_id", ["userId"], {})
@Entity("cart")
export class Cart extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("integer", { name: "module_id" })
    moduleId: number;

    @Column("timestamp with time zone", { name: "created_date", nullable: true })
    createdDate: Date | null;

    @Column("timestamp with time zone", { name: "expiry_date" })
    expiryDate: Date;

    @Column("boolean", { name: "is_deleted", default: () => false })
    isDeleted: boolean;

    @Column("json", { name: "module_info" })
    moduleInfo: object;

    @Column("uuid", { name: "user_id" })
    userId: string;

    @ManyToOne(
        () => User,
        user => user.userDeviceDetails
    )
    @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
    user: User;

    @ManyToOne(
        () => Module,
        module => module.cartList
    )
    @JoinColumn([{ name: "module_id", referencedColumnName: "id" }])
    module: Module;
}
