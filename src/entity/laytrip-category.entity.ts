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
import { FlightRoute } from "./flight-route.entity";
import { User } from "./user.entity";

//@Index("login_log_pk", ["id"], { unique: true })
// @Index("login_log_user_id", ["userId"], {})
@Entity("laytrip_category")
export class LaytripCategory extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("character varying", { name: "name" })
    name: string;

    @Column("uuid", { name: "create_by", nullable: true })
    createBy: string;

    @Column("integer", { name: "installment_available_after" , nullable: true })
    installmentAvailableAfter: number;

    @Column("uuid", { name: "update_by", nullable: true })
    updateBy: string;

    @Column("timestamp without time zone", { name: "create_date" })
    createDate: Date;

    @Column("boolean", { name: "status", default: () => "false" })
    status: boolean;

    @Column("timestamp without time zone", { name: "update_date" })
    updateDate: Date;

    @ManyToOne(
        () => User,
        user => user.createdLaytripCategory
    )
    @JoinColumn([{ name: "create_by", referencedColumnName: "userId" }])
    createByUser: User;

    @ManyToOne(
        () => User,
        user => user.updatedLaytripCategory
    )
    @JoinColumn([{ name: "update_by", referencedColumnName: "userId" }])
    updateByUser: User;

    @OneToMany(
        () => FlightRoute,
        flightRoute => flightRoute.category
    )
    flightRoutes: FlightRoute[];
}
