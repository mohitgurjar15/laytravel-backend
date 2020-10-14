import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import { Countries } from "./countries.entity";
import { States } from "./states.entity";

@Index("device_type_idx", ["deviceType"], {})
//@Index("cities_pkey", ["id"], { unique: true })
@Index("version_idx", ["version"], {})
@Entity("app_version")
export class AppVersions extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("integer", { name: "device_type" })
    deviceType: number;

    @Column("boolean", { name: "force_update", default: true })
    forceUpdate: boolean;

    @Column("character varying", { name: "version"})
    version: string;

    @Column("character varying", { name: "name" , nullable:true})
    name: string;

    @Column("character varying", { name: "url" , nullable:true})
    url: string;

    @Column("date", { name: "upload_date" ,nullable : true})
    uploadDate: Date;
}
