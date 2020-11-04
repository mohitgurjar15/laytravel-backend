import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { errorMessage } from 'src/config/common.config';
import { LayCreditEarn } from 'src/entity/lay-credit-earn.entity';
import { MarketingGameRewordMarkup } from 'src/entity/marketing-game-reword-markup.entity';
import { MarketingGame } from 'src/entity/marketing-game.entity';
import { MarketingUserActivity } from 'src/entity/marketing-user-activity.entity';
import { MarketingUserData } from 'src/entity/marketing-user.entity';
import { QuizGameAnswer } from 'src/entity/quiz-game-answer.entity';
import { QuizGameQuetion } from 'src/entity/quiz-game-quetion.entity';
import { User } from 'src/entity/user.entity';
import { PaidFor } from 'src/enum/paid-for.enum';
import { RewordMode } from 'src/enum/reword-mode.enum';
import { RewordStatus } from 'src/enum/reword-status.enum';
import { Role } from 'src/enum/role.enum';
import { getManager } from 'typeorm';
import { ActiveInactiveGameMarkupDto } from './dto/active-inactive-game-markup.dto';
import { ActiveInactiveGameDto } from './dto/active-inactive-game.dto';
import { AddQuetionDto } from './dto/add-quetion-answer.dto';
import { addRewordMarkupDto } from './dto/add-reword-markup.dto';
import { CreateGameDto } from './dto/new-game.dto';
import { CreateMarketingUserDto } from './dto/new-marketing-user.dto';
import { QuizResultDto } from './dto/quiz-result.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { UpdateRewordMarkupDto } from './dto/update-reword-markup.dto';

@Injectable()
export class MarketingService {

    async addGame(createGameDto: CreateGameDto) {
        const { game_name, available_after } = createGameDto

        const newGame = new MarketingGame();

        newGame.gameName = game_name;
        newGame.gameAvailableAfter = available_after,
            newGame.createdDate = new Date();
        newGame.status = true;
        newGame.isDeleted = false;

        await newGame.save()
        return {
            message: `Game created succefully`
        }
    }

    async listGame() {
        let [data, count] = await getManager()
            .createQueryBuilder(MarketingGame, "game")
            .where("game.is_deleted = false ")
            .getManyAndCount();
        if (!data.length) {
            throw new NotFoundException(`Games not found`)
        }

        return {
            data: data, count: count
        }
    }

    async updateGame(id: number, updateGameDto: UpdateGameDto) {
        const { game_name, available_after } = updateGameDto



        let game = await getManager()
            .createQueryBuilder(MarketingGame, "game")
            .where("game.is_deleted = false AND game.id =:id", { id })
            .getOne();
        if (!game) {
            throw new NotFoundException(`Given game id not found`)
        }

        game.gameName = game_name;
        game.gameAvailableAfter = available_after,
            game.updatedDate = new Date();

        await game.save()
        return {
            message: `Game Updated succefully`
        }
    }

    async deleteGame(id: number) {

        let game = await getManager()
            .createQueryBuilder(MarketingGame, "game")
            .where("game.is_deleted = false AND game.id =:id", { id })
            .getOne();
        if (!game) {
            throw new NotFoundException(`Given game id not found`)
        }

        game.isDeleted = true;
        game.updatedDate = new Date();

        await game.save()
        return {
            message: `Game deleted succefully`
        }
    }


    async activeInactiveGame(id: number, activeInactivedto: ActiveInactiveGameDto) {

        const { status } = activeInactivedto
        let game = await getManager()
            .createQueryBuilder(MarketingGame, "game")
            .where("game.is_deleted = false AND game.id =:id", { id })
            .getOne();
        if (!game) {
            throw new NotFoundException(`Given game id not found`)
        }

        game.status = status;
        game.updatedDate = new Date();

        await game.save()
        return {
            message: `Game status changed succefully`
        }
    }

    async getGameData(id: number) {
        let result = await getManager()
            .createQueryBuilder(MarketingGame, "game")
            .leftJoinAndSelect("game.marketingGameRewordMarkups", "markup")
            .where(`game.is_deleted = false AND game.id =:id`, { id })
            .getOne();
        if (!result) {
            throw new NotFoundException('Game id not found')
        }
        return result;

    }

    async addRewordMarkup(createNewMarkup: addRewordMarkupDto) {
        const { game_id, answer_value, reword_point } = createNewMarkup

        let game = await getManager()
            .createQueryBuilder(MarketingGame, "game")
            .where("game.is_deleted = false AND game.id =:id", { id: game_id })
            .getOne();
        if (!game) {
            throw new NotFoundException(`Given game id not found`)
        }


        const markup = new MarketingGameRewordMarkup();

        markup.gameId = game_id;
        markup.answerValue = answer_value;
        markup.rewordPoint = reword_point;
        markup.createdDate = new Date();
        markup.status = true;
        markup.isDeleted = false;

        await markup.save()
        return {
            message: `Game markup added succefully`
        }
    }

    async UpateRewordMarkup(id: number, updateRewordMarkupDto: UpdateRewordMarkupDto) {
        const { reword_point } = updateRewordMarkupDto

        let markup = await getManager()
            .createQueryBuilder(MarketingGameRewordMarkup, "markup")
            .where("markup.is_deleted = false AND markup.id =:id", { id })
            .getOne();
        if (!markup) {
            throw new NotFoundException(`Given game id not found`)
        }

        markup.rewordPoint = reword_point;
        markup.updatedDate = new Date();

        await markup.save()
        return {
            message: `Game markup Updated succefully`
        }
    }

    async deleteGameMarkup(id: number) {

        let markup = await getManager()
            .createQueryBuilder(MarketingGameRewordMarkup, "markup")
            .where("markup.is_deleted = false AND markup.id =:id", { id })
            .getOne();
        if (!markup) {
            throw new NotFoundException(`Given game id not found`)
        }

        markup.isDeleted = true;
        markup.updatedDate = new Date();

        await markup.save()
        return {
            message: `Game markup deleted succefully`
        }
    }

    async activeInactiveGameMarkup(id: number, activeInactivedto: ActiveInactiveGameMarkupDto) {

        const { status } = activeInactivedto
        let markup = await getManager()
            .createQueryBuilder(MarketingGameRewordMarkup, "markup")
            .where("markup.is_deleted = false AND markup.id =:id", { id })
            .getOne();
        if (!markup) {
            throw new NotFoundException(`Given game id not found`)
        }

        markup.status = status;
        markup.updatedDate = new Date();

        await markup.save()
        return {
            message: `Game markup status changed succefully`
        }
    }

    async marketingUser(userDto: CreateMarketingUserDto) {
        const {
            signup_via, device_model, device_type, ip_address, app_version, os_version
        } = userDto

        let user = await getManager()
            .createQueryBuilder(MarketingUserData, "markup")
            .where(`markup.ip_address =:ip_address`, { ip_address })
            .getOne();

        if (!user) {
            let userData = new MarketingUserData()
            userData.deviceType = device_type || null
            userData.deviceModel = device_model || null
            userData.ipAddress = ip_address
            userData.appVersion = app_version || null
            userData.osVersion = os_version || null
            user = await userData.save();
        }
        var tDate = new Date();

        // var todayDate = tDate.toISOString();
        // todayDate = todayDate
        //     .replace(/T/, " ") // replace T with a space
        //     .replace(/\..+/, "");

        let allgame = await getManager()
            .createQueryBuilder(MarketingGame, "game")
            .where("game.is_deleted = false AND game.status = true")
            .getMany();
        var gamePlayed = []
        if (allgame.length) {
            for await (const game of allgame) {
                var periodTime = new Date();
                periodTime.setTime(tDate.getTime() - (game.gameAvailableAfter * 60 * 60 * 1000));
                console.log(periodTime);
                var date = periodTime.toISOString()
                date = date
                    .replace(/T/, " ") // replace T with a space
                    .replace(/\..+/, "");

                const activity = await getManager()
                    .createQueryBuilder(MarketingUserActivity, "activity")
                    .where(`activity.created_date > '${date}' AND user_id = ${user.id} AND game_id = ${game.id}`)
                    .getOne();
                var gameAvailable = {
                    gameId: game.id,
                    gameName: game.gameName,
                    available: true
                }
                let check = true;
                if (user.userId) {
                    check = await this.checkUserAlredyPlayedOrNot(user.userId, game.id)
                }


                if (activity || !check) {
                    gameAvailable['available'] = false
                    if (!check) {
                        gameAvailable['message'] = `You played this game in other device`
                    }
                }
                gamePlayed.push(gameAvailable)
            }
        }
        let data: any = user;
        data['gameData'] = gamePlayed
        return data;
    }

    async addQuetionAnswer(addQuetionDto: AddQuetionDto) {
        const {
            quetion, game_id, options
        } = addQuetionDto

        if (options.length > 4) {
            throw new BadRequestException(`Only 4 option avilable for a quetion`)
        }
        else if (options.length < 4) {
            throw new BadRequestException(`Minimum 4 option required for a quetion`)
        }

        var answer = 0;
        for await (const option of options) {
            if (option.is_right == true) {
                answer = answer + 1;
            }
        }

        if (answer = 0) {
            throw new BadRequestException(`please enter right answer`)
        }
        else if (answer > 1) {
            throw new BadRequestException(`Only one option select for right answer`)
        }

        const quetionData = new QuizGameQuetion;
        quetionData.gameId = game_id;
        quetionData.quetion = quetion;
        quetionData.createdDate = new Date();
        quetionData.status = true;
        quetionData.isDeleted = false;

        const savedQuetion = await quetionData.save();

        for await (const option of options) {
            var q = new QuizGameAnswer;
            q.quetionId = savedQuetion.id;
            q.answer = option.option;
            q.isRight = option.is_right
            q.createdDate = new Date();

            await q.save();
        }

        let result = await getManager()
            .createQueryBuilder(QuizGameQuetion, "quetion")
            .leftJoinAndSelect("quetion.option", "option")
            .leftJoinAndSelect("quetion.game", "game")
            .select(["quetion.id",
                "quetion.quetion",
                "quetion.status",
                "quetion.is_deleted",
                "option.id",
                "option.answer",
                "option.isRight",
                "game.id",
                "game.gameName"])
            .where(`quetion.id =:id`, { id: savedQuetion.id })
            .getOne();

        return result;
    }

    async getQuetionForUser() {
        let [result, count] = await getManager()
            .createQueryBuilder(QuizGameQuetion, "quetion")
            .leftJoinAndSelect("quetion.option", "option")
            .leftJoinAndSelect("quetion.game", "game")
            .select(["quetion.id",
                "quetion.quetion",
                "quetion.status",
                "quetion.is_deleted",
                "option.id",
                "option.answer",
                "game.id",
                "game.gameName"])
            .where(`quetion.is_deleted = false AND quetion.status = true`)
            .getManyAndCount();
        return { result, count };
    }

    async getQuetionForAdmin() {
        let [result, count] = await getManager()
            .createQueryBuilder(QuizGameQuetion, "quetion")
            .leftJoinAndSelect("quetion.option", "option")
            .leftJoinAndSelect("quetion.game", "game")
            .select(["quetion.id",
                "quetion.quetion",
                "quetion.status",
                "quetion.is_deleted",
                "option.id",
                "option.answer",
                "option.isRight",
                "game.id",
                "game.gameName"])
            .where(`quetion.is_deleted = false`)
            .getManyAndCount();
        return { result, count };
    }


    async deleteQuetion(id: number) {

        let quetion = await getManager()
            .createQueryBuilder(QuizGameQuetion, "quetion")
            .where("quetion.is_deleted = false AND quetion.id =:id", { id })
            .getOne();
        if (!quetion) {
            throw new NotFoundException(`Given quetion id not found`)
        }

        quetion.isDeleted = true;
        quetion.updatedDate = new Date();

        await quetion.save()
        return {
            message: `Quiz quetion deleted succefully`
        }
    }

    async changeStatus(id: number, statusDto: ActiveInactiveGameDto) {

        let quetion = await getManager()
            .createQueryBuilder(QuizGameQuetion, "quetion")
            .where("quetion.is_deleted = false AND quetion.id =:id", { id })
            .getOne();
        if (!quetion) {
            throw new NotFoundException(`Given quetion id not found`)
        }
        const { status } = statusDto
        quetion.status = status;
        quetion.updatedDate = new Date();

        await quetion.save()
        return {
            message: `Quiz quetion status changed succefully`
        }
    }

    async quizResult(quizResult: QuizResultDto) {
        const { user_id, first_name, last_name, email, quiz_answer } = quizResult

        let user = await getManager()
            .createQueryBuilder(MarketingUserData, "user")
            .where(`user.id =:user_id`, { user_id })
            .getOne();
        var existingUserId = null;
        if (!user.userId) {
            let existingUser = await getManager()
                .createQueryBuilder(User, "user")
                .where(`email =:email AND is_deleted = false`, { email })
                .andWhere(`"user"."role_id" in (:...roles) `, {
                    roles: [Role.FREE_USER, Role.PAID_USER, Role.GUEST_USER],
                })
                .getOne();

            if (existingUser) {
                existingUserId = existingUser.userId
            }
        }
        else {
            existingUserId = user.userId
        }
        var rightAnswer = 0;
        for await (const quizAnswer of quiz_answer) {
            let option = await getManager()
                .createQueryBuilder(QuizGameAnswer, "quizAnswer")
                .where(`quetion_id = ${quizAnswer.quetion_id} AND id = ${quizAnswer.option_id} AND is_right = true`)
                .getOne();

            if (option) {
                rightAnswer = rightAnswer + 1
            }
        }

        if (!user.email) {
            user.firstName = first_name
            user.lastName = last_name
            user.email = email
            user.userId = existingUserId;
            await user.save()
        }
        let game = await getManager()
            .createQueryBuilder(MarketingGame, "game")
            .where(`game_name = 'Quiz' AND is_deleted = false`)
            .getOne();
        if (!game) {
            throw new InternalServerErrorException(`Game not found  &&&game&&&${errorMessage}`)
        }

        const check = await this.checkUserAlredyPlayedOrNot(existingUserId, game.id)

        if (!check) {
            throw new ConflictException(`You alredy play a game on your ${user.deviceModel} device`)
        }
        let markup = await getManager()
            .createQueryBuilder(MarketingGameRewordMarkup, "markup")
            .where(`game_id = ${game.id} AND answer_value = '${rightAnswer}' AND status = true AND is_deleted = false`)
            .getOne();
        console.log(rightAnswer);
        var rewordPoint = 0;
        if (markup) {
            rewordPoint = markup.rewordPoint;
        }

        const activity = new MarketingUserActivity;
        activity.userId = user.id
        activity.gameId = game.id
        activity.reword = rewordPoint;
        activity.addToWallet = existingUserId ? true : false
        activity.createdDate = new Date();
        var point = null;
        if (existingUserId && rewordPoint > 0) {
            const laytripPoint = new LayCreditEarn
            laytripPoint.userId = existingUserId;
            laytripPoint.points = rewordPoint;
            laytripPoint.earnDate = new Date();
            laytripPoint.creditMode = RewordMode.GAME;
            laytripPoint.status = RewordStatus.AVAILABLE;
            laytripPoint.creditBy = existingUserId;
            laytripPoint.description = `User played a game`
            point = await laytripPoint.save();

        }
        if (!point) {
            activity.addToWallet = false
        }
        const replay: any = await activity.save();
        replay['marketingUser'] = user;
        replay['rightAnswer'] = rightAnswer;
        replay['mainUserId'] = existingUserId;

        return replay;
    }

    async checkUserAlredyPlayedOrNot(userId, gameId) {
        let users = await getManager()
            .createQueryBuilder(MarketingUserData, "user")
            .where(`user.user_id =:userId`, { userId })
            .getMany();

        var tDate = new Date();

        let game = await getManager()
            .createQueryBuilder(MarketingGame, "game")
            .where("game.is_deleted = false AND game.status = true AND game.id =:", { gameId })
            .getOne();
        var gamePlayed = []

        var periodTime = new Date();
        periodTime.setTime(tDate.getTime() - (game.gameAvailableAfter * 60 * 60 * 1000));
        console.log(periodTime);
        var date = periodTime.toISOString()
        date = date
            .replace(/T/, " ") // replace T with a space
            .replace(/\..+/, "");
        for await (const user of users) {
            const activity = await getManager()
                .createQueryBuilder(MarketingUserActivity, "activity")
                .where(`activity.created_date > '${date}' AND user_id = ${user.id} AND game_id = ${game.id}`)
                .getOne();
            return false
        }
        return true;
    }
}
