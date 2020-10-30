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
import { MarketingGame } from "./marketing-game.entity";
import { MarketingUserData } from "./marketing-user.entity";


//@Index("markup_pk", ["id"], { unique: true })
@Index("user_idx", ["userId"], {})
@Index("game_idx", ["gameId"], {})
@Index("addToWallet_idx", ["addToWallet"], {})
@Entity("marketing_user_activity")
export class MarketingUserActivity extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("integer", { name: "user_id" })
    userId: number;

    @Column("integer", { name: "game_id" })
    gameId: number;

    @Column("integer", { name: "reword" })
    reword: number;

    @Column("timestamp with time zone", { name: "created_date"})
    createdDate: Date | null;

    @Column("boolean", { name: "added_to_wallet", default: () => "false" })
    addToWallet: boolean;

    @ManyToOne(
        () => MarketingGame,
        marketingGame => marketingGame.id
    )
    @JoinColumn([{ name: "game_id", referencedColumnName: "id" }])
    game: MarketingGame;

    @ManyToOne(
        () => MarketingUserData,
        marketingUserData => marketingUserData.id
    )
    @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
    marketingUserData: MarketingGame;


}

