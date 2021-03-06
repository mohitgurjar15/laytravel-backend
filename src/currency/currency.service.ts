import {
	Injectable,
	NotFoundException,
	InternalServerErrorException,
} from "@nestjs/common";
import { CurrencyRepository } from "./currency.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { Currency } from "src/entity/currency.entity";
import { UpdateCurrencyDto } from "./dto/update-currency.dto";
import { getConnection } from "typeorm";
import { User } from "@sentry/node";
import { CurrencyEnableDisableDto } from "./dto/currency-EnableDisable.dto";
import { Activity } from "src/utility/activity.utility";

@Injectable()
export class CurrencyService {
	constructor(
		@InjectRepository(CurrencyRepository)
		private currencyRepository: CurrencyRepository
	) {}

	async listCurrency(): Promise<{ data: Currency[] }> {
		try {
			return await this.currencyRepository.listCurrency();
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No currency found&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${error.Message}`
			);
		}
	}

	async CurrencyDetail(id: number): Promise<Currency> {
		try {
			const CurrencyData = await this.currencyRepository.findOne({
				id,
				isDeleted: false,
			});
			if (!CurrencyData) throw new NotFoundException(`No Currency found`);

			return CurrencyData;
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No currency found&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${error.Message}`
			);
		}
	}

	async CurrencyUpdate(
		id: number,
		updateCurrencyDro: UpdateCurrencyDto,
		adminId: string
	): Promise<{ message: string }> {
		try {
			const { rate } = updateCurrencyDro;
			const CurrencyData = await this.currencyRepository.findOne({
				id,
				isDeleted: false,
			});
			if (!CurrencyData) throw new NotFoundException(`No currency found`);
			const previousData = JSON.stringify(CurrencyData)
			CurrencyData.liveRate = rate;
			//CurrencyData.updatedBy = adminId;
			CurrencyData.updatedDate = new Date();
			CurrencyData.save();
			const correntData = JSON.stringify(CurrencyData)
			await getConnection().queryResultCache!.remove(["Currency"]);
			Activity.logActivity(adminId, "currency", `Currency rate ${rate} changed by admin`,previousData,correntData);
			return { message: "Currency updated successfully" };
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No currency found&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${error.Message}`
			);
		}
	}

	async changeCurrencyStatus(
		id: number,
		currencyStatusDto: CurrencyEnableDisableDto,
		adminId: User
	): Promise<{ message: string }> {
		try {
			const { status } = currencyStatusDto;
			const Data = await this.currencyRepository.findOne({
				id: id,
			});
			if (!Data) throw new NotFoundException(`No currency found`);
			
			const previousData = JSON.stringify(Data)
			Data.status = status;
			//Data. = adminId.userId;
			Data.updatedDate = new Date();
			Data.save();
			const currentData = JSON.stringify(Data)
			await getConnection().queryResultCache!.remove(["Currency"]);
			Activity.logActivity(adminId.id, "currency", `Currency ${Data.code} status ${status} changed by admin`,previousData,currentData);
			return { message: `${Data.code} currency status changed successfully` };
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No currency found&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${error.Message}`
			);
		}
	}

	// async CurrencyInsert(createCurrencyDto:CreateDto,adminId): Promise<{ message : string}> {
	// 	try {
	// 		const { rate } = updateCurrencyDro;
	// 		const CurrencyData = await this.currencyRepository.findOne({
	// 			id,
	// 			isDeleted: false
	// 		});
	// 		if (!CurrencyData) throw new NotFoundException(`No Currency found`);
	//         CurrencyData.liveRate = rate;
	//         //CurrencyData.updatedBy = adminId;
	//         CurrencyData.updatedDate = new Date()
	// 		CurrencyData.save();
	// 		await getConnection().queryResultCache!.remove(['Currency']);
	// 		return { message : "Currency is Updated"};
	// 	} catch (error) {
	// 		if (
	// 			typeof error.response !== "undefined" &&
	// 			error.response.statusCode == 404
	// 		) {
	// 			throw new NotFoundException(`No currency found&&&id`);
	// 		}

	// 		throw new InternalServerErrorException(
	// 			`${error.message}&&&id&&&${error.Message}`
	// 		);
	// 	}
	// }

	async CurrencyDelete(
		id: number,
		adminId: string
	): Promise<{ message: string }> {
		try {
			const CurrencyData = await this.currencyRepository.findOne({
				id,
				isDeleted: false,
			});
			if (!CurrencyData) throw new NotFoundException(`No Currency found`);
			const previousData = JSON.stringify(CurrencyData)
			CurrencyData.isDeleted = true;
			//CurrencyData.updatedBy = adminId;
			CurrencyData.updatedDate = new Date();
			CurrencyData.save();
			const currentData = JSON.stringify(CurrencyData)
			await getConnection().queryResultCache!.remove(["Currency"]);
			Activity.logActivity(adminId, "currency", `Currency ${CurrencyData.code} Deleted by admin`,previousData,currentData);
			return { message: "Currency deleted successfully" };
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No currency found&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${error.Message}`
			);
		}
	}
}
