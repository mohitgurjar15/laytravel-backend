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
import { EncryptionTransformer } from "typeorm-encrypted";
import { CryptoKey } from "src/config/common.config";

@Index("user_device_detail_user_id", ["userId"], {})
//@Index("user_device_detail_pk", ["id"], { unique: true })
@Entity("user_device_detail")
export class UserDeviceDetail extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "device_type" })
  deviceType: number;

  @Column("character varying", {
    name: "device_token",
    nullable: true,
    length: 255
  })
  deviceToken: string | null;

  @Column("text", { name: "access_token", nullable: true })
  accessToken: string | null;

  @Column("character varying", {
    name: "app_version",
    nullable: true,
    length: 10
  })
  appVersion: string | null;

  @Column("character varying", {
    name: "os_version",
    nullable: true, transformer: new EncryptionTransformer(CryptoKey)
  })
  osVersion: string;

  @Column("timestamp with time zone", { name: "created_date", nullable: true })
  createdDate: Date | null;

  @Column("timestamp with time zone", { name: "updated_date", nullable: true })
  updatedDate: Date | null;

  @Column("uuid", { name: "user_id", nullable: true })
  userId: string | null;

  @Column("character varying", {
    name: "device_model",
    nullable: true, transformer: new EncryptionTransformer(CryptoKey)
  })
  deviceModel: string ;

  @ManyToOne(
    () => User,
    user => user.userDeviceDetails
  )
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;
}
