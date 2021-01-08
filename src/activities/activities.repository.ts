import { EntityRepository, Repository, getManager } from "typeorm";
import { ActivityLog } from "src/entity/activity-log.entity";
import { ListActivityDto } from "./dto/list-activities.dto";
import { NotFoundException } from "@nestjs/common";
import { ExportActivityDto } from "./dto/activity-export.dto";

@EntityRepository(ActivityLog)
export class ActivitylogRepository extends Repository<ActivityLog> {


	async activityLogList(
		paginationOption: ListActivityDto
	): Promise<{ data: ActivityLog[]; TotalReseult: number }> {
		const { page_no, search, limit, searchDate, userId } = paginationOption;

		const take = limit || 10;
		const skip = (page_no - 1) * limit || 0;
		const keyword = search || "";

		let where;
		where = `1=1 `
		if (searchDate) {
			where += `AND (DATE("log"."created_date") = '${searchDate}') `;
		}
		if (userId) {
			where += `AND ("log"."user_id" = '${userId}')`;
		}
		if (keyword) {
			where += `AND (("log"."module_name" ILIKE '%${keyword}%') or ("log"."activity_name" ILIKE '%${keyword}%'))`;
		}



		const [result, count] = await getManager()
			.createQueryBuilder(ActivityLog, "log")
			.leftJoinAndSelect("log.user", "user")
			.select([
				"user.userId",
				"user.firstName",
				"user.lastName",
				"user.email",
				"log.id",
				"log.moduleName",
				"log.activityName",
				"log.createdDate",
				"log.previousValue",
				"log.currentValue",

			])

			.where(where)
			.skip(skip)
			.take(take)
			.orderBy("log.id", "DESC")
			.getManyAndCount();

		if (!result.length) {
			throw new NotFoundException(`No Log found.`);
		}

		for await (const raw of result) {
			if (raw.currentValue) {
				if (raw.currentValue['password'] != undefined) {
					delete (raw.currentValue['password'])
				}

				if (raw.currentValue['salt'] != undefined) {
					delete (raw.currentValue['salt'])
				}
			}

			if (raw.previousValue) {
				if (raw.previousValue['password'] != undefined) {
					delete (raw.previousValue['password'])
				}

				if (raw.previousValue['salt'] != undefined) {
					delete (raw.previousValue['salt'])
				}
			}
		}
		return { data: result, TotalReseult: count };

	}


	async exportActivityLog(
		paginationOption: ExportActivityDto
	): Promise<{ data: ActivityLog[]; TotalReseult: number }> {
		const { search, searchDate, userId } = paginationOption;

		const keyword = search || "";

		let where;
		where = `1=1 `
		if (searchDate) {
			where += `AND (DATE("log"."created_date") = '${searchDate}') `;
		}
		if (userId) {
			where += `AND ("log"."user_id" = '${userId}')`;
		}
		if (keyword) {
			where += `AND (("log"."module_name" ILIKE '%${keyword}%') or ("log"."activity_name" ILIKE '%${keyword}%'))`;
		}



		const [result, count] = await getManager()
			.createQueryBuilder(ActivityLog, "log")
			.leftJoinAndSelect("log.user", "user")
			.select([
				"user.userId",
				"user.firstName",
				"user.lastName",
				"user.email",
				"log.id",
				"log.moduleName",
				"log.activityName",
				"log.createdDate",
				"log.previousValue",
				"log.currentValue",
			])
			.where(where)
			.orderBy("log.id", "DESC")
			.getManyAndCount();

		if (!result.length) {
			throw new NotFoundException(`No Log found.`);
		}

		for await (const raw of result) {
			if (raw.currentValue) {
				if (raw.currentValue['password'] != undefined) {
					delete (raw.currentValue['password'])
				}

				if (raw.currentValue['salt'] != undefined) {
					delete (raw.currentValue['salt'])
				}
			}

			if (raw.previousValue) {
				if (raw.previousValue['password'] != undefined) {
					delete (raw.previousValue['password'])
				}

				if (raw.previousValue['salt'] != undefined) {
					delete (raw.previousValue['salt'])
				}
			}
		}
		return { data: result, TotalReseult: count };
	}
}
