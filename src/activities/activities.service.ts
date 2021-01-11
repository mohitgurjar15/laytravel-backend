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
import { ExportSearchLogDto } from "./dto/export-search-log.dto";

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
		const { limit, page_no, searchDate, userId, source_location, destination_location, departure_date, arrival_date, flight_class,
			name, type, check_in_date, check_out_date, adult_count, number_and_children_ages = []
		} = paginationOption

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

		var search = {};

		if (source_location) {
			search['source_location'] = source_location
		}

		if (destination_location) {
			search['destination_location'] = destination_location
		}

		if (arrival_date) {
			search['arrival_date'] = arrival_date
		}

		if (departure_date) {
			search['departure_date'] = departure_date
		}

		if (flight_class) {
			search['flight_class'] = flight_class
		}

		if (name) {
			search["name"] = name
		}

		if (type) {
			search["type"] = type
		}

		if (check_in_date) {
			search["check_in_date"] = check_in_date
		}

		if (check_out_date) {
			search["check_out_date"] = check_out_date
		}

		if (adult_count) {
			search["adult_count"] = Number(adult_count)
		}

		if (number_and_children_ages.length != 0) {
			let age = number_and_children_ages.map((age) => Number(age));
			search["number_and_children_ages"] = age;
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

	async exportSearchLog(
		paginationOption: ExportSearchLogDto
	) {
		const { searchDate, userId, source_location, destination_location, departure_date, arrival_date, flight_class,
			name, type, adult_count, number_and_children_ages = [], check_in_date, check_out_date } = paginationOption


		let where;
		where = `1=1 `
		if (searchDate) {
			where += `AND (DATE("log"."created_date") = '${searchDate}') `;
		}
		if (userId) {
			where += `AND ("log"."user_id" = '${userId}')`;
		}

		var search = {};

		if (source_location) {
			search['source_location'] = source_location
		}

		if (destination_location) {
			search['destination_location'] = destination_location
		}

		if (arrival_date) {
			search['arrival_date'] = arrival_date
		}

		if (departure_date) {
			search['departure_date'] = departure_date
		}

		if (flight_class) {
			search['flight_class'] = flight_class
		}

		if (name) {
			search["name"] = name
		}

		if (type) {
			search["type"] = type
		}

		if (check_in_date) {
			search["check_in_date"] = check_in_date
		}

		if (check_out_date) {
			search["check_out_date"] = check_out_date
		}

		if (adult_count) {
			search["adult_count"] = Number(adult_count)
		}

		if (number_and_children_ages.length != 0) {
			let age = number_and_children_ages.map((age) => Number(age));
			search["number_and_children_ages"] = age;
		}

		const query = await getConnection()
			.createQueryBuilder(SearchLog, "log")
			.where(where)


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
