import {
	Injectable,
	NotFoundException,
	InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MarkupRepository } from "./markup.repository";
import { UpdateMarkupDto } from "./dto/updatemarkup.dto";
import { getManager, getConnection } from "typeorm";
import { Markup } from "src/entity/markup.entity";
import { User } from "src/entity/user.entity";
import { Activity } from "src/utility/activity.utility";

@Injectable()
export class MarkupService {
	constructor(
		@InjectRepository(MarkupRepository)
		private markupRepository: MarkupRepository
	) { }

	async updateMarkup(
		id: number,
		updateMarkupDto: UpdateMarkupDto,
		user: User
	): Promise<{ message: string }> {
		const { operator, operand } = updateMarkupDto;

		// let moduleDetaile = await getManager()
		// 	.createQueryBuilder(Module, "module")
		// 	.where(`id=:module_Id`, { module_id })
		// 	.getOne();
		// if (!moduleDetaile)
		// 	throw new BadRequestException(
		// 		`module id not exist with database.&&&module_id`
		// 	);

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

		//markupDetail.moduleId = module_id;
		//markupDetail.userType = user_type;
		markupDetail.operand = operand;
		markupDetail.operator = operator;
		markupDetail.updatedDate = new Date();

		try {
			markupDetail.save();
			await getConnection().queryResultCache!.remove(["markup"]);
			Activity.logActivity(user.userId, "markup", `Markup Updated by admin`);

			return { message: "Markup Updated Successfully" };
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

	async getMarkup(id) {
		try {
			const result = await getManager()
				.createQueryBuilder(Markup, "markup")
				.leftJoinAndSelect("markup.module", "module")
				.select([
					"markup.id",
					"module.name",
					"markup.userType",
					"markup.operator",
					"markup.operand",
					"markup.bookingType"
				])
				.where(`("markup"."id"=:id )`, { id })
				.getOne();

			if (!result) {
				throw new NotFoundException(`No markup found.`);
			}
			return { data: result };
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
