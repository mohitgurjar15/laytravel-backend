import {
	Injectable,
	NotFoundException,
	InternalServerErrorException,
	BadRequestException,
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

@Injectable()
export class FaqService {
	constructor(
		@InjectRepository(FaqRepository)
		private FaqRepository: FaqRepository
	) {}

	async listFaq(
		paginationOption: ListFaqDto
	): Promise<{ data: Faq[]; TotalReseult: number }> {
		try {
			return await this.FaqRepository.listFaq(paginationOption);
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No faq Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}

	async createFaq(
		InsertFaqDto: InsertFaqDto,
		user: User
	): Promise<{ message: string }> {
		const { categoryId, question, answer } = InsertFaqDto;
		const adminId = user.id;
		const checkfaq = await this.FaqRepository.count({
			categoryId: categoryId,
			question: question,
		});
		if (checkfaq) {
			throw new BadRequestException(`given quetion is alredy available`);
		}

		const faq = new Faq();

		faq.categoryId = categoryId;
		faq.question = question;
		faq.answer = answer;
		faq.createdDate = new Date();
		faq.updatedDate = new Date();
		try {
			await faq.save();
			Activity.logActivity(adminId, "faq", ` New Faq Created By The Admin`);
			return { message: "Faq Careated successfully" };
		} catch (error) {
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
		const { categoryId, question, answer } = updateFaqDto;
		const adminId = user.id;

		const faq = await this.FaqRepository.findOne({ id });
		if (!faq) {
			throw new NotFoundException(`Faq Id Not Found`);
		}
		faq.categoryId = categoryId;
		faq.question = question;
		faq.answer = answer;
		faq.updatedDate = new Date();
		try {
			await faq.save();
			Activity.logActivity(adminId, "faq", `Faq updated by the admin`);
			return { message: "Faq Updated Successfully" };
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No Faq Found.&&&id`);
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
			faq.isDeleted = true;
			faq.save();
			Activity.logActivity(adminId, "faq", `Faq Deleted by the admin`);
			return { message: "Faq Deleted Successfully" };
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`${error.message} &&& id &&& ${error.message}`);
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
			faq.status = status;
			faq.save();
			Activity.logActivity(adminId, "faq", `Faq status changed by the admin`);
			return { message: "Faq Status Changed" };
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No Faq Found.&&&id`);
			}
			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}

	async getFaq(id: number):Promise <Faq> {
		try {
			const faq = await this.FaqRepository.findOne({ id });
			if (!faq) {
				throw new NotFoundException(`Faq Id Not Found`);
			}
			if (faq.isDeleted == true)
			{
				throw new NotFoundException(`Given Faq is Deleted`);
			}
			return faq;
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No Faq Found.&&&id`);
			}
			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}
}
