import { BaseEntity, Column, Entity } from "typeorm";
import { EncryptionTransformer } from "typeorm-encrypted";
import { CryptoKey } from "src/config/common.config";

//@Index("enquiry_pk", ["id"], { unique: true })
@Entity("enquiry")
export class Enquiry extends BaseEntity {
  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("character varying", { name: "user_name",transformer: new EncryptionTransformer(CryptoKey),nullable:true})
  userName: string;

  @Column("character varying", { name: "email", transformer: new EncryptionTransformer(CryptoKey),nullable:true})
  email: string;

  @Column("character varying", { name: "phone_no", transformer: new EncryptionTransformer(CryptoKey) ,nullable:true})
  phoneNo: string;


  @Column("character varying", { name: "country_code", transformer: new EncryptionTransformer(CryptoKey) ,nullable:true})
  countryCode: string;

  // @Column("text", { name: "location" })
  // location: string;

  // @Column("text", { name: "subject" })
  // subject: string;

  @Column("text", { name: "message" })
  message: string;

  @Column("date", { name: "created_date" })
  createdDate: Date;
}
