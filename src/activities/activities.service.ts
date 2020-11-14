import { Injectable, NotFoundException, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ActivitylogRepository } from "./activities.repository";
import { LoginLogRepository } from "./loginlog.repository";
import { ListActivityDto } from "./dto/list-activities.dto";
import { ActivityLog } from "src/entity/activity-log.entity";
import { errorMessage } from "src/config/common.config";
import { LoginLog } from "src/entity/login-log.entity";

@Injectable()
export class ActivitiesService {
	constructor(
		@InjectRepository(ActivitylogRepository)
		private activitylogRepository: ActivitylogRepository,

		@InjectRepository(LoginLogRepository)
		private LoginLogRepository: LoginLogRepository
	) {}

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
}
