import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    ManyToOne,
    Index,
} from "typeorm";
import { User } from "./user.entity";
import { Cart } from "./cart.entity";

@Index("cart_userId_idx", ["userId"], {})
@Index("cartId_idx", ["cartId"], {})
@Entity("cart_traveler")
export class CartTravelers extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("integer", { name: "cart_id" })
    cartId: number;

    @Column("uuid", { name: "user_id", nullable:true })
    userId: string;

    @Column("character varying", {
        name: "baggage_service_code",
        nullable: true,
        default: "",
    })
    baggageServiceCode: string;

    @Column("boolean", { name: "is_primary", default: () => false })
    isPrimary: boolean;

    @ManyToOne(
        () => User,
        (User) => User.traveler
    )
    @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
    userData: User; 

    @Column("json", { name: "traveler", nullable:true })
    traveler: object;

    @ManyToOne(
        () => Cart,
        (cart) => cart.travelers
    )
    @JoinColumn([{ name: "cart_id", referencedColumnName: "id" }])
    cartData: Cart;
}
