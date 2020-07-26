import {
	Injectable,
	NotFoundException,
	InternalServerErrorException,
} from "@nestjs/common";
import { CurrencyRepository } from "./currency.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { ListCurrencyDto } from "./dto/list-currency.dto";
import { Currency } from "src/entity/currency.entity";
import { UpdateCurrencyDto } from "./dto/update-currency.dto";
import { getConnection } from "typeorm";
import { CreateLangunageDto } from "src/langunage/dto/create-langunage.dto";
import { User } from "@sentry/node";
import { CurrencyEnableDisableDto } from "./dto/currency-EnableDisable.dto";

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
				throw new NotFoundException(`No Currency Found.&&&id`);
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
				throw new NotFoundException(`No Currency Found.&&&id`);
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
			if (!CurrencyData) throw new NotFoundException(`No Currency found`);
			CurrencyData.liveRate = rate;
			//CurrencyData.updatedBy = adminId;
			CurrencyData.updatedDate = new Date();
			CurrencyData.save();
			await getConnection().queryResultCache!.remove(["Currency"]);
			return { message: "Currency is Updated" };
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No Currency Found.&&&id`);
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
			if (!Data) throw new NotFoundException(`No language found`);
			console.log(status);
			
			
			Data.status = status;
			//Data. = adminId.userId;
			Data.updatedDate = new Date();
			Data.save();
			await getConnection().queryResultCache!.remove(["Currency"]);
			return { message: `Currency ${Data.code} Status Changed` };
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
	// 			throw new NotFoundException(`No Currency Found.&&&id`);
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
			CurrencyData.isDeleted = true;
			//CurrencyData.updatedBy = adminId;
			CurrencyData.updatedDate = new Date();
			CurrencyData.save();
			await getConnection().queryResultCache!.remove(["Currency"]);
			return { message: "Currency is Deleted" };
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No Currency Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${error.Message}`
			);
		}
	}
}
