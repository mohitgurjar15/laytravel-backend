import { BaseEntity, Column, Entity } from "typeorm";

//@Index("enquiry_pk", ["id"], { unique: true })
@Entity("enquiry")
export class Enquiry extends BaseEntity {
  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("character varying", { name: "user_name", length: 255 })
  userName: string;

  @Column("character varying", { name: "email", length: 500 })
  email: string;

  @Column("character varying", { name: "phone_no", length: 20 ,nullable:true})
  phoneNo: string;


  @Column("character varying", { name: "country_code", length: 10 ,nullable:true})
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
