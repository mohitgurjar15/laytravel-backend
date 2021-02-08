import {
    BaseEntity,
    Column,
    Entity,
    Index,
    PrimaryGeneratedColumn
} from "typeorm";

@Index("cronName_idx", ["cronName"])
@Index("createdDate_idx", ["createdDate"])
@Index("name_date_idx", ["createdDate","cronName"])



@Entity("cron_log")
export class CronLog extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("text", { name: "cron_name" })
    cronName: string;

    @Column("text", { name: "log_data", nullable: true })
    logData: string;

    @Column("timestamp without time zone", { name: "created_date" })
    createdDate: Date;
}
