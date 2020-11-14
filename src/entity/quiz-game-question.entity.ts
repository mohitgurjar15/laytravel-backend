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
import { MarketingGame } from "./marketing-game.entity";
import { QuizGameAnswer } from "./quiz-game-answer.entity";


//@Index("markup_pk", ["id"], { unique: true })
//@Index("gameName_idx", ["gameName"], {})
@Entity("quiz_game_question")
export class QuizGameQuestion extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("integer", { name: "game_id" })
    gameId: number;

    @Column("character varying", { name: "question", length: 255, nullable: false })
    question: string;

    @Column("date", { name: "created_date" })
    createdDate: Date;

    @Column("date", { name: "updated_date" , nullable : true })
    updatedDate: Date;

    @Column("boolean", { name: "status", default: () => "false" })
    status: boolean;

    @Column("boolean", { name: "is_deleted", default: () => "false" })
    isDeleted: boolean;

    @ManyToOne(
        () => MarketingGame,
        marketingGame => marketingGame.id
    )
    @JoinColumn([{ name: "game_id", referencedColumnName: "id" }])
    game: MarketingGame;

    @OneToMany(
        () => QuizGameAnswer,
        quizGameAnswer => quizGameAnswer.quetion
    )
    option: QuizGameAnswer[];
}

