import {
	Injectable,
	NotFoundException,
	InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LanguageRepository } from "./language.repository";
import { ListLangugeDto } from "./dto/list-languge.dto";
import { Language } from "src/entity/language.entity";
import { CreateLangunageDto } from "./dto/create-langunage.dto";
import { UpdateLangunageDto } from "./dto/update-language.dto";
import { getConnection } from "typeorm";
import { LanguageStatusDto } from "./dto/langugeEnableDisable.dto";
import { User } from "@sentry/node";

@Injectable()
export class LangunageService {
	constructor(
		@InjectRepository(LanguageRepository)
		private languageRepository: LanguageRepository
	) {}

	async listLanguge(
		paginationOption: ListLangugeDto
	): Promise<{ data: Language[]; TotalReseult: number }> {
		try {
			return await this.languageRepository.listLanguage(paginationOption);
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No language Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${error.Message}`
			);
		}
	}

	async languageDetail(id: number): Promise<Language> {
		try {
			const languageData = await this.languageRepository.findOne({
				id,
				isDeleted: false,
			});
			if (!languageData) throw new NotFoundException(`No language found`);

			return languageData;
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No language Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${error.Message}`
			);
		}
	}

	async languageUpdate(
		id: number,
		updateLangunageDto: UpdateLangunageDto,
		adminId: string
	): Promise<{ message: string }> {
		try {
			const { iso_1_code, iso_2_code } = updateLangunageDto;
			const languageData = await this.languageRepository.findOne({
				id,
				isDeleted: false,
			});
			if (!languageData) throw new NotFoundException(`No language found`);
			languageData.iso_1Code = iso_1_code;
			languageData.iso_2Code = iso_2_code;
			//languageData.updatedBy = adminId;
			languageData.updatedDate = new Date();
			languageData.save();
			await getConnection().queryResultCache!.remove(["language"]);
			return { message: "Language is Updated" };
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No language Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${error.Message}`
			);
		}
	}

	async languageDelete(
		id: number,
		adminId: string
	): Promise<{ message: string }> {
		try {
			const languageData = await this.languageRepository.findOne({
				id,
				isDeleted: false,
			});
			if (!languageData) throw new NotFoundException(`No language found`);
			languageData.isDeleted = true;
			//languageData.updatedBy = adminId;
			languageData.updatedDate = new Date();
			languageData.save();
			await getConnection().queryResultCache.remove(["language"]);
			return { message: "Language is Deleted" };
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No language Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${error.Message}`
			);
		}
	}

	async changeLangugeStatus(
		id: number,
		languageStatusDto: LanguageStatusDto,
		adminId: User
	): Promise<{ message: string }> {
		try {
			const { status } = languageStatusDto;
			const Data = await this.languageRepository.findOne({
				id: id,
			});
			if (!Data) throw new NotFoundException(`No language found`);
			var statusName = status == "true" ? true : false;
			var task = statusName ? "Enable" : "Disable";
			Data.active = statusName;
			Data.updatedBy = adminId.userId;
			Data.updatedDate = new Date();
			Data.save();
			await getConnection().queryResultCache!.remove(["language"]);
			return { message: `Language ${Data.name} is ${task}` };
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No language Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${error.Message}`
			);
		}
	}
}
