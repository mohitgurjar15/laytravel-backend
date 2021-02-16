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
import { CartTravelers } from "./cart-traveler.entity";
import { Module } from "./module.entity";
import { User } from "./user.entity";
@Index("cart_user_id", ["userId"], {})
@Index("cart_guest_user_id", ["guestUserId"], {})
@Index("cart_moduleId", ["moduleId"], {})
@Index("cart_createdDate", ["createdDate"], {})
@Index("cart_expiryDate", ["expiryDate"], {})
@Index("cart_isDeleted", ["isDeleted"], {})

@Entity("cart")
export class Cart extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("integer", { name: "module_id" })
    moduleId: number;

    // @Column("character varying", { name: "payment_type", nullable: true })
    // paymentType: string;

    // @Column("character varying", { name: "instalment_type", length: 30, nullable: true })
    // instalmentType: string;

    @Column("timestamp with time zone", { name: "created_date", nullable: true })
    createdDate: Date | null;

    @Column("timestamp with time zone", { name: "expiry_date" })
    expiryDate: Date;

    @Column("boolean", { name: "is_deleted", default: () => false })
    isDeleted: boolean;

    @Column("json", { name: "module_info" })
    moduleInfo: object;

    @Column("uuid", { name: "user_id", nullable: true })
    userId: string;

    @Column("uuid", { name: "guest_user_id", nullable: true })
    guestUserId: string;

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

    @OneToMany(
        () => CartTravelers,
        (traveler) => traveler.cartData
    )
    travelers: CartTravelers[];
}
