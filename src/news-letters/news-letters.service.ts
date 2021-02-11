import {
	Injectable,
	ConflictException,
	InternalServerErrorException,
	NotFoundException,
	BadRequestException,
	NotAcceptableException,
	UnauthorizedException,
	ForbiddenException,
} from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { SubscribeForNewslatterDto } from "./dto/subscribe-for-newslatter.dto";
import { getConnection, getManager } from "typeorm";
import { NewsLetters } from "src/entity/news-letter.entity";
import { subscribeForNewsUpdates } from "src/config/email_template/subscribe-newsletter.html";
import { errorMessage } from "src/config/common.config";
import { ListSubscribeUsersDto } from "./dto/list-subscribe-users.dto";
import { NewsLettersRepository } from "./news-letters.repository";
import { InjectRepository } from "@nestjs/typeorm";
import * as config from "config";
import { NewsLetterMail } from "src/config/new_email_templete/news-letters.html";
import { ExportSubscribeUsersDto } from "./dto/export-newsLetters.dto";
const mailConfig = config.get("email");

@Injectable()
export class NewsLettersService {


	constructor(
		@InjectRepository(NewsLettersRepository)
		private newsLettersRepository: NewsLettersRepository,
		private readonly mailerService: MailerService
	) { }

	async subscribeForNewsLetters(
		subscribeForNewslatterDto: SubscribeForNewslatterDto
	) {
		try {
			const { email } = subscribeForNewslatterDto;

			let emailExiest = await this.newsLettersRepository.findOne({
				email
			})
			// let emailExiest = await getManager()
			// 	.createQueryBuilder(NewsLetters, "newsLetters")
			// 	.where(`email=:email`, { email })
			// 	.getOne();

			if (emailExiest && emailExiest.isSubscribed == false) {
				emailExiest.isSubscribed = true;
				await emailExiest.save();
			} else if (emailExiest) {
				throw new ConflictException(`You are already subscribed to our newsletter`)
			}
			else {
				const subscribeData = new NewsLetters();
				subscribeData.email = email;
				subscribeData.subscribeDate = new Date();
				subscribeData.isSubscribed = true;
				await subscribeData.save();
			}
			this.mailerService
				.sendMail({
					to: email,
					from: mailConfig.from,
					cc: mailConfig.BCC,
					subject: "Welcome to Laytrip",
					html: await NewsLetterMail(),
				})
				.then((res) => {
					console.log("res", res);
				})
				.catch((err) => {
					console.log("err", err);
				});
			return { message: `Thank you for joining our Laytrip community!` };
		} catch (error) {
			if (typeof error.response !== "undefined") {
				console.log("m");
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

	async unSubscribeForNewsLetters(
		subscribeForNewslatterDto: SubscribeForNewslatterDto
	) {
		try {
			const { email } = subscribeForNewslatterDto;

			let where = {};

			where['email'] = email

			const subscribeData = await this.newsLettersRepository.findOne({
				where: where
			});
			if (!subscribeData) {
				throw new NotFoundException(`No subsciber found.`)
			}
			//console.log(subscribeData);

			if (!subscribeData.isSubscribed) {
				throw new ConflictException(
					`Given email id is alredy unsubscribed &&&email&&&Given email id is alredy unsubscribed `
				);
			}

			await getConnection()
				.createQueryBuilder()
				.update(NewsLetters)
				.set({ isSubscribed: false, unSubscribeDate: new Date() })
				.where("id = :id", { id: subscribeData.id })
				.execute();
			// subscribeData.isSubscribed = false;
			// subscribeData.unSubscribeDate = new Date();
			// await subscribeData.save();
			// this.mailerService
			// 	.sendMail({
			// 		to: email,
			// 		from: "no-reply@laytrip.com",
			// 		subject: "You are subscribed us ",
			// 		html: subscribeForNewsUpdates(),
			// 	})
			// 	.then((res) => {
			// 		console.log("res", res);
			// 	})
			// 	.catch((err) => {
			// 		console.log("err", err);
			// 	});
			return { message: `Email id unsubscribed successfully` };
		} catch (error) {
			if (typeof error.response !== "undefined") {

				switch (error.response.statusCode) {
					case 404:
						if (
							error.response.message ==
							"This user does not exist&&&email&&&This user does not exist"
						) {
							error.response.message = `This traveler does not exist&&&email&&&This traveler not exist`;
						}
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


	async listSubscriber(
		paginationOption: ListSubscribeUsersDto
	) {
		try {
			return await this.newsLettersRepository.listSubscriber(paginationOption);
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


	async exportSubscriber(
		paginationOption: ExportSubscribeUsersDto
	) {
		try {
			return await this.newsLettersRepository.exportSubscriber(paginationOption);
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
}
