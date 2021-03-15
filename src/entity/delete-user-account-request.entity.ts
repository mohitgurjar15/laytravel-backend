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

@Entity("delete_user_account_request")
export class DeleteUserAccountRequest extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("character varying", { name: "user_id", length: 255 })
    userId: string;

    @Column("character varying", { name: "email", length: 255 })
    email: string;

    @Column("character varying", {
        name: "user_name",
        length: 255,
        nullable: true,
    })
    userName: string;

    @Column("timestamp without time zone", {
        name: "created_date",
        nullable: true,
    })
    createdDate: Date;

    @Column("timestamp without time zone", {
        name: "updated_date",
        nullable: true,
    })
    updatedDate: Date;

    @Column("boolean", { name: "request_for_data", default: false })
    requestForData: boolean;

    @Column("integer", { name: "status" })
    status: number;

    @Column("character varying", { name: "delete_by", nullable : true})
    deleteBy: string;

    // @ManyToOne(
    //     () => User,
    //     user => user.deleteUserAccountRequest
    // )
    // @JoinColumn([{ name: "update_by", referencedColumnName: "userId" }])
    // updateBy: User
}
