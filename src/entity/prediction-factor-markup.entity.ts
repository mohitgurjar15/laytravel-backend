import {
    BaseEntity,
    Column,
    Entity,
    Index,
    PrimaryGeneratedColumn
  } from "typeorm";

  //@Index("markup_pk", ["id"], { unique: true })
  @Index("markupPercentage_idx2", ["markupPercentage"], {})
  @Index("maxRatePercentage_idx2", ["maxRatePercentage"], {})
  @Index("minRatePercentage_idx2", ["minRatePercentage"], {})
  @Entity("prediction_factor_markup")
  export class PredictionFactorMarkup extends BaseEntity {
    
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;
  
    @Column("numeric", { name: "markup_percentage", precision: 10, scale: 2})
    markupPercentage: number;

    @Column("numeric", { name: "max_rate_percentage", precision: 10, scale: 2})
    maxRatePercentage: number;

    @Column("numeric", { name: "min_rate_percentage", precision: 10, scale: 2})
    minRatePercentage: number;
  
    @Column("date", { name: "created_date" ,nullable:true})
    createdDate: Date;
  
    @Column("date", { name: "updated_date",nullable:true })
    updatedDate: Date;
  }
  