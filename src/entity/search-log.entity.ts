
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

//@Index("activity_log_pk", ["id"], { unique: true })
@Index("search_log_user_id", ["userId"], {})
@Entity("search_log")
export class SearchLog extends BaseEntity {
    @Column("uuid", { primary: true, name: "id" })
    id: string;

    @Column("uuid", { name: "user_id", nullable: true })
    userId: string | null;

    @Column("integer", { name: "module_id" })
    moduleId: number;

    @Column("timestamp without time zone", { name: "created_date" })
    createdDate: Date;

    @Column("json", { name: "search_log" })
    searchLog: object;

    @Column("character varying", {
        name: "ip_address",
        length: 255,nullable : true
    })
    ipAddress: string;

    @ManyToOne(
        () => User,
        (user) => user.activityLogs
    )
    @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
    user: User;

    @ManyToOne(
        () => Module,
        (module) => module.searchLog
    )
    @JoinColumn([{ name: "module_id", referencedColumnName: "id" }])
    module: Module;
}
