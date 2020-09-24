import {
	Injectable,
	ConflictException,
	InternalServerErrorException,
	NotFoundException,
	BadRequestException,
	NotAcceptableException,
	UnauthorizedException,
} from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { SubscribeForNewslatterDto } from "./dto/subscribe-for-newslatter.dto";
import { getManager } from "typeorm";
import { NewsLetters } from "src/entity/news-letter.entity";
import { subscribeForNewsUpdates } from "src/config/email_template/subscribe-newsletter.html";
import { errorMessage } from "src/config/common.config";

@Injectable()
export class NewsLettersService {
	constructor(private readonly mailerService: MailerService) {}

	async subscribeForNewsLetters(
		subscribeForNewslatterDto: SubscribeForNewslatterDto
	) {
		try {
			const { email } = subscribeForNewslatterDto;

			let emailExiest = await getManager()
				.createQueryBuilder(NewsLetters, "newsLetters")
				.where(`email=:email AND is_subscribed = true`, { email })
				.getOne();
			if (emailExiest) {
				throw new ConflictException(
					`Given email id is alredy subscribed with us&&&email&&&Given email id is alredy subscribed with us`
				);
			}

			const subscribeData = new NewsLetters();

			subscribeData.email = email;
			subscribeData.subscribeDate = new Date();
			subscribeData.isSubscribed = true;

			await subscribeData.save();
			this.mailerService
				.sendMail({
					to: email,
					from: "no-reply@laytrip.com",
					subject: "Welcome to Laytrip",
					html: subscribeForNewsUpdates(),
				})
				.then((res) => {
					console.log("res", res);
				})
				.catch((err) => {
					console.log("err", err);
				});
			return { message: `Email id subscribed successfully` };
		} catch (error) {
			if (typeof error.response !== "undefined") {
				console.log("m");
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

			let subscribeData = await getManager()
				.createQueryBuilder(NewsLetters, "newsLetters")
                .where(`email=:email `, { email })
                .orderBy('id','DESC')
				.getOne();
			if (!subscribeData) {
				throw new NotFoundException(
					`Given email id not found&&&email&&&Given email id not found`
				);
			}

			if (!subscribeData.isSubscribed) {
				throw new ConflictException(
					`Given email id is alredy unsubscribed &&&email&&&Given email id is alredy unsubscribed `
				);
			}
			subscribeData.isSubscribed = false;
			subscribeData.unSubscribeDate = new Date();
			await subscribeData.save();
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
				console.log("m");
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
