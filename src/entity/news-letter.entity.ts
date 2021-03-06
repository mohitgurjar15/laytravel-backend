import { BaseEntity, PrimaryGeneratedColumn, Column, Entity } from "typeorm";
import { EncryptionTransformer } from "typeorm-encrypted";
import { CryptoKey } from "src/config/common.config";

@Entity("news_letters")
export class NewsLetters extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "email", transformer: new EncryptionTransformer(CryptoKey) ,nullable:true})
  email: string;

  @Column("boolean", { name: "is_subscribed", default: () => "true" })
  isSubscribed: boolean;

  @Column("timestamp with time zone", { name: "subscribe_date" ,nullable : true})
  subscribeDate: Date;

  @Column("timestamp with time zone", { name: "unsubscribe_date" ,nullable : true,default: () => null })
  unSubscribeDate: Date;

  // @Column("date", { name: "updated_date" ,nullable : true,default: () => null })
  // updatedDate: Date;
}