import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from "typeorm";
import { EncryptionTransformer } from "typeorm-encrypted";
import { CryptoKey } from "src/config/common.config";

@Entity("forget_password")

export class forget_password extends BaseEntity {

    @PrimaryGeneratedColumn({ type: "int", name: "id" })
    id: number;

    @Column("varchar", { name: "email",nullable : true , transformer: new EncryptionTransformer(CryptoKey) })
    email: string;

    @Column("varchar", { name: "token", nullable:true })
    token: string;
    
    @Column("int", { name: "otp" })
    otp: number;

    @Column("timestamp with time zone", { name: "createTime" })
    createTime: Date;

    @Column("timestamp with time zone", { name: "updateTime" })
    updateTime: Date;

    @Column("int", { name: "is_used", default: () => "'0'" })
    is_used: number;

    async validateToken(otp: number): Promise<boolean> {
        return otp == this.otp
    }
}