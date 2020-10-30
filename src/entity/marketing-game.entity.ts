import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import { MarketingGameRewordMarkup } from "./marketing-game-reword-markup.entity";


//@Index("markup_pk", ["id"], { unique: true })
@Index("gameName_idx", ["gameName"], {})
@Entity("marketing_game")
export class MarketingGame extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("character varying", { name: "game_name", length: 20, nullable: true })
    gameName: string;

    @Column("integer", { name: "game_available_after" })
    gameAvailableAfter: number;

    @Column("date", { name: "created_date" })
    createdDate: Date;

    @Column("date", { name: "updated_date" })
    updatedDate: Date;

    @Column("boolean", { name: "status", default: () => "false" })
    status: boolean;

    @Column("boolean", { name: "is_deleted", default: () => "false" })
    isDeleted: boolean;

    @OneToMany(
        () => MarketingGameRewordMarkup,
        marketingGameRewordMarkup => marketingGameRewordMarkup.game
    )
    marketingGameRewordMarkups: MarketingGameRewordMarkup[];
}

