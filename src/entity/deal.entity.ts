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
import { Module } from "./module.entity";

@Index("deal_id", ["id"], { unique: true })
@Entity("deal")
export class Deal extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("character varying", {
        name: "location",
        length: 255,
        nullable: true,
    })
    location: string;

    @Column("json", { name: "hotel_location", nullable: true })
    hotelLocation: object;

    @Column("character varying", { name: "image", length: 255 })
    image: string;

    @Column("date", { name: "created_date" })
    createdDate: Date;

    @Column("date", { name: "updated_date" })
    updatedDate: Date;

    @Column("boolean", { name: "is_deleted", default: false })
    isDeleted: boolean;

    @Column("boolean", { name: "status", default: true })
    status: Boolean;

    @ManyToOne(
        () => User,
        (user) => user.deal
    )
    @JoinColumn([{ name: "update_by", referencedColumnName: "userId" }])
    updateBy: User;

    @ManyToOne(
        () => Module,
        (module) => module.notifications
    )
    @JoinColumn([{ name: "module_id", referencedColumnName: "id" }])
    module: Module;
}
