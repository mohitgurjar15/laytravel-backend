import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { errorMessage } from 'src/config/common.config';
import { LayCreditEarn } from 'src/entity/lay-credit-earn.entity';
import { MarketingGameRewordMarkup } from 'src/entity/marketing-game-reword-markup.entity';
import { MarketingGame } from 'src/entity/marketing-game.entity';
import { MarketingUserActivity } from 'src/entity/marketing-user-activity.entity';
import { MarketingUserData } from 'src/entity/marketing-user.entity';
import { QuizGameAnswer } from 'src/entity/quiz-game-answer.entity';
import { User } from 'src/entity/user.entity';
import { RewordMode } from 'src/enum/reword-mode.enum';
import { RewordStatus } from 'src/enum/reword-status.enum';
import { Role } from 'src/enum/role.enum';
import { getConnection, getManager } from 'typeorm';
import { ActiveInactiveGameMarkupDto } from './dto/active-inactive-game-markup.dto';
import { ActiveInactiveGameDto } from './dto/active-inactive-game.dto';
import { AddQuestionDto } from './dto/add-question-answer.dto';
import { addRewordMarkupDto } from './dto/add-reword-markup.dto';
import { CreateGameDto } from './dto/new-game.dto';
import { CreateMarketingUserDto } from './dto/new-marketing-user.dto';
import { QuizResultDto } from './dto/quiz-result.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { UpdateRewordMarkupDto } from './dto/update-reword-markup.dto';
import { UpdateMarketingUserDto } from './dto/update-marketing-user.dto';
import { exit } from 'process';
import { SubmitWheelDto } from './dto/wheel-submit.dto';
import { QuizGameQuestion } from 'src/entity/quiz-game-question.entity';
import { ListUserActivity } from './dto/list-user-activity.dto';

@Injectable()
export class MarketingService {

    async addGame(createGameDto: CreateGameDto) {
        try {
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
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:

                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);

                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async listGame() {
        try {
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
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:

                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async updateGame(id: number, updateGameDto: UpdateGameDto) {
        try {
            const { available_after } = updateGameDto



            let game = await getManager()
                .createQueryBuilder(MarketingGame, "game")
                .where("game.is_deleted = false AND game.id =:id", { id })
                .getOne();
            if (!game) {
                throw new NotFoundException(`Given game id not found`)
            }

            //game.gameName = game_name;
            game.gameAvailableAfter = available_after,
                game.updatedDate = new Date();

            await game.save()
            return {
                message: `Game Updated succefully`
            }
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:

                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async deleteGame(id: number) {
        try {
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
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:

                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }


    async activeInactiveGame(id: number, activeInactivedto: ActiveInactiveGameDto) {
        try {
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
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:

                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }


    async getGameData(id: number) {
        try {
            let result = await getManager()
                .createQueryBuilder(MarketingGame, "game")
                .leftJoinAndSelect("game.marketingGameRewordMarkups", "markup")
                .where(`game.is_deleted = false AND game.id =:id`, { id })
                .getOne();
            if (!result) {
                throw new NotFoundException('Game id not found')
            }
            return result;
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:

                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async addRewordMarkup(createNewMarkup: addRewordMarkupDto) {
        try {
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
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:

                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async UpateRewordMarkup(id: number, updateRewordMarkupDto: UpdateRewordMarkupDto) {
        try {
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
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:

                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async deleteGameMarkup(id: number) {
        try {
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
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:

                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async activeInactiveGameMarkup(id: number, activeInactivedto: ActiveInactiveGameMarkupDto) {
        try {
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
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:

                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async marketingUser(userDto: CreateMarketingUserDto, req) {
        try {
            const {
                signup_via, device_model, device_type, app_version, os_version, name, email
            } = userDto
            const ip_address = req.connection.remoteAddress
            let user = await getManager()
                .createQueryBuilder(MarketingUserData, "user")
                .where(`email =:email `, { email })
                .getOne();

            if (user && user.ipAddress != ip_address) {
                throw new ConflictException(`This email address is already registered with us. Please enter different email address .`)
            }

            let ipAddressData = await getManager()
                .createQueryBuilder(MarketingUserData, "user")
                .where(`ip_address =:ip_address `, { ip_address })
                .getOne();

            if (ipAddressData && ipAddressData.email != email) {
                throw new ConflictException(`On current Device another email subscribed`)
            }

            let existingUser = await getManager()
                .createQueryBuilder(User, "user")
                .where(`email =:email AND is_deleted = false`, { email })
                .andWhere(`"user"."role_id" in (:...roles) `, {
                    roles: [Role.FREE_USER, Role.PAID_USER, Role.GUEST_USER],
                })
                .getOne();
            if (!user) {
                let userData = new MarketingUserData()
                userData.deviceType = device_type || null
                userData.email = email
                userData.firstName = name
                userData.userId = existingUser ? existingUser.userId : null
                userData.deviceModel = device_model || null
                userData.ipAddress = ip_address
                userData.appVersion = app_version || null
                userData.osVersion = os_version || null
                user = await userData.save();
            }

            var tDate = new Date();

            var periodTime = new Date();
            periodTime.setTime(tDate.getTime() - (24 * 60 * 60 * 1000));
            console.log(periodTime);
            var date = periodTime.toISOString()
            date = date
                .replace(/T/, " ") // replace T with a space
                .replace(/\..+/, "");

            const activity = await getManager()
                .createQueryBuilder(MarketingUserActivity, "activity")
                .where(`activity.created_date > '${date}' AND user_id = ${user.id}`)
                .getOne();
            console.log(activity);

            const playedGame = await getManager()
                .createQueryBuilder(MarketingUserActivity, "activity")
                .leftJoinAndSelect("activity.game", "game")
                .where(`user_id = ${user.id}`)
                .getMany();

            var available = true
            if (activity) {
                available = false
                exit;
            }
            let data: any = user;
            data['gameAvailable'] = available;
            data['playedGame'] = playedGame
            return data;
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:

                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async addquestionAnswer(addquestionDto: AddQuestionDto) {
        try {
            const {
                question, options
            } = addquestionDto

            let game = await getManager()
                .createQueryBuilder(MarketingGame, "game")
                .where(`game.is_deleted = false AND game.game_name =:name`, { name: `Quiz` })
                .getOne();
            if (!game) {
                throw new NotFoundException(`Quiz game not avilable`)
            }

            if (options.length > 4) {
                throw new BadRequestException(`Only 4 option avilable for a question`)
            }
            else if (options.length < 4) {
                throw new BadRequestException(`Minimum 4 option required for a question`)
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

            const questionData = new QuizGameQuestion;
            questionData.gameId = game.id;
            questionData.question = question;
            questionData.createdDate = new Date();
            questionData.status = true;
            questionData.isDeleted = false;

            const savedquestion = await questionData.save();

            for await (const option of options) {
                var q = new QuizGameAnswer;
                q.questionId = savedquestion.id;
                q.answer = option.option;
                q.isRight = option.is_right
                q.createdDate = new Date();

                await q.save();
            }

            let result = await getManager()
                .createQueryBuilder(QuizGameQuestion, "question")
                .leftJoinAndSelect("question.option", "option")
                .leftJoinAndSelect("question.game", "game")
                .select(["question.id",
                    "question.question",
                    "question.status",
                    "question.is_deleted",
                    "option.id",
                    "option.answer",
                    "option.isRight",
                    "game.id",
                    "game.gameName"])
                .where(`question.id =:id`, { id: savedquestion.id })
                .getOne();

            return result;
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:

                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async getquestionForUser() {
        try {
            let [result, count] = await getManager()
                .createQueryBuilder(QuizGameQuestion, "question")
                .leftJoinAndSelect("question.option", "option")
                .leftJoinAndSelect("question.game", "game")
                .select(["question.id",
                    "question.question",
                    "question.status",
                    "question.is_deleted",
                    "option.id",
                    "option.answer",
                    "game.id",
                    "game.gameName"])
                .where(`question.is_deleted = false AND question.status = true`)
                .getManyAndCount();
            return { result, count };
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:

                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async getquestionForAdmin() {
        try {
            let [result, count] = await getManager()
                .createQueryBuilder(QuizGameQuestion, "question")
                .leftJoinAndSelect("question.option", "option")
                .leftJoinAndSelect("question.game", "game")
                .select(["question.id",
                    "question.question",
                    "question.status",
                    "question.is_deleted",
                    "option.id",
                    "option.answer",
                    "option.isRight",
                    "game.id",
                    "game.gameName"])
                .where(`question.is_deleted = false`)
                .getManyAndCount();
            return { result, count };
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:

                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async deletequestion(id: number) {
        try {
            let question = await getManager()
                .createQueryBuilder(QuizGameQuestion, "question")
                .where("question.is_deleted = false AND question.id =:id", { id })
                .getOne();
            if (!question) {
                throw new NotFoundException(`Given question id not found`)
            }

            question.isDeleted = true;
            question.updatedDate = new Date();

            await question.save()
            return {
                message: `Quiz question deleted succefully`
            }
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:

                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async changequestionStatus(id: number, statusDto: ActiveInactiveGameDto) {
        try {
            let question = await getManager()
                .createQueryBuilder(QuizGameQuestion, "question")
                .where("question.is_deleted = false AND question.id =:id", { id })
                .getOne();
            if (!question) {
                throw new NotFoundException(`Given question id not found`)
            }
            const { status } = statusDto
            question.status = status;
            question.updatedDate = new Date();

            await question.save()
            return {
                message: `Quiz question status changed succefully`
            }
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:

                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async quizResult(quizResult: QuizResultDto, req) {
        try {
            console.log(req.connection.remoteAddress);

            const { quiz_answer } = quizResult
            const ipAddress = req.connection.remoteAddress
            let user = await getManager()
                .createQueryBuilder(MarketingUserData, "user")
                .where(`ip_address =:ipAddress`, { ipAddress })
                .getOne();
            const existingUserId = user.userId;





            let game = await getManager()
                .createQueryBuilder(MarketingGame, "game")
                .where(`game_name = 'Quiz' AND is_deleted = false`)
                .getOne();
            if (!game) {
                throw new InternalServerErrorException(`Game not found  &&&game&&&${errorMessage}`)
            }

            const activityData = await getManager()
                .createQueryBuilder(MarketingUserActivity, "activity")
                .where(`user_id = ${user.id} AND game_id = ${game.id}`)
                .getOne();

            if (activityData) {
                throw new ForbiddenException(`You have alredy played Quiz game`)
            }

            var rightAnswer = 0;
            for await (const quizAnswer of quiz_answer) {
                let option = await getManager()
                    .createQueryBuilder(QuizGameAnswer, "quizAnswer")
                    .where(`question_id = ${quizAnswer.question_id} AND id = ${quizAnswer.option_id} AND is_right = true`)
                    .getOne();

                if (option) {
                    rightAnswer = rightAnswer + 1
                }
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
                laytripPoint.creditMode = RewordMode.QUIZGAME;
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
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:

                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async updateMarketingUser(updateMarketingUserDto: UpdateMarketingUserDto) {
        try {
            const { user_id, first_name, last_name, email } = updateMarketingUserDto

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


            if (!user.email) {
                user.firstName = first_name || null
                user.lastName = last_name || null
                user.email = email
                user.userId = existingUserId;
                await user.save()
            }

            if (existingUserId) {
                const allActivity = await getManager()
                    .createQueryBuilder(MarketingUserActivity, "activity")
                    .where(`user_id = ${user.id} AND added_to_wallet = false`)
                    .getMany();
                if (allActivity.length) {
                    for await (const activity of allActivity) {
                        activity.addToWallet = existingUserId ? true : false
                        var point = null;
                        if (existingUserId && activity.reword > 0) {
                            const laytripPoint = new LayCreditEarn
                            laytripPoint.userId = existingUserId;
                            laytripPoint.points = activity.reword;
                            laytripPoint.earnDate = new Date();
                            laytripPoint.creditMode = RewordMode.QUIZGAME;
                            laytripPoint.status = RewordStatus.AVAILABLE;
                            laytripPoint.creditBy = existingUserId;
                            laytripPoint.description = `User played a game`
                            point = await laytripPoint.save();
                        }
                        if (!point) {
                            activity.addToWallet = false
                        }
                        const replay: any = await activity.save();
                    }
                }
            }
            return user;
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:

                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async checkUserAlredyPlayedOrNot(userId, gameId) {
        try {
            let users = await getManager()
                .createQueryBuilder(MarketingUserData, "user")
                .where(`user_id =:userId`, { userId })
                .getMany();

            var tDate = new Date();

            let game = await getManager()
                .createQueryBuilder(MarketingGame, "game")
                .where("game.is_deleted = false AND game.status = true AND game.id =:gameId", { gameId })
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
                if (activity) {
                    return false
                }
            }
            return true;
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:

                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async wheelGameOptionListForUser() {
        try {
            let game = await getManager()
                .createQueryBuilder(MarketingGame, "game")

                .where(`game.is_deleted = false AND game.game_name =:name`, { name: `wheel` })
                .getOne();
            if (!game) {
                throw new NotFoundException(`Wheel game not avilable`)
            }
            let [markup, count] = await getManager()
                .createQueryBuilder(MarketingGameRewordMarkup, "markup")
                .select(["markup.id", "markup.answerValue", "markup.rewordPoint"])
                .where(`markup.is_deleted = false AND markup.status = true AND markup.game_id =:id`, { id: game.id })
                .getManyAndCount();

            return {
                data: markup, count: count
            }
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:

                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async submitWheelGame(submitWheeldto: SubmitWheelDto, req) {
        try {
            const { reword_point } = submitWheeldto
            let game = await getManager()
                .createQueryBuilder(MarketingGame, "game")
                .where(`game.is_deleted = false AND game.game_name =:name`, { name: `wheel` })
                .getOne();
            if (!game) {
                throw new NotFoundException(`Wheel game not avilable`)
            }

            // let [markup, count] = await getManager()
            //     .createQueryBuilder(MarketingGameRewordMarkup, "markup")
            //     .where(`markup.is_deleted = false AND markup.status = true AND markup.game_id =:id`, { id: game.id })
            //     .getManyAndCount();
            // const random = await this.between(0, count - 1)
            // console.log(random);

            // const reword = markup[random]
            // const rewordPoint = reword.rewordPoint;
            const ipAddress = req.connection.remoteAddress
            let user = await getManager()
                .createQueryBuilder(MarketingUserData, "user")
                .where(`ip_address =:ipAddress`, { ipAddress })
                .getOne();
            const activityData = await getManager()
                .createQueryBuilder(MarketingUserActivity, "activity")
                .where(`user_id = ${user.id} AND game_id = ${game.id}`)
                .getOne();

            if (activityData) {
                throw new ForbiddenException(`You have alredy played Wheel game`)
            }

            let existingUserId = null;

            if (user.userId) {
                existingUserId = user.userId
            }
            const activity = new MarketingUserActivity;
            activity.userId = user.id
            activity.gameId = game.id
            activity.reword = reword_point;
            activity.addToWallet = existingUserId ? true : false
            activity.createdDate = new Date();
            var point = null;
            if (existingUserId && reword_point > 0) {
                const laytripPoint = new LayCreditEarn
                laytripPoint.userId = existingUserId;
                laytripPoint.points = reword_point;
                laytripPoint.earnDate = new Date();
                laytripPoint.creditMode = RewordMode.WHEELGAME;
                laytripPoint.status = RewordStatus.AVAILABLE;
                laytripPoint.creditBy = existingUserId;
                laytripPoint.description = `User played a game`
                point = await laytripPoint.save();
            }
            if (!point) {
                activity.addToWallet = false
            }
            const replay: any = await activity.save();
            return replay

            // replay['marketingUser'] = user;
            // return replay;
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:

                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async between(min, max) {
        return Math.ceil(
            Math.random() * (max - min) + min
        )
    }

    async userActivity(useractivity: ListUserActivity) {
        const { page_no, limit, search } = useractivity

        const take = limit || 10;
        const skip = (page_no - 1) * limit || 0;

        let query = getConnection()
            .createQueryBuilder(MarketingUserActivity, "activity")
            //.createQueryBuilder(MarketingUserData, "user")
            .leftJoinAndSelect("activity.marketingUserData", "marketingUserData")
            .leftJoinAndSelect("activity.game", "game")
            .take(take)
            .skip(skip)
        if (search) {
            query = query.where(`"marketingUserData"."email" ILIKE '%${search}%' OR "marketingUserData"."first_name" ILIKE '%${search}%' OR "marketingUserData"."ip_address" ILIKE '%${search}%' OR "marketingUserData"."app_version" ILIKE '%${search}%' OR "game"."game_name" ILIKE '%${search}%'  `);
        }

        const [result, count] = await query.getManyAndCount();
        //const count = await query.getCount();
        return { data: result, total_result: count };

    }
}
