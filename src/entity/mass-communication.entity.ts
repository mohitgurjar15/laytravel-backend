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
// @Index("cart_user_id", ["userId"], {})
// @Index("cart_guest_user_id", ["guestUserId"], {})
// @Index("cart_moduleId", ["moduleId"], {})
// @Index("cart_createdDate", ["createdDate"], {})
// @Index("cart_expiryDate", ["expiryDate"], {})
// @Index("cart_isDeleted", ["isDeleted"], {})

@Entity("masss_communication")
export class MassCommunication extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("timestamp with time zone", { name: "created_date", nullable: true })
    createdDate: Date | null;

    @Column("character varying", { name: "subject" })
    subject: string;

    @Column("text", { name: "message" })
    message: string;

    @Column("text", { name: "attachment" ,nullable : true})
    attachment: string;

    @Column("uuid", { name: "created_by" })
    createdBy: string;

    
    @ManyToOne(
        () => User,
        user => user.massCommunication
    )
    @JoinColumn([{ name: "created_by", referencedColumnName: "userId" }])
    user: User;
}
