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
import { QuizGameQuestion } from "./quiz-game-question.entity";

//@Index("markup_pk", ["id"], { unique: true })
// @Index("gameId_idx", ["gameId"], {})
// @Index("answerValue_idx", ["gameId","answerValue"], {})
// @Index("rewordPoint_idx", ["gameId","answerValue","rewordPoint"], {})
@Entity("quiz_game_answer")
export class QuizGameAnswer extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("integer", { name: "question_id" , nullable:true})
    questionId: number;

    @Column("character varying", { name: "answer", length: 255 })
    answer: string;

    @Column("boolean", { name: "is_right", default: () => "false" })
    isRight: boolean;

    @Column("date", { name: "created_date" })
    createdDate: Date;

    @ManyToOne(
        () => QuizGameQuestion,
        quizGameQuetion => quizGameQuetion.id
    )
    @JoinColumn([{ name: "question_id", referencedColumnName: "id" }])
    quetion: QuizGameQuestion;
}