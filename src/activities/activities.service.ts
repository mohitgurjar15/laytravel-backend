import { Injectable, NotFoundException, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ActivitylogRepository } from "./activities.repository";
import { LoginLogRepository } from "./loginlog.repository";
import { ListActivityDto } from "./dto/list-activities.dto";
import { ActivityLog } from "src/entity/activity-log.entity";
import { errorMessage } from "src/config/common.config";
import { LoginLog } from "src/entity/login-log.entity";
import { ExportActivityDto } from "./dto/activity-export.dto";
import { ListSearchLogDto } from "./dto/list-search-log.dto";
import { getConnection } from "typeorm";
import { SearchLog } from "src/entity/search-log.entity";

@Injectable()
export class ActivitiesService {
	constructor(
		@InjectRepository(ActivitylogRepository)
		private activitylogRepository: ActivitylogRepository,

		@InjectRepository(LoginLogRepository)
		private LoginLogRepository: LoginLogRepository
	) { }

	async listActivityLog(
		paginationOption: ListActivityDto,
	): Promise<{ data: ActivityLog[]; TotalReseult: number }> {
		try {
			return await this.activitylogRepository.activityLogList(paginationOption);
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No log Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}

	async exportActivityLog(
		paginationOption: ExportActivityDto,
	): Promise<{ data: ActivityLog[]; TotalReseult: number }> {
		try {
			return await this.activitylogRepository.exportActivityLog(paginationOption);
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No log Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}






	async listloginlog(
		paginationOption: ListActivityDto,
	): Promise<{ data: LoginLog[]; TotalReseult: any }> {
		try {
			return await this.LoginLogRepository.loginLogList(paginationOption);
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No log Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}

	async listSearchLog(
		paginationOption: ListSearchLogDto
	) {
		const { limit, page_no, searchDate, search, userId } = paginationOption

		const take = limit || 10;
		const skip = (page_no - 1) * limit || 0;

		let where;
		where = `1=1 `
		if (searchDate) {
			where += `AND (DATE("log"."created_date") = '${searchDate}') `;
		}
		if (userId) {
			where += `AND ("log"."user_id" = '${userId}')`;
		}



		const query = await getConnection()
			.createQueryBuilder(SearchLog, "log")
			.where(where)
			.skip(skip)
			.take(take)
		console.log(search);

		if (search) {
			query.andWhere('search_log ::jsonb @> :searchLog', {
				searchLog: search,
			})
		}


		const [result, count] = await query.getManyAndCount();
		if (!result.length) {
			throw new NotFoundException(`No Log found.`);
		}
		return {
			data: result, count: count
		}
	}
}
