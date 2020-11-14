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
			const { name } = updateLangunageDto;
			const languageData = await this.languageRepository.findOne({
				id,
				isDeleted: false,
			});
			if (!languageData) throw new NotFoundException(`No language found`);
			languageData.name = name;
			//languageData.updatedBy = adminId;
			languageData.updatedDate = new Date();
			languageData.save();
			await getConnection().queryResultCache!.remove(["languages"]);
			Activity.logActivity(adminId, "language", `${languageData.name} Languge is updated by admin`);
        
			return { message: "Language Updated Successfully" };
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
			await getConnection().queryResultCache!.remove(["languages"]);
			Activity.logActivity(adminId, "language", `${languageData.name} Languge is Deleted by admin`);
        
			return { message: "Language Deleted successfully" };
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
			
			Data.active = status;
			Data.updatedBy = adminId.userId;
			Data.updatedDate = new Date();
			Data.save();
			await getConnection().queryResultCache!.remove(["languages"]);
			Activity.logActivity(adminId.userId, "language", `${Data.name} Languge status changed by admin`);
        
			return { message: `${Data.name} Language  status Changed successfully` };
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
