import {
	Injectable,
	BadRequestException,
	NotFoundException,
	InternalServerErrorException,
} from "@nestjs/common";
import { Module } from "src/entity/module.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { MarkupRepository } from "./markup.repository";
import { UpdateMarkupDto } from "./dto/updatemarkup.dto";
import { getManager, getConnection } from "typeorm";
import { Supplier } from "src/entity/supplier.entity";
import { User } from "@sentry/node";

@Injectable()
export class MarkupService {
	constructor(
		@InjectRepository(MarkupRepository)
		private markupRepository: MarkupRepository
	) {}

	async updateMarkup(
		id: number,
		updateMarkupDto: UpdateMarkupDto,
		user: User
	): Promise<{ message: string }> {
		const {
			module_id,
			user_type,
			operator,
			operand,
		} = updateMarkupDto;

		let moduleDetaile = await getManager()
			.createQueryBuilder(Module, "module")
			.where(`id=:module_Id`, { module_id })
			.getOne();
		if (!moduleDetaile)
			throw new BadRequestException(
				`module id not exist with database.&&&module_id`
			);

		// let supplierDetail = await getManager()
		// 	.createQueryBuilder(Supplier, "supplier")
		// 	.where(`id=:supplier_id `, {
		// 		supplier_id,
		// 	})
		// 	.getOne();
		// if (!supplierDetail)
		// 	throw new BadRequestException(
		// 		`supplier id not exist with database.&&&supplier_id`
		// 	);
		let markupDetail = await this.markupRepository.findOne({ id });

		if (!markupDetail) throw new NotFoundException(`markup id not found`);

		markupDetail.moduleId = module_id;
		markupDetail.userType = user_type;
		markupDetail.operand = operand;
		markupDetail.operator = operator;
		markupDetail.updatedDate = new Date();

		try {
            markupDetail.save();
            await getConnection().queryResultCache!.remove(["markup"]);
			return { message: "markup Updated" };
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No markup Found.&&&id`);
			}
			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${error.Message}`
			);
		}
	}

	async listMarkup(): Promise<{ data: any }> {
		try {
			return await this.markupRepository.listMarkup();
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No any markup Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${error.Message}`
			);
		}
	}
}
