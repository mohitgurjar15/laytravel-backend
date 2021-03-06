import {
	Injectable,
	NotFoundException,
	InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LanguageRepository } from "./language.repository";
import { Language } from "src/entity/language.entity";
import { UpdateLangunageDto } from "./dto/update-language.dto";
import { getConnection } from "typeorm";
import { LanguageStatusDto } from "./dto/langugeEnableDisable.dto";
import { User } from "@sentry/node";
import { Activity } from "src/utility/activity.utility";

@Injectable()
export class LangunageService {
	constructor(
		@InjectRepository(LanguageRepository)
		private languageRepository: LanguageRepository
	) {}

	async listLanguge(
		//paginationOption: ListLangugeDto
	): Promise<{ data: Language[];}> {
		try {
			return await this.languageRepository.listLanguage();
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No language found.&&&id`);
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
				throw new NotFoundException(`No language found.&&&id`);
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
			const { name } = updateLangunageDto;
			const languageData = await this.languageRepository.findOne({
				id,
				isDeleted: false,
			});
			if (!languageData) throw new NotFoundException(`No language found`);
			const previousData = JSON.stringify(languageData)
			languageData.name = name;
			//languageData.updatedBy = adminId;
			languageData.updatedDate = new Date();
			languageData.save();
			const currentData = JSON.stringify(languageData)
			
			await getConnection().queryResultCache!.remove(["languages"]);
			Activity.logActivity(adminId, "Language", `${languageData.name} Languge is updated by admin`,previousData,currentData);
        
			return { message: "Language updated successfully." };
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No language found.&&&id`);
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
			const previousData = JSON.stringify(languageData)
			languageData.isDeleted = true;
			//languageData.updatedBy = adminId;
			languageData.updatedDate = new Date();
			languageData.save();
			const currentData = JSON.stringify(languageData)
			await getConnection().queryResultCache!.remove(["languages"]);
			Activity.logActivity(adminId, "Language", `${languageData.name} Languge is Deleted by admin`,previousData,currentData);
        
			return { message: "Language Deleted successfully" };
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No language found.&&&id`);
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
			const previousData = JSON.stringify(Data)
			
			Data.active = status;
			Data.updatedBy = adminId.userId;
			Data.updatedDate = new Date();
			Data.save();
			const currentData = JSON.stringify(Data)
			await getConnection().queryResultCache!.remove(["languages"]);
			Activity.logActivity(adminId.userId, "Language", ` Languge ${Data.name} status changed by admin`,previousData,currentData);
        
			return { message: `${Data.name} language status changed successfully` };
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No language found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${error.Message}`
			);
		}
	}
}
