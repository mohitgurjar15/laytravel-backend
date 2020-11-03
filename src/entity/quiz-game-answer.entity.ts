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
import { QuizGameQuetion } from "./quiz-game-quetion.entity";

//@Index("markup_pk", ["id"], { unique: true })
// @Index("gameId_idx", ["gameId"], {})
// @Index("answerValue_idx", ["gameId","answerValue"], {})
// @Index("rewordPoint_idx", ["gameId","answerValue","rewordPoint"], {})
@Entity("quiz_game_answer")
export class QuizGameAnswer extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("integer", { name: "quetion_id" })
    quetionId: number;

    @Column("character varying", { name: "answer", length: 255 })
    answer: string;

    @Column("boolean", { name: "is_right", default: () => "false" })
    isRight: boolean;

    @Column("date", { name: "created_date" })
    createdDate: Date;

    @ManyToOne(
        () => QuizGameQuetion,
        quizGameQuetion => quizGameQuetion.id
    )
    @JoinColumn([{ name: "quetion_id", referencedColumnName: "id" }])
    quetion: QuizGameQuetion;
}