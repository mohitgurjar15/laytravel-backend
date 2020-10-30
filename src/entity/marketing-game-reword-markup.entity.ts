import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import { MarketingGame } from "./marketing-game.entity";

//@Index("markup_pk", ["id"], { unique: true })
@Index("gameId_idx", ["gameId"], {})
@Index("answerValue_idx", ["gameId","answerValue"], {})
@Index("rewordPoint_idx", ["gameId","answerValue","rewordPoint"], {})
@Entity("marketing_game_reword_markup")
export class MarketingGameRewordMarkup extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("integer", { name: "game_id" })
    gameId: number;

    @Column("character varying", { name: "answer_value", length: 20 })
    answerValue: string;

    @Column("integer", { name: "reword_point" })
    rewordPoint: number;

    @Column("date", { name: "created_date" })
    createdDate: Date;

    @Column("date", { name: "updated_date" })
    updatedDate: Date;

    @Column("boolean", { name: "status", default: () => "false" })
    status: boolean;

    @Column("boolean", { name: "is_deleted", default: () => "false" })
    isDeleted: boolean;

    @ManyToOne(
        () => MarketingGame,
        marketingGameReword => marketingGameReword.id
    )
    @JoinColumn([{ name: "game_id", referencedColumnName: "id" }])
    game: MarketingGame;
}