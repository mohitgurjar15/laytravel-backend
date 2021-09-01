import {
	Injectable,
	NotFoundException,
	InternalServerErrorException,
	BadRequestException, ConflictException, NotAcceptableException, UnauthorizedException, ForbiddenException
} from "@nestjs/common";
import { FaqRepository } from "./faq.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { ListFaqDto } from "./dto/list-faq.dto";
import { Faq } from "src/entity/faq.entity";
import { errorMessage } from "src/config/common.config";
import { InsertFaqDto } from "./dto/insert-faq.dto";
import { User } from "@sentry/node";
import { Activity } from "src/utility/activity.utility";
import { UpdateFaqDto } from "./dto/update-faq.dto";
import { ActiveDeactiveFaq } from "./dto/active-deactive-faq.dto";
import { FaqCategory } from "src/entity/faq-category.entity";
import { FaqMeta } from "src/entity/faq-meta.entity";
import { getConnection, getManager } from "typeorm";

@Injectable()
export class FaqService {
	constructor(
		@InjectRepository(FaqRepository)
		private FaqRepository: FaqRepository
	) { }

	async listFaq(
		paginationOption: ListFaqDto
	): Promise<{ data: Faq[]; TotalReseult: number }> {
		try {
			return await this.FaqRepository.listFaq(paginationOption);
		} catch (error) {
			if (typeof error.response !== "undefined") {
				switch (error.response.statusCode) {
					case 404:
						throw new NotFoundException(error.response.message);
					case 409:
						throw new ConflictException(error.response.message);
					case 422:
						throw new BadRequestException(error.response.message);
					case 500:
						throw new InternalServerErrorException(error.response.message);
					case 403:
						throw new ForbiddenException(error.response.message);
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

	async listFaqForUser(): Promise<{ data: FaqCategory[]; TotalReseult: number }> {
		try {
			return await this.FaqRepository.listFaqforUser();
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

	async createFaq(
		InsertFaqDto: InsertFaqDto,
		user: User
	) {
		const { categoryId, faqs } = InsertFaqDto;
		let activityLog = []
		const adminId = user.userId;
		const faq = new Faq();
		faq.createdDate = new Date();
		faq.category_id = categoryId
		faq.updatedDate = new Date();
		let faqRes: any = await faq.save();
		activityLog.push(faqRes)

		const faq_meta = [];
		for await (const iterator of faqs) {

			faq_meta.push({
				language_id: iterator.language_id,
				question: iterator.question,
				answer: iterator.answer,
				faq_id: faqRes.id
			})
			activityLog.push(iterator)

			//let newMeta = faq_meta.save();
		}

		try {
			getConnection()
				.createQueryBuilder()
				.insert()
				.into(FaqMeta)
				.values(faq_meta)
				.execute();
			Activity.logActivity(adminId, "faq", ` New Faq Created By The Admin`, null, JSON.stringify(faq_meta));
			return { message: "Faq created successfully." };
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

	async updateFaq(
		id: number,
		updateFaqDto: UpdateFaqDto,
		user: User
	): Promise<{ message: string }> {
		const { categoryId, faqs } = updateFaqDto;
		const adminId = user.userId;

		const faq = await this.FaqRepository.findOne({ id });
		if (!faq) {
			throw new NotFoundException(`Faq Id Not Found.`);
		}
		let previousData = []
		let currentData = []
		previousData.push(faq)
		faq.category_id = categoryId;
		faq.updatedDate = new Date();
		let faqRes: any = await faq.save();
		currentData.push(faqRes)
		for await (const iterator of faqs) {
			if (iterator.language_id) {
				const query = getManager()
					.createQueryBuilder(FaqMeta, "faq")
					.where(`"faq"."faq_id" = '${id}' AND "faq"."language_id" = '${iterator.language_id}'`)
				const response = await query.getOne();
				console.log('response**', response)
				previousData.push(response)
				response.question = iterator.question
				response.answer = iterator.answer
				response.save();
				currentData.push(iterator)
			} else {
				let data = [{
					question:iterator.question,
					answer: iterator.answer,
					language_id:iterator.language_id,
					faq_id:faq.id
				}]
				getConnection()
				.createQueryBuilder()
				.insert()
				.into(FaqMeta)
				.values(data)
				.execute();
				currentData.push(iterator)
			}
		}
		try {
			Activity.logActivity(adminId, "faq", `Faq updated by the admin`, previousData, currentData);
			return { message: "Faq updated successfully." };
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

	async deleteFaq(id: number, user: User): Promise<{ message: string }> {
		const adminId = user.id;
		try {
			const faq = await this.FaqRepository.findOne({ id });
			if (!faq) {
				throw new NotFoundException(`Faq Id Not Found`);
			}
			const previousData = JSON.stringify(faq)
			faq.isDeleted = true;
			faq.save();
			const currentData = JSON.stringify(faq)
			Activity.logActivity(adminId, "faq", `Faq Deleted by the admin`, previousData, currentData);
			return { message: "Faq deleted successfully." };
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

	async activeDeactiveFaq(
		id: number,
		activeDeactiveFaq: ActiveDeactiveFaq,
		user: User
	) {
		const { status } = activeDeactiveFaq;
		const adminId = user.id;
		try {
			const faq = await this.FaqRepository.findOne({ id });
			if (!faq) {
				throw new NotFoundException(`Faq Id Not Found`);
			}
			const previousData = JSON.stringify(faq)
			faq.status = status;
			faq.save();
			const currentData = JSON.stringify(faq)
			Activity.logActivity(adminId, "faq", `Faq status changed by the admin`, previousData, currentData);
			return { message: "Faq status changed." };
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

	async getFaq(id: number) {
		try {
			// const faq = await this.FaqRepository.findOne({ id });
			let where: any = `"faq"."id" = '${id}' AND "faq"."is_deleted" = false AND "category"."is_deleted" = false`
			const query = await getManager()
				.createQueryBuilder(Faq, "faq")
				.leftJoinAndSelect("faq.category_id", "category")
				.leftJoinAndSelect("faq.faq_meta", "faq_meta")
				.select([
					'faq.id',
					'category.id', 'category.name',
					'faq_meta.id', 'faq_meta.answer', 'faq_meta.question', 'faq_meta.language_id', 'faq_meta.faq_id'


				])
				.where(where)
			let result = await query.getMany()
			console.log(JSON.stringify(result))
			if (!result) {
				throw new NotFoundException(`Faq Id Not Found`);
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
}
