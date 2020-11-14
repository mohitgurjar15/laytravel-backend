import { BaseEntity, PrimaryGeneratedColumn, Column, Entity } from "typeorm";

@Entity("news_letters")
export class NewsLetters extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "email", length: 50 })
  email: string;

  @Column("boolean", { name: "is_subscribed", default: () => "true" })
  isSubscribed: boolean;

  @Column("date", { name: "subscribe_date" })
  subscribeDate: Date;

  @Column("date", { name: "unsubscribe_date" ,nullable : true,default: () => null })
  unSubscribeDate: Date;

  // @Column("date", { name: "updated_date" ,nullable : true,default: () => null })
  // updatedDate: Date;
}